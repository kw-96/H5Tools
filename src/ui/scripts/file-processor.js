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
  
  // 切片大图方法
  async sliceLargeImage(imageData, sliceWidth = 750, sliceHeight = 1334) {
    try {
      console.log(`开始切片图片: ${imageData.name || '未知图片'}`);
      console.log(`目标切片尺寸: ${sliceWidth}x${sliceHeight}`);
      
      // 创建画布来处理图片
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('无法创建 Canvas 上下文');
      }
      
      // 从 Uint8Array 创建图片
      const blob = new Blob([imageData.data], { type: imageData.type || 'image/png' });
      const img = new Image();
      const imgUrl = URL.createObjectURL(blob);
      
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          URL.revokeObjectURL(imgUrl);
          reject(new Error('图片加载超时'));
        }, 30000); // 30秒超时
        
        img.onload = () => {
          clearTimeout(timeoutId);
          
          try {
            const originalWidth = img.width;
            const originalHeight = img.height;
            
            console.log(`原图尺寸: ${originalWidth}x${originalHeight}`);
            console.log(`切片尺寸: ${sliceWidth}x${sliceHeight}`);
            
            // 计算需要切片的数量
            const cols = Math.ceil(originalWidth / sliceWidth);
            const rows = Math.ceil(originalHeight / sliceHeight);
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
                  sliceWidth: sliceWidth,
                  sliceHeight: sliceHeight,
                  cols: cols,
                  rows: rows
                });
              }
            };
            
            // 生成每个切片
            for (let row = 0; row < rows; row++) {
              for (let col = 0; col < cols; col++) {
                // 计算当前切片的位置和尺寸
                const x = col * sliceWidth;
                const y = row * sliceHeight;
                const currentSliceWidth = Math.min(sliceWidth, originalWidth - x);
                const currentSliceHeight = Math.min(sliceHeight, originalHeight - y);
                
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
        
        img.onerror = () => {
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
}

// 创建文件处理器实例并挂载到window对象
window.fileProcessor = new FileProcessor(); 