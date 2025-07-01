// ==================== 图片上传管理器模块 ====================

// 图片上传处理类
class ImageUploader {
  init() {
    this.bindImageUploaders();
    this.bindModuleImageUploaders();
  }
  
  bindImageUploaders() {
    // 绑定基础图片上传
    const uploaders = [
      { id: 'pageBackground', key: 'pageBackground' },
      { id: 'headerImage', key: 'headerImage' },
      { id: 'titleUpload', key: 'titleUpload' },
      { id: 'gameIconUpload', key: 'gameIcon' },
      { id: 'iconButtonBgUpload', key: 'iconButtonBg' },
      { id: 'singleButtonBgUpload', key: 'singleButtonBg' },
      { id: 'leftButtonBgUpload', key: 'leftButtonBg' },
      { id: 'rightButtonBgUpload', key: 'rightButtonBg' },
      { id: 'footerLogoUpload', key: 'footerLogo' },
      { id: 'footerBgUpload', key: 'footerBg' },
      { id: 'rulesBgUpload', key: 'rulesBgImage' }
    ];
    
    uploaders.forEach(uploader => {
      const input = document.getElementById(uploader.id);
      if (input) {
        input.addEventListener('change', (e) => this.handleImageUpload(e, uploader.key));
      }
    });
  }

  handleImageUpload(e, storageKey) {
    this.handleUpload(e.target, storageKey, false);
  }      
  
  bindModuleImageUploaders() {
    // 🔧 统一使用事件委托处理模块内的图片上传，避免重复绑定
    document.addEventListener('change', (e) => {
      if (e.target.type === 'file' && e.target.accept === 'image/*' && e.target.closest('.module')) {
        // 防止重复处理
        if (e.target.dataset.processing === 'true') return;
        e.target.dataset.processing = 'true';
        
        // 异步处理完成后清除标记
        setTimeout(() => {
          e.target.dataset.processing = 'false';
        }, 100);
        
        window.fileProcessor.handleModuleImageUpload(e);
      }
    });
  }
  
  // 🚨 移除重复的bindModuleUploaders方法，使用统一的事件委托
  
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
      'activity-content-image-upload': `${moduleId}-image`,
      'carousel-title-bg-upload': `${moduleId}-carousel-title-bg`,
      'carousel-image-upload': `${moduleId}-carousel-image`,
      'carousel-image-bg-upload': `${moduleId}-carousel-image-bg`,
      'vertical-carousel-title-bg-upload': `${moduleId}-vertical-title-bg`,
      'vertical-carousel-image-upload-1': `${moduleId}-vertical-image-1`,
      'vertical-carousel-image-upload-2': `${moduleId}-vertical-image-2`,
      'vertical-carousel-image-upload-3': `${moduleId}-vertical-image-3`
    };
    
    // 特殊处理奖品图片上传
    if (input.classList.contains('prize-upload')) {
      const prizeIndex = this.getPrizeIndex(input);
      return `${moduleId}-prize-${prizeIndex}`;
    }
    
    for (const [className, key] of Object.entries(classMap)) {
      if (input.classList.contains(className)) {
        return key;
      }
    }
    return null;
  }
  
  // 获取奖品在九宫格中的索引
  getPrizeIndex(input) {
    const moduleEl = input.closest('.module');
    if (!moduleEl) return 0;
    
    const prizeInputs = Array.from(moduleEl.querySelectorAll('.prize-upload'));
    return prizeInputs.indexOf(input);
  }
  
  async handleUpload(input, storageKey, isModule = false) {
    if (!input.files?.[0]) return;
    
    console.log(`开始处理图片上传: ${storageKey}, 文件:`, input.files[0].name);
    
    try {
      await window.fileProcessor.processImageFile(input.files[0], storageKey, isModule);
      
      // 更新预览
      this.updatePreview(input, storageKey);
      
      // 验证图片是否正确存储
      const storedData = isModule ? window.imageManager.getModule(storageKey) : window.imageManager.get(storageKey);
      console.log(`图片存储验证 ${storageKey}:`, storedData ? '成功' : '失败');
      
      window.notificationSystem.show('图片上传成功', 'success');
    } catch (error) {
      console.error(`图片上传失败 ${storageKey}:`, error);
      window.notificationSystem.show(`上传失败: ${error.message}`, 'error');
    }
  }
  
  updatePreview(input, storageKey) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewContainer = this.findPreviewContainer(input, storageKey);
      if (previewContainer) {
        this.renderPreview(previewContainer, e.target.result, storageKey);
      }
    };
    reader.readAsDataURL(file);
  }
  
  findPreviewContainer(input, storageKey) {
    // 特殊处理游戏icon预览
    if (storageKey === 'gameIcon') {
      return document.getElementById('gameIconPreview');
    }
    
    const uploadBtn = input.nextElementSibling;
    if (!uploadBtn) return null;
    
    if (input.classList.contains('prize-upload')) {
      return uploadBtn.querySelector('.preview-container');
    }
    
    return uploadBtn.querySelector('.img-preview-inline');
  }
  
  renderPreview(container, src, storageKey) {
    container.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.alt = "Preview";
    
    // 游戏icon使用特殊样式
    if (storageKey === 'gameIcon') {
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:8px';
      container.style.border = '1px solid rgba(0, 113, 227, 0.5)';
    } else {
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:8px';
    }
    
    container.appendChild(img);
    
    // 更新按钮样式
    const btn = container.closest('.upload-btn, .grid-btn');
    if (btn) {
      btn.style.border = '1px solid rgba(0, 113, 227, 0.5)';
    }
  }
}

// 创建全局图片上传管理器实例
const imageUploader = new ImageUploader();

// 导出供其他模块使用
window.imageUploader = imageUploader; 