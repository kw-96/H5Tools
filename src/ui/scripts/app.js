// ==================== 主应用初始化和消息处理 ====================

// 等待所有模块加载完成后初始化
function waitForModules() {
  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 100; // 最多等待1秒
    
    const checkModules = () => {
      attempts++;
      
      // 检查关键模块是否已加载
      const coreModules = [
        'pluginComm', 'notificationSystem', 'uiController', 
        'dataCollector', 'utilityFunctions'
      ];
      
      const missingModules = coreModules.filter(module => !window[module]);
      
      if (missingModules.length === 0) {
        console.log('✅ 所有核心模块加载完成');
        resolve();
      } else if (attempts >= maxAttempts) {
        console.warn('⚠️ 模块加载超时，但继续初始化:', missingModules);
        resolve(); // 即使有模块缺失也继续初始化
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
    
    // 隐藏加载状态
    window.notificationSystem.hideLoading();
    
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

  // 渠道生成成功处理
  window.pluginComm.on('channel-version-generated', (message) => {
    console.log('渠道版本生成成功:', message.message);
    window.notificationSystem.hideLoading();
    window.notificationSystem.show(message.message, 'success');
  });
}

// 初始化应用 (全局函数，供global-init.js调用)
window.initializeApp = async function() {
  try {
    console.log('🚀 开始初始化H5Tools应用...');
    
    // 等待所有模块加载完成
    await waitForModules();
    
    // 注册消息处理器
    registerMessageHandlers();
    
    // 🎯 强制显示UI内容 - 修复空白页面问题
    forceShowUI();
    
    // 初始化UI控制器
    if (window.uiController) {
    window.uiController.init();
    } else {
      console.warn('⚠️ UIController未加载，使用备用初始化');
      fallbackUIInit();
    }
    
    // 设置全局事件监听器
    setupEventListeners();
    
    // 初始化主题系统（可选）
    initializeThemeSystem();
    
    console.log('✅ H5Tools应用初始化完成');
    
    // 发送初始化完成消息
    if (window.pluginComm) {
      window.pluginComm.postMessage('ui-ready', { timestamp: Date.now() });
    }
    
  } catch (error) {
    console.error('❌ 应用初始化失败:', error);
    // 即使初始化失败，也尝试显示基础UI
    forceShowUI();
  }
};

// 🚨 强制显示UI内容 - 解决空白页面问题
function forceShowUI() {
  console.log('🔧 强制显示UI内容...');
  
  // 确保第一个标签页激活
  const firstTab = document.querySelector('.tab');
  if (firstTab && !document.querySelector('.tab.active')) {
    firstTab.classList.add('active');
    console.log('✅ 激活第一个标签页:', firstTab.dataset.tab);
  }
  
  // 显示对应的内容区域
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    const content = document.getElementById(`${tabId}-content`);
    if (content) {
      // 隐藏所有内容
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      // 显示目标内容
      content.classList.add('active');
      console.log('✅ 显示标签页内容:', tabId);
    }
  }
  
  // 确保必要的元素可见
  const channelsMainView = document.getElementById('channelsMainView');
  if (channelsMainView) {
    channelsMainView.style.display = 'block';
    console.log('✅ 显示渠道主视图');
  }
}

// 备用UI初始化
function fallbackUIInit() {
  console.log('🔧 执行备用UI初始化...');
  
  // 基础标签页切换
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // 显示对应内容
      const tabId = tab.dataset.tab;
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      const content = document.getElementById(`${tabId}-content`);
      if (content) {
        content.classList.add('active');
      }
    });
  });
  
  console.log('✅ 备用UI初始化完成');
}

// 设置事件监听器
function setupEventListeners() {
  try {
    if (window.utilityFunctions) {
    document.addEventListener('click', window.utilityFunctions.globalClickHandler);
    document.addEventListener('change', window.utilityFunctions.globalChangeHandler);
    document.addEventListener('input', window.utilityFunctions.globalInputHandler);
    }
  } catch (error) {
    console.warn('⚠️ 全局事件监听器设置失败:', error);
  }
}
    
    // 初始化主题系统
function initializeThemeSystem() {
  try {
    if (window.utilityFunctions) {
    window.utilityFunctions.loadThemePreference();
    window.utilityFunctions.setupSystemThemeListener();
    window.utilityFunctions.bindThemeButtonEvents();
    }
  } catch (error) {
    console.warn('⚠️ 主题系统初始化失败:', error);
  }
}

// 注意：DOM事件监听器和兼容性函数现在在global-init.js中处理
