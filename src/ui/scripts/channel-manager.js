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
          type: 'generate-channel',
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
      document.getElementById('channelsMainView').style.display = 'none';
      document.getElementById('channelSettingsView').style.display = 'block';
      
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
      
    } catch (error) {
      console.error('打开渠道设置失败:', error);
      window.notificationSystem.show('打开设置失败', 'error');
    }
  }

  // 返回渠道列表
  backToChannelsList() {
    document.getElementById('channelSettingsView').style.display = 'none';
    document.getElementById('channelsMainView').style.display = 'block';
  }

  // 获取渠道显示名称
  getChannelDisplayName(channel) {
    const channelNames = {
      'wechat': '微信',
      'qq': 'QQ',
      'weibo': '微博',
      'douyin': '抖音',
      'xiaohongshu': '小红书',
      'zhihu': '知乎',
      'bilibili': 'B站',
      'kuaishou': '快手'
    };
    return channelNames[channel] || channel.toUpperCase();
  }

  // 生成渠道设置内容
  generateChannelSettingsContent(channel) {
    const settingsContainer = document.getElementById('channelSettingsContainer');
    if (!settingsContainer) return;
    
    const config = this.getChannelSettingsConfig(channel);
    
    let html = '';
    config.forEach(item => {
      html += this.generateSettingItemHTML(item, channel);
    });
    
    settingsContainer.innerHTML = html;
    
    // 绑定事件
    this.bindSettingsEvents(channel);
    
    // 加载已保存的图片
    this.loadSavedChannelImages(channel);
  }

  // 获取渠道设置配置
  getChannelSettingsConfig(channel) {
    // 通用设置项
    const commonSettings = [
      { type: 'image', key: 'background', label: '背景图片', accept: 'image/*' },
      { type: 'image', key: 'logo', label: 'Logo图片', accept: 'image/*' },
      { type: 'color', key: 'primaryColor', label: '主色调', defaultValue: '#FF6B35' },
      { type: 'color', key: 'textColor', label: '文字颜色', defaultValue: '#333333' },
      { type: 'text', key: 'title', label: '页面标题', placeholder: '请输入页面标题' },
      { type: 'textarea', key: 'description', label: '页面描述', placeholder: '请输入页面描述' }
    ];
    
    // 渠道特定设置
    const channelSpecificSettings = {
      'wechat': [
        { type: 'text', key: 'appId', label: '微信AppID', placeholder: '请输入微信AppID' }
      ],
      'qq': [
        { type: 'text', key: 'qqNumber', label: 'QQ号码', placeholder: '请输入QQ号码' }
      ],
      // 其他渠道的特定设置...
    };
    
    return [...commonSettings, ...(channelSpecificSettings[channel] || [])];
  }

  // 生成设置项HTML
  generateSettingItemHTML(item, channel) {
    const { type, key, label, placeholder = '', accept = '', defaultValue = '' } = item;
    
    switch (type) {
      case 'image':
        return `
          <div class="setting-item">
            <label>${label}</label>
            <div class="image-upload-container">
              <input type="file" id="${channel}-${key}" accept="${accept}" style="display: none;">
              <button type="button" class="upload-btn" onclick="document.getElementById('${channel}-${key}').click()">
                <div class="img-preview-inline" id="${channel}-${key}-preview">
                  <span class="upload-icon-inline">+</span>
                </div>
              </button>
            </div>
          </div>
        `;
      case 'color':
        return `
          <div class="setting-item">
            <label>${label}</label>
            <div class="color-input-group">
              <input type="color" id="${channel}-${key}" value="${defaultValue}">
              <input type="text" class="color-value" value="${defaultValue}">
            </div>
          </div>
        `;
      case 'textarea':
        return `
          <div class="setting-item">
            <label>${label}</label>
            <textarea id="${channel}-${key}" placeholder="${placeholder}"></textarea>
          </div>
        `;
      default:
        return `
          <div class="setting-item">
            <label>${label}</label>
            <input type="text" id="${channel}-${key}" placeholder="${placeholder}">
          </div>
        `;
    }
  }

  // 绑定设置事件
  bindSettingsEvents(channel) {
    // 绑定图片上传事件
    const imageInputs = document.querySelectorAll(`input[type="file"][id^="${channel}-"]`);
    imageInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const key = input.id.replace(`${channel}-`, '');
          this.updateImagePreview(channel, key, file);
          
          // 保存图片到本地存储
          const reader = new FileReader();
          reader.onload = (event) => {
            this.saveChannelImageToLocal(channel, key, event.target.result);
          };
          reader.readAsDataURL(file);
        }
      });
    });
    
    // 绑定颜色输入事件
    const colorInputs = document.querySelectorAll(`input[type="color"][id^="${channel}-"]`);
    colorInputs.forEach(colorInput => {
      const textInput = colorInput.nextElementSibling;
      if (textInput && textInput.classList.contains('color-value')) {
        colorInput.addEventListener('input', () => {
          textInput.value = colorInput.value.toUpperCase();
          this.saveChannelSetting(channel, colorInput.id.replace(`${channel}-`, ''), colorInput.value);
        });
        
        textInput.addEventListener('input', () => {
          if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
            colorInput.value = textInput.value;
            this.saveChannelSetting(channel, colorInput.id.replace(`${channel}-`, ''), textInput.value);
          }
        });
      }
    });
    
    // 绑定文本输入事件
    const textInputs = document.querySelectorAll(`input[type="text"][id^="${channel}-"], textarea[id^="${channel}-"]`);
    textInputs.forEach(input => {
      if (!input.classList.contains('color-value')) {
        input.addEventListener('input', () => {
          this.saveChannelSetting(channel, input.id.replace(`${channel}-`, ''), input.value);
        });
      }
    });
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
      const storageKey = `channel-${channel}-${key}`;
      await window.storageAdapter.setItem(storageKey, value);
      console.log(`已保存 ${channel} 渠道设置: ${key} = ${value}`);
    } catch (error) {
      console.error('保存渠道设置失败:', error);
    }
  }

  // 保存渠道图片到本地存储
  async saveChannelImageToLocal(channel, imageType, imageData) {
    try {
      const storageKey = `channel-image-${channel}-${imageType}`;
      
      // 检查数据大小（localStorage 限制约5MB）
      const dataSize = new Blob([imageData]).size;
      if (dataSize > 4 * 1024 * 1024) { // 4MB 限制
        console.warn(`图片过大 (${Math.round(dataSize / 1024 / 1024)}MB)，可能无法保存到本地存储`);
        window.notificationSystem.show('图片文件过大，建议压缩后再上传', 'warning');
        return;
      }
      
      await window.storageAdapter.setItem(storageKey, imageData);
      console.log(`已保存 ${channel} 渠道图片: ${imageType}`);
      
      // 更新内存中的图片数据
      if (!this.channelImages[channel]) {
        this.channelImages[channel] = {};
      }
      this.channelImages[channel][imageType] = imageData;
      
      // 清理旧的图片数据（避免存储空间过满）
      this.clearOldChannelImages();
      
    } catch (error) {
      console.error('保存渠道图片失败:', error);
      if (error.name === 'QuotaExceededError') {
        window.notificationSystem.show('存储空间不足，请清理浏览器缓存', 'error');
      } else {
        window.notificationSystem.show('图片保存失败', 'error');
      }
    }
  }

  // 加载已保存的渠道图片
  async loadSavedChannelImages(channel) {
    try {
      const imageTypes = ['background', 'logo']; // 可以根据需要扩展
      
      for (const imageType of imageTypes) {
        const storageKey = `channel-image-${channel}-${imageType}`;
        const savedImageData = await window.storageAdapter.getItem(storageKey);
        
        if (savedImageData) {
          this.updateImagePreviewFromData(channel, imageType, savedImageData);
          
          // 更新内存中的图片数据
          if (!this.channelImages[channel]) {
            this.channelImages[channel] = {};
          }
          this.channelImages[channel][imageType] = savedImageData;
        }
      }
      
      console.log(`已加载 ${channel} 渠道的保存图片`);
    } catch (error) {
      console.error('加载渠道图片失败:', error);
    }
  }

  // 清理旧的渠道图片（保持存储空间）
  async clearOldChannelImages() {
    try {
      const keys = await window.storageAdapter.getAllKeys();
      const channelImageKeys = keys.filter(key => key.startsWith('channel-image-'));
      
      // 如果渠道图片过多，清理最旧的
      if (channelImageKeys.length > 20) { // 限制最多保存20个渠道图片
        const keysToRemove = channelImageKeys.slice(0, channelImageKeys.length - 20);
        for (const key of keysToRemove) {
          await window.storageAdapter.removeItem(key);
          console.log(`已清理旧的渠道图片: ${key}`);
        }
      }
    } catch (error) {
      console.error('清理旧渠道图片失败:', error);
    }
  }

  // 从数据更新图片预览
  updateImagePreviewFromData(channel, imageType, imageData) {
    const previewElement = document.getElementById(`${channel}-${imageType}-preview`);
    if (previewElement && imageData) {
      previewElement.innerHTML = `<img src="${imageData}" style="width: 100%; height: 100%; object-fit: contain;">`;
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