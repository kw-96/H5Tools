// ==================== 插件通信管理 ====================

class PluginCommunicator {
  constructor() {
    this.messageHandlers = new Map();
    this.isInitialized = false;
    this.init();
  }
  
  // 初始化通信
  init() {
    if (this.isInitialized) return;
    
    window.addEventListener('message', this.handleMessage.bind(this));
    
    // 页面加载完成后通知插件
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.postMessage('ui-loaded', {});
      });
    } else {
      this.postMessage('ui-loaded', {});
    }
    
    this.isInitialized = true;
    console.log('插件通信器已初始化');
  }
  
  // 发送消息到插件
  postMessage(type, data = {}) {
    try {
      const message = { pluginMessage: { type, ...data } };
      parent.postMessage(message, '*');
      console.log(`发送消息到插件: ${type}`, message);
    } catch (error) {
      console.error(`发送消息失败: ${type}`, error);
    }
  }
  
  // 处理插件消息
  handleMessage(event) {
    try {
      const message = event.data.pluginMessage;
      if (!message) return;
      
      console.log(`收到插件消息: ${message.type}`, message);
      
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        handler(message);
      } else {
        console.warn(`未找到消息处理器: ${message.type}`);
      }
    } catch (error) {
      console.error('处理插件消息失败:', error);
    }
  }
  
  // 注册消息处理器
  on(type, handler) {
    this.messageHandlers.set(type, handler);
    console.log(`注册消息处理器: ${type}`);
  }
  
  // 测试通信连接
  testConnection() {
    this.postMessage('ping', { timestamp: Date.now() });
  }
}

// 创建通信器实例并挂载到window对象
console.log('🔧 准备创建PluginCommunicator实例...');
try {
  window.pluginComm = new PluginCommunicator();
  console.log('✅ PluginCommunicator实例创建成功:', !!window.pluginComm);
} catch (error) {
  console.error('❌ PluginCommunicator创建失败:', error);
  // 创建一个简化版本的通信器
  window.pluginComm = {
    postMessage: function(type, data = {}) {
      try {
        const message = { pluginMessage: { type, ...data } };
        parent.postMessage(message, '*');
        console.log(`📤 发送消息到插件: ${type}`, message);
      } catch (err) {
        console.error(`📤 发送消息失败: ${type}`, err);
      }
    },
    on: function(type) {
      console.log(`📝 注册消息处理器: ${type} (简化版)`);
    }
  };
  console.log('✅ 已创建简化版PluginCommunicator');
}

// 注册图片切片消息处理器
window.pluginComm.on('slice-large-image', async (message) => {
  try {
    console.log('收到图片切片请求:', message.imageData?.name);
    await window.imageSliceHandler.handleSliceRequest(message);
  } catch (error) {
    console.error('处理图片切片请求失败:', error);
    // 发送失败响应
    window.pluginComm.postMessage('slice-image-response', {
      success: false,
      imageName: message.imageData?.name || '未知图片',
      error: error.message
    });
  }
}); 