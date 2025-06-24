// ==================== 渠道管理器模块 ====================

// 使用全局存储适配器（已在utility-functions.js中声明）
// 注意：不要重复声明storageAdapter，避免Figma沙盒环境中的重复声明错误

class ChannelManager {
  constructor() {
    this.channelImages = {};
  }

  // 渠道预览功能
  previewChannel(channel) {
    const previewArea = document.getElementById(`${channel}-preview`);
    
    // 显示加载状态
    previewArea.innerHTML = `
      <div class="preview-placeholder">
        <span>正在生成预览...</span>
      </div>
    `;

    // 模拟预览生成过程（后续完善）
    setTimeout(() => {
      previewArea.innerHTML = `
        <div class="preview-placeholder">
          <span>${channel.toUpperCase()} 版本预览</span>
          <div style="margin-top: 8px; font-size: 12px; color: #666;">
            预览功能正在开发中
          </div>
        </div>
      `;
    }, 1000);
  }

  // 渠道生成功能
  generateChannel(channel) {
    try {
      // 显示加载状态
      window.notificationSystem.showLoading();
      
      // 发送消息到插件主线程
      parent.postMessage({
        pluginMessage: {
          type: 'channel-generate',
          channel: channel
        }
      }, '*');
      
    } catch (error) {
      console.error('生成渠道版本失败:', error);
              window.notificationSystem.hideLoading();
        window.notificationSystem.show(`生成 ${channel.toUpperCase()} 版本失败`, 'error');
    }
  }

  // 渠道设置功能
  showChannelSettings(channel) {
    try {
      console.log(`打开 ${channel.toUpperCase()} 渠道设置`);
      
      // 隐藏主视图，显示设置视图
      const mainView = document.getElementById('channelsMainView');
      const settingsView = document.getElementById('channelSettingsView');
      
      if (mainView) {
        mainView.style.display = 'none';
      }
      
      if (settingsView) {
        // 🔧 关键修复：移除hidden类并确保显示
        settingsView.classList.remove('hidden');
        settingsView.style.display = 'block';
        settingsView.style.visibility = 'visible';
        console.log('🔧 设置视图显示状态已更新');
      } else {
        console.error('❌ 找不到channelSettingsView元素');
        return;
      }
      
      // 更新设置标题
      const settingsTitle = document.getElementById('settingsTitle');
      if (settingsTitle) {
        settingsTitle.textContent = `${this.getChannelDisplayName(channel)} 设置`;
      }
      
      // 生成设置内容
      this.generateChannelSettingsContent(channel);
      
      // 滚动到页面顶部 - 针对Figma插件环境
      requestAnimationFrame(() => {
        try {
          // 查找并滚动所有可能的滚动容器
          const scrollableContainers = [
            document.documentElement,
            document.body,
            document.querySelector('.container'),
            document.querySelector('.main-content'),
            document.querySelector('#app'),
            document.getElementById('channelSettingsView')
          ].filter(Boolean);
          
          scrollableContainers.forEach(container => {
            if (container) {
              container.scrollTop = 0;
              // 也尝试scrollLeft以防万一
              if (container.scrollLeft !== undefined) {
                container.scrollLeft = 0;
              }
            }
          });
          
          // 尝试将设置标题滚动到视图中
          const settingsTitle = document.getElementById('settingsTitle');
          if (settingsTitle) {
            settingsTitle.scrollIntoView({
              behavior: 'auto',
              block: 'start'
            });
          }
          
          console.log('已尝试滚动到顶部');
        } catch (scrollError) {
          console.warn('滚动操作失败:', scrollError);
        }
      });
      
      // 显示成功提示
      if (window.notificationSystem) {
        window.notificationSystem.show(`已进入 ${this.getChannelDisplayName(channel)} 设置页面`, 'info');
      }
      
    } catch (error) {
      console.error('打开渠道设置失败:', error);
      if (window.notificationSystem) {
        window.notificationSystem.show(`打开 ${this.getChannelDisplayName(channel)} 设置失败`, 'error');
      }
    }
  }

  // 返回渠道列表
  backToChannelsList() {
    const mainView = document.getElementById('channelsMainView');
    const settingsView = document.getElementById('channelSettingsView');
    
    if (settingsView) {
      settingsView.style.display = 'none';
      settingsView.classList.add('hidden');
    }
    
    if (mainView) {
      mainView.style.display = 'block';
    }
  }

  // 获取渠道显示名称
  getChannelDisplayName(channel) {
    const channelNames = {
      'oppo': 'OPPO',
      'vivo': 'VIVO', 
      'huawei': '华为',
      'xiaomi': '小米'
    };
    return channelNames[channel] || channel.toUpperCase();
  }

  // 生成渠道设置内容
  generateChannelSettingsContent(channel) {
    console.log(`🔍 开始生成 ${channel} 渠道设置内容`);
    
    const settingsContainer = document.getElementById('settingsContent');
    console.log('🔍 settingsContainer 元素:', settingsContainer);
    
    if (!settingsContainer) {
      console.error('❌ 找不到settingsContent元素');
      return;
    }
    
    const config = this.getChannelSettingsConfig(channel);
    console.log(`🔍 ${channel} 渠道配置:`, config);
    
    let html = '';
    config.forEach((item, index) => {
      const itemHTML = this.generateSettingItemHTML(item, channel);
      console.log(`🔍 生成第${index + 1}个设置项:`, item, 'HTML:', itemHTML);
      html += itemHTML;
    });
    
    console.log(`🔍 最终生成的HTML长度: ${html.length}字符`);
    console.log('🔍 最终生成的HTML:', html);
    
    settingsContainer.innerHTML = html;
    console.log('✅ HTML已设置到settingsContainer');
    
    // 验证HTML是否正确设置
    console.log('🔍 设置后的settingsContainer内容:', settingsContainer.innerHTML);
    console.log('🔍 设置后的settingsContainer子元素数量:', settingsContainer.children.length);
    
    // 🔧 新增：CSS样式调试
    const settingsView = document.getElementById('channelSettingsView');
    const settingsContent = document.getElementById('settingsContent');
    
    console.log('🎨 CSS调试信息:');
    console.log('- 设置视图显示:', settingsView ? window.getComputedStyle(settingsView).display : '元素不存在');
    console.log('- 设置视图可见:', settingsView ? window.getComputedStyle(settingsView).visibility : '元素不存在');
    console.log('- 设置内容显示:', settingsContent ? window.getComputedStyle(settingsContent).display : '元素不存在');
    console.log('- 设置内容高度:', settingsContent ? window.getComputedStyle(settingsContent).height : '元素不存在');
    
    // 检查第一个设置项
    const firstItem = settingsContainer.querySelector('.setting-item');
    if (firstItem) {
      console.log('- 第一个设置项显示:', window.getComputedStyle(firstItem).display);
      console.log('- 第一个设置项高度:', window.getComputedStyle(firstItem).height);
      console.log('- 第一个设置项边距:', window.getComputedStyle(firstItem).marginBottom);
    } else {
      console.log('- ❌ 找不到第一个设置项');
    }
    
    // 绑定事件
    this.bindSettingsEvents(channel);
    
    // 加载已保存的图片
    this.loadSavedChannelImages(channel);
    
    console.log('✅ 渠道设置内容生成完成');
  }

  // 获取渠道设置配置
  getChannelSettingsConfig(channel) {
    const configs = {
      'oppo': [
        { type: 'image', key: 'eggBreaking', label: '砸蛋样式', description: '推荐尺寸：864x512px' },
        { type: 'image', key: 'footerStyle', label: '尾版样式', description: '推荐尺寸：1080x289px' }
      ],
      'vivo': [
        { type: 'image', key: 'eggBreaking', label: '砸蛋样式', description: '推荐尺寸：864x512px' },
        { type: 'image', key: 'footerStyle', label: '尾版样式', description: '推荐尺寸：1080x289px' }
      ],
      'huawei': [
        { type: 'image', key: 'eggBreaking', label: '砸蛋样式', description: '推荐尺寸：864x512px' },
        { type: 'image', key: 'footerStyle', label: '尾版样式', description: '推荐尺寸：1080x289px' }
      ],
      'xiaomi': [
        { type: 'image', key: 'eggBreaking', label: '砸蛋样式', description: '推荐尺寸：864x512px' },
        { type: 'image', key: 'footerStyle', label: '尾版样式', description: '推荐尺寸：1080x289px' }
      ]
    };
    
    return configs[channel] || [];
  }

  // 生成设置项HTML
  generateSettingItemHTML(item, channel) {
    const { type, key, label, placeholder, description } = item;
    
    let inputHTML = '';
    
    if (type === 'text') {
      inputHTML = `<input type="text" class="setting-input" id="${channel}-${key}" placeholder="${placeholder || ''}" data-key="${key}">`;
    } else if (type === 'textarea') {
      inputHTML = `<textarea class="setting-input setting-textarea" id="${channel}-${key}" placeholder="${placeholder || ''}" data-key="${key}"></textarea>`;
    } else if (type === 'image') {
      inputHTML = `
        <div class="setting-upload-group">
          <input type="file" accept="image/*" style="display:none" id="${channel}-${key}-input" data-key="${key}">
          <button type="button" class="setting-upload-btn" onclick="document.getElementById('${channel}-${key}-input').click()">选择图片</button>
          <div class="setting-preview" id="${channel}-${key}-preview">
            <div class="setting-preview-placeholder">预览</div>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="setting-item">
        <label class="setting-label">${label}</label>
        ${inputHTML}
        ${description ? `<div class="setting-description">${description}</div>` : ''}
      </div>
    `;
  }

  // 绑定设置事件
  bindSettingsEvents(channel) {
    // 绑定文本输入事件
    const textInputs = document.querySelectorAll(`#settingsContent input[type="text"], #settingsContent textarea`);
    textInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const key = e.target.dataset.key;
        const value = e.target.value;
        this.saveChannelSetting(channel, key, value);
      });
    });

    // 绑定图片上传事件
    const imageInputs = document.querySelectorAll(`#settingsContent input[type="file"]`);
    imageInputs.forEach(input => {
      input.addEventListener('change', async (e) => {
        const key = e.target.dataset.key;
        const file = e.target.files[0];
        if (file) {
          try {
            // 处理图片文件并保存到图片管理器
            const storageKey = `${channel}-${key}`;
            const imageData = await window.fileProcessor.processImageFile(file, storageKey, true);
            
            // 更新预览
            this.updateImagePreview(channel, key, file);
            
            // 保存到本地存储
            this.saveChannelImageToLocal(channel, key, imageData);
            
            // 通知主程序图片已上传
            window.pluginComm.postMessage('channel-image-uploaded', {
              channel: channel,
              imageType: key,
              imageData: {
                data: Array.from(imageData.data), // 转换为数组以便传输
                width: imageData.width,
                height: imageData.height,
                name: imageData.name,
                type: imageData.type
              }
            });
            
            window.notificationSystem.show(`${key === 'eggBreaking' ? '砸蛋样式' : '尾版样式'}上传成功`, 'success');
          } catch (error) {
            console.error(`${channel}-${key} 图片上传失败:`, error);
            window.notificationSystem.show(`图片上传失败: ${error.message}`, 'error');
          }
        }
      });
    });
    
    // 加载已保存的图片
    this.loadSavedChannelImages(channel);
  }

  // 更新图片预览
  updateImagePreview(channel, key, file) {
    const previewElement = document.getElementById(`${channel}-${key}-preview`);
    if (previewElement && file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewElement.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: contain;">`;
      };
      reader.readAsDataURL(file);
    }
  }

  // 保存渠道设置
  async saveChannelSetting(channel, key, value) {
    try {
      const storageKey = `channel-settings-${channel}`;
      let settings = {};
      
      try {
        const stored = await window.storageAdapter.getItem(storageKey);
        if (stored) {
          settings = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('读取渠道设置失败，使用默认设置');
      }
      
      settings[key] = value;
      await window.storageAdapter.setItem(storageKey, JSON.stringify(settings));
      
      console.log(`${channel} 渠道设置已保存:`, { [key]: value });
      
    } catch (error) {
      console.error('保存渠道设置失败:', error);
      if (window.notificationSystem) {
        window.notificationSystem.show('设置保存失败', 'error');
      }
    }
  }

  // 保存渠道图片到本地存储
  async saveChannelImageToLocal(channel, imageType, imageData) {
    const storageKey = `channel-image-${channel}-${imageType}`;
    const imageInfo = {
      data: Array.from(imageData.data),
      width: imageData.width,
      height: imageData.height,
      name: imageData.name,
      type: imageData.type,
      timestamp: Date.now()
    };
    
    try {
      await window.storageAdapter.setItem(storageKey, JSON.stringify(imageInfo));
      console.log(`${channel} ${imageType} 图片已保存到本地`);
      
      // 更新内存中的图片数据
      if (!this.channelImages[channel]) {
        this.channelImages[channel] = {};
      }
      this.channelImages[channel][imageType] = imageData;
      
      // 清理旧的图片数据（避免存储空间过满）
      this.clearOldChannelImages();
      
    } catch (error) {
      console.error('保存图片到本地失败:', error);
      // 如果存储空间不足，尝试清理旧数据
      if (error.name === 'QuotaExceededError') {
        try {
          await this.clearOldChannelImages();
          await window.storageAdapter.setItem(storageKey, JSON.stringify(imageInfo));
          console.log('清理后重新保存图片成功');
        } catch (retryError) {
          console.error('清理后仍然保存失败:', retryError);
          if (window.notificationSystem) {
            window.notificationSystem.show('存储空间不足，请清理浏览器缓存', 'error');
          }
        }
      } else {
        if (window.notificationSystem) {
          window.notificationSystem.show('图片保存失败', 'error');
        }
      }
    }
  }

  // 加载已保存的渠道图片
  async loadSavedChannelImages(channel) {
    const imageTypes = ['eggBreaking', 'footerStyle'];
    
    for (const imageType of imageTypes) {
      try {
        const storageKey = `channel-image-${channel}-${imageType}`;
        const saved = await window.storageAdapter.getItem(storageKey);
        
        if (saved) {
          const imageInfo = JSON.parse(saved);
          const imageData = {
            data: new Uint8Array(imageInfo.data),
            width: imageInfo.width,
            height: imageInfo.height,
            name: imageInfo.name,
            type: imageInfo.type
          };
          
          // 保存到图片管理器
          const managerKey = `${channel}-${imageType}`;
          if (window.imageManager) {
            window.imageManager.setModule(managerKey, imageData);
          }
          
          // 更新预览
          this.updateImagePreviewFromData(channel, imageType, imageData);
          
          // 更新内存中的图片数据
          if (!this.channelImages[channel]) {
            this.channelImages[channel] = {};
          }
          this.channelImages[channel][imageType] = imageData;
          
          console.log(`已加载 ${channel} ${imageType} 图片`);
        }
      } catch (error) {
        console.error(`加载 ${channel} ${imageType} 图片失败:`, error);
      }
    }
  }

  // 清理旧的渠道图片数据
  async clearOldChannelImages() {
    try {
      const MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB存储限制
      const MAX_IMAGES_PER_CHANNEL_TYPE = 1; // 每个渠道每种类型最多保留1张图片
      
      const keys = await window.storageAdapter.getAllKeys();
      const channelImageKeys = keys.filter(key => key.startsWith('channel-image-'));
      
      // 计算当前存储使用量
      let totalSize = 0;
      const allImageData = [];
      
      for (const key of channelImageKeys) {
        try {
          const data = await window.storageAdapter.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            const size = JSON.stringify(parsed).length * 2; // 估算字节大小
            totalSize += size;
            
            allImageData.push({
              key,
              timestamp: parsed.timestamp || 0,
              size,
              channel: parsed.channel || 'unknown',
              imageType: parsed.imageType || 'unknown'
            });
          }
        } catch (error) {
          console.warn(`解析图片数据失败: ${key}`, error);
          // 删除损坏的数据
          await window.storageAdapter.removeItem(key);
        }
      }
      
      console.log(`当前渠道图片存储使用量: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
      
      let imagesToDelete = [];
      
      // 1. 基于渠道类型数量的清理：每个渠道每种类型只保留1张最新的
      const channelTypeGroups = {};
      
      for (const imageData of allImageData) {
        const groupKey = `${imageData.channel}-${imageData.imageType}`;
        if (!channelTypeGroups[groupKey]) {
          channelTypeGroups[groupKey] = [];
        }
        channelTypeGroups[groupKey].push(imageData);
      }
      
      // 对每个组按时间戳排序，保留最新的1张，其余标记删除
      for (const [groupKey, images] of Object.entries(channelTypeGroups)) {
        if (images.length > MAX_IMAGES_PER_CHANNEL_TYPE) {
          // 按时间戳降序排序（最新的在前）
          images.sort((a, b) => b.timestamp - a.timestamp);
          
          // 保留最新的1张，其余删除
          const toDelete = images.slice(MAX_IMAGES_PER_CHANNEL_TYPE);
          imagesToDelete.push(...toDelete);
          
          console.log(`渠道类型 ${groupKey}: 保留1张最新图片，删除${toDelete.length}张旧图片`);
        }
      }
      
      // 2. 基于存储容量的清理：如果总容量超过限制，继续删除最旧的图片
      if (totalSize > MAX_STORAGE_SIZE) {
        const remainingImages = allImageData.filter(img => 
          !imagesToDelete.some(delImg => delImg.key === img.key)
        );
        
        // 按时间戳升序排序（最旧的在前）
        remainingImages.sort((a, b) => a.timestamp - b.timestamp);
        
        let currentSize = totalSize - imagesToDelete.reduce((sum, img) => sum + img.size, 0);
        
        for (const imageData of remainingImages) {
          if (currentSize <= MAX_STORAGE_SIZE) break;
          
          imagesToDelete.push(imageData);
          currentSize -= imageData.size;
          console.log(`容量清理: 删除图片 ${imageData.key} (${(imageData.size / 1024).toFixed(1)}KB)`);
        }
      }
      
      // 执行删除操作
      let deletedCount = 0;
      let deletedSize = 0;
      
      for (const imageData of imagesToDelete) {
        try {
          await window.storageAdapter.removeItem(imageData.key);
          deletedCount++;
          deletedSize += imageData.size;
          console.log(`已删除旧图片: ${imageData.key}`);
        } catch (error) {
          console.error(`删除图片失败: ${imageData.key}`, error);
        }
      }
      
      const finalSize = totalSize - deletedSize;
      console.log(`清理完成: 删除${deletedCount}张图片，释放${(deletedSize / 1024 / 1024).toFixed(2)}MB空间`);
      console.log(`当前存储使用量: ${(finalSize / 1024 / 1024).toFixed(2)}MB`);
      
      return {
        deletedCount,
        deletedSize,
        finalSize,
        success: true
      };
      
    } catch (error) {
      console.error('清理旧图片失败:', error);
      return {
        deletedCount: 0,
        deletedSize: 0,
        finalSize: 0,
        success: false,
        error: error.message
      };
    }
  }

  // 从图片数据更新预览
  updateImagePreviewFromData(channel, imageType, imageData) {
    try {
      const preview = document.getElementById(`${channel}-${imageType}-preview`);
      if (preview && imageData) {
        const blob = new Blob([imageData.data], { type: imageData.type });
        const url = URL.createObjectURL(blob);
        
        preview.innerHTML = `<img src="${url}" alt="预览" onload="URL.revokeObjectURL(this.src)">`;
      }
    } catch (error) {
      console.error('更新图片预览失败:', error);
    }
  }
}

// 创建全局渠道管理器实例
const channelManager = new ChannelManager();

// 导出供其他模块使用
window.channelManager = channelManager;

// 兼容性函数 - 供HTML onclick事件使用
window.previewChannel = function(channel) {
  channelManager.previewChannel(channel);
};

window.generateChannel = function(channel) {
  channelManager.generateChannel(channel);
};

window.showChannelSettings = function(channel) {
  channelManager.showChannelSettings(channel);
};

window.backToChannelsList = function() {
  channelManager.backToChannelsList();
}; 