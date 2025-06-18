// ==================== 核心数据管理 ====================

// 图片数据存储管理
class ImageDataManager {
    constructor() {
      this.data = {
        pageBackground: null,
        headerImage: null,
        titleUpload: null,
        gameIcon: null,
        btnImage: null,
        footerLogo: null,
        footerBg: null,
        rulesBg: null
      };
      this.moduleData = {};
    }
    
    set(key, value) {
      this.data[key] = value;
    }
    
    get(key) {
      return this.data[key];
    }
    
    setModule(key, value) {
      this.moduleData[key] = value;
    }
    
    getModule(key) {
      return this.moduleData[key];
    }
    
    clear() {
      // 重置为初始状态，保持数据结构
      this.data = {
        pageBackground: null,
        headerImage: null,
        titleUpload: null,
        gameIcon: null,
        btnImage: null,
        footerLogo: null,
        footerBg: null,
        rulesBg: null
      };
      this.moduleData = {};
      console.log('图片管理器已清理');
    }
  }
  
  // 创建全局图片管理器实例并挂载到window对象
  window.imageManager = new ImageDataManager(); 