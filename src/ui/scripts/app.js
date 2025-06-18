// ==================== 主应用初始化和消息处理 ====================

// 等待所有模块加载完成后初始化
function waitForModules() {
  return new Promise((resolve) => {
    const checkModules = () => {
      if (window.pluginComm && window.notificationSystem && window.uiController && 
          window.dataCollector && window.utilityFunctions && window.imageManager &&
          window.fileProcessor && window.imageSliceHandler && window.moduleManager &&
          window.imageUploader && window.themeManager && window.formResetter &&
          window.channelManager) {
        resolve();
      } else {
        setTimeout(checkModules, 10);
      }
    };
    checkModules();
  });
}

// 注册消息处理器
function registerMessageHandlers() {
  window.pluginComm.on('init', (message) => {
    console.log('插件初始化:', message.data);
  });

  window.pluginComm.on('prototype-created', () => {
    window.notificationSystem.show('原型创建成功！', 'success');
    window.uiController.resetCreateButton();
  });

  window.pluginComm.on('error', (message) => {
    console.error('操作失败:', message);
    
    // 显示详细错误信息
    const errorMsg = message.message || '未知错误';
    window.notificationSystem.show(`操作失败: ${errorMsg}`, 'error');
    
    // 重置创建按钮状态
    window.uiController.resetCreateButton();
    
    // 可选：记录错误日志或发送错误报告
    if (message.details) {
      console.error('错误详情:', message.details);
    }
    
    // 可选：根据错误类型提供不同的用户提示
    if (message.errorType === 'validation') {
      window.notificationSystem.show('请检查输入的数据是否完整', 'warning', 3000);
    } else if (message.errorType === 'network') {
      window.notificationSystem.show('网络连接异常，请稍后重试', 'warning', 3000);
    }
  });

  window.pluginComm.on('save-success', () => {
    window.notificationSystem.show('配置已保存', 'success');
  });

  window.pluginComm.on('load-config-success', (message) => {
    if (message.config) {
      // TODO: 实现配置加载逻辑
      window.notificationSystem.show('配置加载成功', 'success');
    }
  });

  window.pluginComm.on('reset-acknowledged', (message) => {
    console.log('插件确认重置完成:', message.message);
  });

  window.pluginComm.on('pong', (message) => {
    console.log('插件连接正常:', message.message);
  });
}

// 初始化应用
async function initializeApp() {
  try {
    // 等待所有模块加载完成
    await waitForModules();
    
    // 注册消息处理器
    registerMessageHandlers();
    
    // 初始化UI控制器
    window.uiController.init();
    
    // 设置全局事件监听器
    document.addEventListener('click', window.utilityFunctions.globalClickHandler);
    document.addEventListener('change', window.utilityFunctions.globalChangeHandler);
    document.addEventListener('input', window.utilityFunctions.globalInputHandler);
    
    // 初始化主题系统
    window.utilityFunctions.loadThemePreference();
    window.utilityFunctions.setupSystemThemeListener();
    window.utilityFunctions.bindThemeButtonEvents();
    
    console.log('H5Tools应用初始化完成');
  } catch (error) {
    console.error('应用初始化失败:', error);
  }
}

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initializeApp);

// 兼容性函数 - 保持向后兼容
window.collectFormData = function() {
  return window.dataCollector ? window.dataCollector.collectFormData() : null;
};

window.postMessageToPlugin = function(type, data) {
  if (window.pluginComm) {
    window.pluginComm.postMessage(type, data);
  }
};

window.showNotification = function(message, type) {
  if (window.notificationSystem) {
    window.notificationSystem.show(message, type);
  }
};
