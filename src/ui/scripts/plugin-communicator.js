// ==================== 插件通信管理 ====================

class PluginCommunicator {
  constructor() {
    console.log('🔧 准备创建PluginCommunicator实例...');
    
    // 初始化消息处理器映射
    this.messageHandlers = new Map();
    
    // 消息状态跟踪
    this.messageStatus = new Map();
    
    // 初始化事件监听器
    this.initEventListener();
    
    // 标记初始化完成
    this.initialized = true;
    console.log('插件通信器已初始化');
  }
  
  initEventListener() {
    window.onmessage = (event) => {
      const pluginMessage = event.data.pluginMessage;
      if (!pluginMessage) return;
      
      const handler = this.messageHandlers.get(pluginMessage.type);
      if (handler) {
        handler(pluginMessage);
      }
    };
  }
  
  // 注册消息处理器
  registerHandler(messageType, handler) {
    console.log('注册消息处理器:', messageType);
    this.messageHandlers.set(messageType, handler);
  }
  
  // 发送消息到插件
  postMessage(type, data = {}) {
    // 生成消息ID
    const messageId = `${type}-${Date.now()}`;
    
    // 检查是否是状态类消息（如ui-loaded, ui-ready）
    if (type.startsWith('ui-')) {
      // 检查是否已经发送过
      const lastStatus = this.messageStatus.get(type);
      if (lastStatus) {
        const timeSinceLastMessage = Date.now() - lastStatus.timestamp;
        // 如果距离上次发送不到1秒，则跳过
        if (timeSinceLastMessage < 1000) {
          console.log(`⚠️ 跳过重复的${type}消息，距上次发送: ${timeSinceLastMessage}ms`);
          return;
        }
      }
      
      // 更新消息状态
      this.messageStatus.set(type, {
        timestamp: Date.now(),
        data: data
      });
    }
    
    // 构建消息对象
    const message = {
      type,
      ...data,
      _messageId: messageId,
      _timestamp: Date.now()
    };
    
    console.log('发送消息到插件:', type, message);
    
    // 发送消息
    parent.postMessage({ pluginMessage: message }, '*');
  }
  
  // 清理消息状态
  clearMessageStatus(type) {
    this.messageStatus.delete(type);
  }
  
  // 测试通信连接
  testConnection() {
    this.postMessage('ping', { timestamp: Date.now() });
  }
}

// 创建全局实例
try {
  const success = window.pluginComm = new PluginCommunicator();
  console.log('✅ PluginCommunicator实例创建成功:', !!success);
} catch (error) {
  console.error('❌ PluginCommunicator创建失败:', error);
}

// 注册图片切片消息处理器
window.pluginComm.registerHandler('slice-large-image', async (message) => {
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