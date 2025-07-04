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
          channel: channel,
          images: this.channelImages[channel] || {}
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
    const settingsContainer = document.getElementById('settingsContent');
    if (!settingsContainer) {
      console.error('❌ 找不到settingsContent元素');
      return;
    }
    const config = this.getChannelSettingsConfig(channel);
    let html = '';
    config.forEach((item, index) => {
      const itemHTML = this.generateSettingItemHTML(item, channel);
      html += itemHTML;
    });
    settingsContainer.innerHTML = html;
    // 自动回显已上传图片
    const images = this.channelImages[channel] || {};
    Object.keys(images).forEach(key => {
      const imageData = images[key];
      if (imageData && imageData.data) {
        const previewElement = document.getElementById(`${channel}-${key}-preview`);
        if (previewElement) {
          let src;
          if (typeof imageData.data === 'string') {
            src = 'data:' + (imageData.type || 'image/png') + ';base64,' + imageData.data;
          } else {
            const uint8Arr = new Uint8Array(imageData.data);
            let binary = '';
            for (let i = 0; i < uint8Arr.length; i++) {
              binary += String.fromCharCode(uint8Arr[i]);
            }
            const base64 = btoa(binary);
            src = 'data:' + (imageData.type || 'image/png') + ';base64,' + base64;
          }
          previewElement.innerHTML = `<img src="${src}" style="width: 100%; height: 100%; object-fit: contain;" onclick="document.getElementById('${channel}-${key}-input').click()">`;
        }
      }
    });
    // 绑定事件
    this.bindSettingsEvents(channel);
    // 注意：渠道设置图片不再自动加载，仅在当前会话中有效
  }

  // 获取渠道设置配置
  getChannelSettingsConfig(channel) {
    const configs = {
      'oppo': [
        { type: 'image', key: 'eggBreaking', label: '砸蛋样式', description: '推荐尺寸<br>864x512px' },
        { type: 'image', key: 'footerStyle', label: '尾版样式', description: '推荐尺寸<br>1080x289px' }
      ],
      'vivo': [
        { type: 'image', key: 'footerStyle', label: '尾版样式', description: '推荐尺寸<br>1080x289px' }
      ],
      'huawei': [
        { type: 'image', key: 'footerStyle', label: '尾版样式', description: '推荐尺寸<br>1080x289px' }
      ],
      'xiaomi': [

      ]
    };
    
    return configs[channel] || [];
  }

  // 生成设置项HTML
  generateSettingItemHTML(item, channel) {
    const { type, key, label, placeholder, description } = item;
    
    if (type === 'text') {
      return `
        <div class="setting-item">
          <div class="setting-header">
            <label class="setting-label">${label}</label>
          </div>
          <div class="setting-main">
            <input type="text" class="setting-input" id="${channel}-${key}" placeholder="${placeholder || ''}" data-key="${key}">
          </div>
          ${description ? `<div class="setting-footer"><div class="setting-description">${description}</div></div>` : ''}
        </div>
      `;
    } else if (type === 'textarea') {
      return `
        <div class="setting-item">
          <div class="setting-header">
            <label class="setting-label">${label}</label>
          </div>
          <div class="setting-main">
            <textarea class="setting-input setting-textarea" id="${channel}-${key}" placeholder="${placeholder || ''}" data-key="${key}"></textarea>
          </div>
          ${description ? `<div class="setting-footer"><div class="setting-description">${description}</div></div>` : ''}
        </div>
      `;
    } else if (type === 'image') {
      return `
        <div class="setting-item">
          <div class="setting-header">
            <label class="setting-label">${label}</label>
            ${description ? `<div class="setting-description">${description}</div>` : ''}
          </div>
          <div class="setting-main">
        <div class="setting-upload-group">
          <input type="file" accept="image/*" style="display:none" id="${channel}-${key}-input" data-key="${key}">
              <div class="setting-preview clickable-upload" id="${channel}-${key}-preview" onclick="document.getElementById('${channel}-${key}-input').click()">
                <div class="setting-preview-placeholder">
                  
                  <div class="upload-text">+</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }
    
    return '';
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
            // 处理图片文件（仅用于当前会话，不保存到存储）
            const storageKey = `${channel}-${key}`;
            const imageData = await window.fileProcessor.processImageFile(file, storageKey, true);
            
            // 更新预览
            this.updateImagePreview(channel, key, file);
            
            // 仅保存到内存中用于当前会话
            if (!this.channelImages[channel]) {
              this.channelImages[channel] = {};
            }
            this.channelImages[channel][key] = imageData;
            
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
            
            window.notificationSystem.show(`${key === 'eggBreaking' ? '砸蛋样式' : '尾版样式'}上传成功（仅当前会话有效）`, 'success');
          } catch (error) {
            console.error(`${channel}-${key} 图片上传失败:`, error);
            window.notificationSystem.show(`图片上传失败: ${error.message}`, 'error');
          }
        }
      });
    });
    
    // 注意：渠道设置图片不再从存储中加载，仅在当前会话中有效
  }

  // 更新图片预览
  updateImagePreview(channel, key, file) {
    const previewElement = document.getElementById(`${channel}-${key}-preview`);
    if (previewElement && file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewElement.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: contain;" onclick="document.getElementById('${channel}-${key}-input').click()">`;
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

  // 注意：saveChannelImageToLocal 函数已删除
  // 原因：渠道设置图片不再进行持久化保存

  // 注意：loadSavedChannelImages 函数已删除
  // 原因：渠道设置图片不再进行持久化保存，无需加载已保存的图片

  // 注意：clearOldChannelImages 函数已删除
  // 原因：渠道设置图片不再进行持久化保存，无需清理旧图片数据

  // 注意：updateImagePreviewFromData 函数已删除
  // 原因：仅在 loadSavedChannelImages 中被调用，现在不再需要
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