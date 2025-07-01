// ==================== 全局实例化和初始化管理 ====================

/* eslint-disable no-undef */
// 注意：以下类由其他文件在构建时提供，ESLint无法检测到定义

// === 全局实例化代码 ===

// 创建全局数据收集器实例
window.dataCollector = new DataCollector();

// 创建全局图片数据管理器实例  
window.imageDataManager = new ImageDataManager();

// 🚨 向后兼容：为imageManager创建别名
window.imageManager = window.imageDataManager;

// 创建全局渠道管理器实例
window.channelManager = new ChannelManager();

// 创建全局图片上传器实例
window.imageUploader = new ImageUploader();

// 创建全局图片切片处理器实例
window.imageSliceHandler = new ImageSliceHandler();

// 创建全局模块管理器实例
window.moduleManager = new ModuleManager();

// 创建全局表单重置器实例
window.formResetter = new FormResetter();

// 创建全局UI控制器实例
window.uiController = new UIController();

// 创建全局主题管理器实例
window.themeManager = new ThemeManager();

// 创建全局文件处理器实例
window.fileProcessor = new FileProcessor();

// 创建全局工具函数对象（已移除loadThemePreference）
window.utilityFunctions = {
  switchTab,
  switchButtonVersion,
  createPrototype,
  getImageData,
  collectModuleData,
  collectModuleContent,
  collectNineGridData,
  collectSignInData,
  collectCardsData,
  collectActivityContentData,
  getPrizePosition,
  previewImage,
  setupSystemThemeListener,
  detectAndApplySystemTheme,
  applyTheme,
  updateThemeButtonsState,
  switchTheme,
  bindThemeButtonEvents,
  globalClickHandler,
  globalChangeHandler,
  globalInputHandler,
  handleFileUpload,
  resetForm
};

console.log('✅ 所有全局实例创建完成:', {
  storageAdapter: !!window.storageAdapter,
  pluginComm: !!window.pluginComm,
  notificationSystem: !!window.notificationSystem,
  dataCollector: !!window.dataCollector,
  imageManager: !!window.imageManager,
  channelManager: !!window.channelManager,
  imageUploader: !!window.imageUploader,
  imageSliceHandler: !!window.imageSliceHandler,
  moduleManager: !!window.moduleManager,
  formResetter: !!window.formResetter,
  uiController: !!window.uiController,
  themeManager: !!window.themeManager,
  fileProcessor: !!window.fileProcessor,
  utilityFunctions: !!window.utilityFunctions,
  IconManager: !!window.IconManager
});



// 🚨 重要：触发插件通信器就绪事件（告知内联脚本）
if (window.pluginComm) {
  // 在全局窗口对象上设置标志
  window._h5ToolsPluginCommReady = true;
  
  // 触发自定义事件
  const event = new CustomEvent('h5ToolsReady', {
    detail: { 
      pluginCommReady: true,
      timestamp: Date.now(),
      modules: Object.keys(window).filter(k => k.includes('Comm') || k.includes('Manager'))
    }
  });
  window.dispatchEvent(event);
  
  console.log('🎯 插件通信器就绪事件已触发');
}

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

// 🚨 关键修复：确保在DOM加载完成且所有实例创建后才初始化应用
function safeInitializeApp() {
  console.log('🔧 安全初始化应用...');
  
  // 🔒 全局初始化锁 - 防止重复初始化
  if (window._h5ToolsInitializing || window._h5ToolsInitialized) {
    console.log('⚠️ 应用已经初始化或正在初始化，跳过重复调用');
    return;
  }
  
  // 设置初始化标志
  window._h5ToolsInitializing = true;
  
  // 直接调用初始化，此时所有实例都已创建
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!window._h5ToolsInitialized) {
        window.initializeApp();
      }
    });
  } else {
    // DOM已经加载完成，直接初始化
    // 使用setTimeout确保当前执行栈完成后再初始化
    setTimeout(() => {
      if (!window._h5ToolsInitialized) {
        window.initializeApp();
      }
    }, 0);
  }
}

// 调用安全初始化
safeInitializeApp();

// 🎯 立即初始化标签页切换功能（不等待其他模块）
(function immediateTabInit() {
  // 防止重复初始化
  if (window._h5ToolsTabsInitialized) {
    console.log('⚠️ 标签页已经初始化，跳过重复初始化');
    return;
  }
  
  const initTabs = () => {
    const tabs = document.querySelectorAll('.tab');
    if (tabs.length === 0) {
      // DOM可能还没有完全加载，延迟重试（最多重试5次）
      if (!initTabs.retryCount) initTabs.retryCount = 0;
      if (initTabs.retryCount < 5) {
        initTabs.retryCount++;
        setTimeout(initTabs, 100);
      }
      return;
    }
    
    // 标记标签页已初始化
    window._h5ToolsTabsInitialized = true;
    
    tabs.forEach(tab => {
      // 检查是否已经绑定过事件
      if (tab.dataset.tabHandlerBound === 'true') {
        return; // 已经绑定过，跳过
      }
      
      // 标记已绑定
      tab.dataset.tabHandlerBound = 'true';
      
      // 创建新的事件处理器
      tab._tabClickHandler = () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const tabId = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const content = document.getElementById(`${tabId}-content`);
        if (content) {
          content.classList.add('active');
        }
        
        console.log(`✅ 标签页切换到: ${tabId}`);
      };
      
      // 绑定事件
      tab.addEventListener('click', tab._tabClickHandler);
    });
    
    console.log('✅ 立即标签页切换功能已初始化');
  };
  
  // 立即尝试初始化
  initTabs();
})(); 