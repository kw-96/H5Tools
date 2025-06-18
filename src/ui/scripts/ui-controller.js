// ==================== UI 控制器模块 ====================

class UIController {
  constructor() {
    this.initialized = false;
    this.eventListeners = new Map();
  }
  
  init() {
    if (this.initialized) return;
    
    this.initializeComponents();
    this.bindEvents();
    this.initialized = true;
  }
  
  // 初始化组件
  initializeComponents() {
    this.initializeTabs();
    this.initializeModuleManagement();
    this.initializeImageUploaders();
    this.initializeThemeSystem();
    this.initializeColorPickers();
    this.initializeCollapsiblePanels();
  }
  
  // 绑定事件
  bindEvents() {
    this.bindTabEvents();
    this.bindButtonEvents();
    this.bindVersionSelectorEvents();
  }
  
  // 初始化标签页
  initializeTabs() {
    const activeTab = document.querySelector('.tab.active');
    if (!activeTab) {
      const firstTab = document.querySelector('.tab');
      if (firstTab) {
        firstTab.classList.add('active');
        this.showTabContent(firstTab.dataset.tab);
      }
    } else {
      this.showTabContent(activeTab.dataset.tab);
    }
  }
  
  // 显示标签页内容
  showTabContent(tabId) {
    // 隐藏所有内容
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    // 显示目标内容
    const targetContent = document.getElementById(`${tabId}-content`);
    if (targetContent) {
      targetContent.classList.add('active');
    }
  }
  
  // 绑定标签页事件
  bindTabEvents() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.showTabContent(tab.dataset.tab);
      });
    });
  }
  
  // 初始化模块管理
  initializeModuleManagement() {
    if (window.moduleManager) {
      window.moduleManager.init();
    }
  }
  
  // 初始化图片上传
  initializeImageUploaders() {
    if (window.imageUploader) {
      window.imageUploader.init();
    }
  }
  
  // 初始化主题系统
  initializeThemeSystem() {
    if (window.themeManager) {
      window.themeManager.init();
    }
  }
  
  // 初始化颜色选择器
  initializeColorPickers() {
    const colorInputs = document.querySelectorAll('input[type="color"]');
    colorInputs.forEach(colorInput => {
      const textInput = colorInput.nextElementSibling;
      if (textInput && textInput.classList.contains('color-value')) {
        this.syncColorInputs(colorInput, textInput);
      }
    });
  }
  
  // 同步颜色输入
  syncColorInputs(colorInput, textInput) {
    colorInput.addEventListener('input', () => {
      textInput.value = colorInput.value.toUpperCase();
    });
    
    textInput.addEventListener('input', () => {
      if (/^#[0-9A-F]{6}$/i.test(textInput.value)) {
        colorInput.value = textInput.value;
      }
    });
  }
  
  // 初始化折叠面板
  initializeCollapsiblePanels() {
    const collapseButtons = document.querySelectorAll('.collapse-btn');
    collapseButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetId = button.getAttribute('data-target');
        const contentElement = document.getElementById(targetId);
        
        if (contentElement) {
          button.classList.toggle('collapsed');
          contentElement.classList.toggle('collapsed');
        }
      });
    });
  }
  
  // 绑定按钮事件
  bindButtonEvents() {
    const createBtn = document.getElementById('create');
    const resetBtn = document.getElementById('reset');
    
    if (createBtn) {
      createBtn.addEventListener('click', () => this.handleCreatePrototype());
    }
    
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleReset());
    }
  }
  
  // 绑定版本选择器事件
  bindVersionSelectorEvents() {
    const selector = document.getElementById('buttonVersionSelect');
    if (selector) {
      selector.addEventListener('change', (e) => {
        const contents = document.querySelectorAll('#buttonVersionContent .version-content');
        contents.forEach(content => content.classList.remove('active'));
        
        const targetContent = document.getElementById(`${e.target.value}Content`);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    }
  }
  
  // 处理创建原型
  handleCreatePrototype() {
    const createBtn = document.getElementById('create');
    if (!createBtn) return;
    
    createBtn.disabled = true;
    createBtn.textContent = '处理中...';
    
    try {
      const config = window.dataCollector.collectFormData();
      window.pluginComm.postMessage('create-prototype', { config });
    } catch (error) {
      window.notificationSystem.show(`创建失败: ${error.message}`, 'error');
      this.resetCreateButton();
    }
  }
  
  // 处理重置
  handleReset() {
    if (!confirm('确定要重置所有设置吗？此操作无法撤销。')) {
      return;
    }
    
    try {
      console.log('开始执行重置操作...');
      
      const success = window.formResetter.resetAll();
      
      if (success) {
        // 通知插件重置已完成
        window.pluginComm.postMessage('reset-complete', {});
        window.notificationSystem.show('所有设置已重置', 'success');
        console.log('重置操作完成');
      } else {
        window.notificationSystem.show('重置失败，请重试', 'error');
      }
    } catch (error) {
      console.error('重置操作失败:', error);
      window.notificationSystem.show(`重置失败: ${error.message}`, 'error');
    }
  }
  
  // 重置创建按钮
  resetCreateButton() {
    const createBtn = document.getElementById('create');
    if (createBtn) {
      createBtn.textContent = '创建原型';
      createBtn.disabled = false;
    }
  }
}

// 创建全局UI控制器实例
const uiController = new UIController();

// 导出供其他模块使用
window.uiController = uiController; 