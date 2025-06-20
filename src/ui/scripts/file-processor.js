// ==================== 文件处理器 ====================

class FileProcessor {
  // 处理图片文件上传
  async processImageFile(file, storageKey, isModule = false) {
    if (!this.isValidImageFile(file)) {
      throw new Error('请上传有效的图片文件');
    }
    
    try {
      const uint8Array = await this.fileToUint8Array(file);
      
      // 获取图片尺寸
      const imageDimensions = await this.getImageDimensions(file);
      console.log(`图片上传成功: ${storageKey}, 大小: ${uint8Array.length} bytes, 尺寸: ${imageDimensions.width}x${imageDimensions.height}`);
      
      // 存储图片数据和尺寸信息
      const imageData = {
        data: uint8Array,
        width: imageDimensions.width,
        height: imageDimensions.height,
        name: file.name,
        type: file.type
      };
      
      if (isModule) {
        window.imageManager.setModule(storageKey, imageData);
      } else {
        window.imageManager.set(storageKey, imageData);
      }
      
      return imageData;
    } catch (error) {
      console.error(`图片处理失败: ${storageKey}`, error);
      throw new Error(`图片处理失败: ${error.message}`);
    }
  }

  async handleImageUpload(e, storageKey) {
    try {
      await this.handleUpload(e.target, storageKey, false);
    } catch (error) {
      console.error(`基础图片上传失败 ${storageKey}:`, error);
      window.notificationSystem.show(`上传失败: ${error.message}`, 'error');
    }
  }
  
  async handleUpload(input, storageKey, isModule = false) {
    if (!input.files?.[0]) return;
    
    console.log(`开始处理图片上传: ${storageKey}, 文件:`, input.files[0].name);
    
    try {
      await this.processImageFile(input.files[0], storageKey, isModule);
      
      // 验证图片是否正确存储
      const storedData = isModule ? window.imageManager.getModule(storageKey) : window.imageManager.get(storageKey);
      console.log(`图片存储验证 ${storageKey}:`, storedData ? '成功' : '失败');
      
      window.notificationSystem.show('图片上传成功', 'success');
    } catch (error) {
      console.error(`图片上传失败 ${storageKey}:`, error);
      window.notificationSystem.show(`上传失败: ${error.message}`, 'error');
    }
  }

  async handleModuleImageUpload(e) {
    try {
      const input = e.target;
      const moduleEl = input.closest('.module');
      if (!moduleEl) return;
      
      const moduleId = moduleEl.id;
      const storageKey = this.getModuleStorageKey(input, moduleId);
      
      if (storageKey) {
        await this.handleUpload(input, storageKey, true);
      }
    } catch (error) {
      console.error('模块图片上传失败:', error);
      window.notificationSystem.show(`模块图片上传失败: ${error.message}`, 'error');
    }
  }
  
  getModuleStorageKey(input, moduleId) {
    const classMap = {
      'derived-item-upload': `${moduleId}-titlebg`,
      'nine-grid-bg': `${moduleId}-gridbg`,
      'draw-btn': `${moduleId}-drawbtn`,
      'prize-bg': `${moduleId}-prizebg`,
      'sign-in-title-upload': `${moduleId}-title`,
      'sign-in-bg-upload': `${moduleId}-bg`,
      'day-icon-upload': `${moduleId}-dayicon`,
      'sign-in-btn-upload': `${moduleId}-signbtn`,
      'collect-title-upload': `${moduleId}-title`,
      'collect-bg-upload': `${moduleId}-bg`,
      'card-bg-upload': `${moduleId}-cardbg`,
      'combine-button-upload': `${moduleId}-combinebtn`,
      'activity-content-main-title-bg-upload': `${moduleId}-main-title-bg`,
      'activity-content-sub-title-bg-upload': `${moduleId}-sub-title-bg`,
      'activity-content-image-upload': `${moduleId}-image`
    };
    
    // 特殊处理奖品图片上传
    if (input.classList.contains('prize-upload')) {
      const prizeIndex = this.getPrizeIndex(input);
      return `${moduleId}-prize-${prizeIndex}`;
    }
    
    // 检查所有可能的类名匹配
    for (const [className, key] of Object.entries(classMap)) {
      if (input.classList.contains(className)) {
        return key;
      }
    }
    
    // 调试信息
    console.log(`未找到匹配的存储键，输入类名:`, input.className, `模块ID: ${moduleId}`);
    return null;
  }
  
  // 获取奖品在九宫格中的索引
  getPrizeIndex(input) {
    const moduleEl = input.closest('.module');
    if (!moduleEl) return 0;
    
    const prizeInputs = Array.from(moduleEl.querySelectorAll('.prize-upload'));
    return prizeInputs.indexOf(input);
  }

  // 获取图片尺寸
  async getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight
        });
        // 清理URL对象
        URL.revokeObjectURL(img.src);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error('无法读取图片尺寸'));
      };
      
      // 创建临时URL
      img.src = URL.createObjectURL(file);
    });
  }
  
  // 验证是否为有效图片文件
  isValidImageFile(file) {
    return file && file.type.startsWith('image/');
  }
  
  // 将文件转换为 Uint8Array
  fileToUint8Array(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const uint8Array = new Uint8Array(arrayBuffer);
        resolve(uint8Array);
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
      reader.readAsArrayBuffer(file);
    });
  }
  
  // 切片大图方法 - 使用智能切片策略
  async sliceLargeImage(imageData, sliceWidth = null, sliceHeight = null) {
    try {
      console.log(`开始切片图片: ${imageData.name || '未知图片'}`);
      
      // 🚨 修复：使用传入的切片策略，如果没有则使用智能策略
      let finalSliceWidth = sliceWidth;
      let finalSliceHeight = sliceHeight;
      
      // 如果没有指定切片尺寸，使用智能策略计算
      if (!sliceWidth || !sliceHeight) {
        const tempImg = new Image();
        const tempBlob = new Blob([new Uint8Array(imageData.bytes || imageData.data)], { type: imageData.type });
        const tempUrl = URL.createObjectURL(tempBlob);
        
        await new Promise((resolve, reject) => {
          tempImg.onload = resolve;
          tempImg.onerror = reject;
          tempImg.src = tempUrl;
        });
        
        // 使用智能策略计算切片尺寸
        const strategy = this.calculateSliceStrategy(tempImg.width, tempImg.height, 4096);
        finalSliceWidth = strategy.sliceWidth;
        finalSliceHeight = strategy.sliceHeight;
        
        console.log(`智能策略: ${strategy.description}`);
        console.log(`计算得出切片尺寸: ${finalSliceWidth}x${finalSliceHeight}`);
        
        URL.revokeObjectURL(tempUrl);
      }
      
      console.log(`目标切片尺寸: ${finalSliceWidth}x${finalSliceHeight}`);
      
      // 🚨 修复：确保图片数据格式正确
      let uint8ArrayData;
      if (imageData.bytes && Array.isArray(imageData.bytes)) {
        // 从插件传来的是Array格式，需要转换为Uint8Array
        console.log('检测到Array格式的图片数据，正在转换为Uint8Array...');
        uint8ArrayData = new Uint8Array(imageData.bytes);
      } else if (imageData.data instanceof Uint8Array) {
        // 已经是Uint8Array格式
        uint8ArrayData = imageData.data;
      } else if (imageData.data && Array.isArray(imageData.data)) {
        // data字段是Array格式
        console.log('检测到data字段为Array格式，正在转换为Uint8Array...');
        uint8ArrayData = new Uint8Array(imageData.data);
      } else {
        throw new Error('图片数据格式不正确，无法处理');
      }
      
      // 验证数据完整性
      if (!uint8ArrayData || uint8ArrayData.length === 0) {
        throw new Error('图片数据为空或损坏');
      }
      
      console.log(`图片数据大小: ${uint8ArrayData.length} bytes`);
      
      // 创建画布来处理图片
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建 Canvas 上下文');
      }
      
      // 从 Uint8Array 创建图片
      const blob = new Blob([uint8ArrayData], { type: imageData.type || 'image/png' });
      const img = new Image();
      const imgUrl = URL.createObjectURL(blob);
      
      console.log(`创建图片URL: ${imgUrl}`);
      console.log(`图片类型: ${imageData.type || 'image/png'}`);
      
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          URL.revokeObjectURL(imgUrl);
          reject(new Error('图片加载超时'));
        }, 30000); // 30秒超时
        
        img.onload = () => {
          console.log('图片加载成功');
          clearTimeout(timeoutId);
          
          try {
            const originalWidth = img.width;
            const originalHeight = img.height;
            
            console.log(`原图尺寸: ${originalWidth}x${originalHeight}`);
            console.log(`切片尺寸: ${finalSliceWidth}x${finalSliceHeight}`);
            
            // 计算需要切片的数量
            const cols = Math.ceil(originalWidth / finalSliceWidth);
            const rows = Math.ceil(originalHeight / finalSliceHeight);
            const totalSlices = cols * rows;
            
            console.log(`切片数量: ${cols}列 x ${rows}行 = ${totalSlices}片`);
            
            const slices = [];
            let completedSlices = 0;
            
            // 处理完成检查函数
            const checkCompletion = () => {
              if (completedSlices === totalSlices) {
                // 按行列顺序排序
                slices.sort((a, b) => {
                  if (a.row !== b.row) return a.row - b.row;
                  return a.col - b.col;
                });
                
                URL.revokeObjectURL(imgUrl);
                console.log(`图片切片完成，共 ${slices.length} 片`);
                
                resolve({
                  slices: slices,
                  originalWidth: originalWidth,
                  originalHeight: originalHeight,
                  sliceWidth: finalSliceWidth,
                  sliceHeight: finalSliceHeight,
                  cols: cols,
                  rows: rows
                });
              }
            };
            
                          // 生成每个切片
              for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                  // 计算当前切片的位置和尺寸
                  const x = col * finalSliceWidth;
                  const y = row * finalSliceHeight;
                  const currentSliceWidth = Math.min(finalSliceWidth, originalWidth - x);
                  const currentSliceHeight = Math.min(finalSliceHeight, originalHeight - y);
                
                // 设置画布尺寸
                canvas.width = currentSliceWidth;
                canvas.height = currentSliceHeight;
                
                // 清空画布
                ctx.clearRect(0, 0, currentSliceWidth, currentSliceHeight);
                
                // 绘制图片的对应部分
                ctx.drawImage(
                  img,
                  x, y, currentSliceWidth, currentSliceHeight,
                  0, 0, currentSliceWidth, currentSliceHeight
                );
                
                // 转换为 Uint8Array（使用立即执行函数保持作用域）
                ((currentRow, currentCol, sliceX, sliceY, width, height) => {
                  canvas.toBlob((blob) => {
                    if (!blob) {
                      completedSlices++;
                      console.warn(`切片 ${currentRow}_${currentCol} 创建失败`);
                      checkCompletion();
                      return;
                    }
                    
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      try {
                        const sliceData = new Uint8Array(e.target.result);
                        slices.push({
                          data: sliceData,
                          width: width,
                          height: height,
                          row: currentRow,
                          col: currentCol,
                          x: sliceX,
                          y: sliceY,
                          name: `slice_${currentRow}_${currentCol}.png`
                        });
                        
                        completedSlices++;
                        console.log(`切片进度: ${completedSlices}/${totalSlices}`);
                        checkCompletion();
                      } catch (sliceError) {
                        console.error(`切片 ${currentRow}_${currentCol} 处理失败:`, sliceError);
                        completedSlices++;
                        checkCompletion();
                      }
                    };
                    
                    reader.onerror = () => {
                      console.error(`切片 ${currentRow}_${currentCol} 读取失败`);
                      completedSlices++;
                      checkCompletion();
                    };
                    
                    reader.readAsArrayBuffer(blob);
                  }, 'image/png', 0.9); // 添加质量参数
                })(row, col, x, y, currentSliceWidth, currentSliceHeight);
              }
            }
            
          } catch (error) {
            clearTimeout(timeoutId);
            URL.revokeObjectURL(imgUrl);
            reject(error);
          }
        };
        
        img.onerror = (errorEvent) => {
          console.error('图片加载失败事件:', errorEvent);
          console.error('图片URL:', imgUrl);
          console.error('图片类型:', imageData.type);
          console.error('Blob大小:', blob.size);
          clearTimeout(timeoutId);
          URL.revokeObjectURL(imgUrl);
          reject(new Error('图片加载失败'));
        };
        
        img.src = imgUrl;
      });
    } catch (error) {
      console.error('图片切片失败:', error);
      throw error;
    }
  }

  // 🚨 新增：智能切片策略计算方法（与核心库保持一致）
  calculateSliceStrategy(width, height, maxSize = 4096) {
    const strategy = {
      direction: 'none',
      sliceWidth: width,
      sliceHeight: height,
      slicesCount: 1,
      description: '',
      cols: 1,
      rows: 1,
      totalSlices: 1
    };

    const widthExceeds = width > maxSize;
    const heightExceeds = height > maxSize;

    if (!widthExceeds && !heightExceeds) {
      // 不需要切割
      strategy.description = '图片尺寸正常，无需切割';
      return strategy;
    }

    if (widthExceeds && !heightExceeds) {
      // 只有宽度超限：垂直切割（保持高度）
      strategy.direction = 'vertical';
      strategy.sliceWidth = Math.floor(maxSize * 0.9); // 留10%安全边距
      strategy.sliceHeight = height;
      strategy.cols = Math.ceil(width / strategy.sliceWidth);
      strategy.rows = 1;
      strategy.slicesCount = strategy.cols;
      strategy.totalSlices = strategy.cols;
      strategy.description = `宽度超限，垂直切割为${strategy.slicesCount}片，每片${strategy.sliceWidth}×${height}`;
    } else if (!widthExceeds && heightExceeds) {
      // 只有高度超限：水平切割（保持宽度）
      strategy.direction = 'horizontal';
      strategy.sliceWidth = width;
      strategy.sliceHeight = Math.floor(maxSize * 0.9); // 留10%安全边距
      strategy.cols = 1;
      strategy.rows = Math.ceil(height / strategy.sliceHeight);
      strategy.slicesCount = strategy.rows;
      strategy.totalSlices = strategy.rows;
      strategy.description = `高度超限，水平切割为${strategy.slicesCount}片，每片${width}×${strategy.sliceHeight}`;
    } else {
      // 宽度和高度都超限：网格切割
      strategy.direction = 'both';
      strategy.sliceWidth = Math.floor(maxSize * 0.9);
      strategy.sliceHeight = Math.floor(maxSize * 0.9);
      strategy.cols = Math.ceil(width / strategy.sliceWidth);
      strategy.rows = Math.ceil(height / strategy.sliceHeight);
      strategy.slicesCount = strategy.cols * strategy.rows;
      strategy.totalSlices = strategy.cols * strategy.rows;
      strategy.description = `宽高都超限，网格切割为${strategy.cols}×${strategy.rows}=${strategy.slicesCount}片`;
    }

    return strategy;
  }
}

// 创建文件处理器实例并挂载到window对象
window.fileProcessor = new FileProcessor(); 