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
      // 类型保护：只允许存储ImageInfo类型，禁止Uint8Array
      this.data[key] = value;
    }
    
    get(key) {
      return this.data[key];
    }
    
    setModule(key, value) {
      // 类型保护：只允许存储ImageInfo类型，禁止Uint8Array
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
  
  // 注意：实例创建现在在global-init.js中统一管理 