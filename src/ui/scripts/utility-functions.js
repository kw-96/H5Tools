// ==================== 存储适配器 ====================
// 解决Figma插件沙盒环境中localStorage被禁用的问题
class StorageAdapter {
  constructor() {
    // 更严格的Figma环境检测
    this.isFigmaEnvironment = this.checkFigmaEnvironment();
    this.cache = new Map(); // 内存缓存
    
    // 输出环境检测结果
    console.log('StorageAdapter 环境检测:', {
      isFigmaEnvironment: this.isFigmaEnvironment,
      hasFigma: typeof figma !== 'undefined',
      hasClientStorage: typeof figma !== 'undefined' && !!figma.clientStorage,
      isDataURL: window.location.protocol === 'data:',
      userAgent: navigator.userAgent.includes('Figma')
    });
  }

  // 检测是否在Figma环境中
  checkFigmaEnvironment() {
    // 多重检测确保准确性
    const hasFigma = typeof figma !== 'undefined';
    const hasClientStorage = hasFigma && !!figma.clientStorage;
    const isDataURL = window.location.protocol === 'data:';
    const isFigmaUA = navigator.userAgent.includes('Figma');
    
    // 更严格的检测：只要是data:协议就认为是Figma环境
    // 因为Figma插件UI运行在data: URL中，localStorage被禁用
    const result = hasFigma && hasClientStorage && isDataURL;
    
    console.log('Figma环境检测详情:', {
      hasFigma,
      hasClientStorage,
      isDataURL,
      isFigmaUA,
      protocol: window.location.protocol,
      result
    });
    
    return result;
  }

  async setItem(key, value) {
    try {
      if (this.isFigmaEnvironment) {
        await figma.clientStorage.setAsync(key, value);
        this.cache.set(key, value);
        console.log(`✅ Figma存储设置成功: ${key}`);
      } else {
        // 在非Figma环境中，检测localStorage是否可用
        // 添加额外的data:协议检查，防止在Figma沙盒中误调用localStorage
        if (window.location.protocol === 'data:') {
          console.warn(`检测到data:协议，跳过localStorage，使用内存存储: ${key}`);
          this.cache.set(key, value);
          return;
        }
        
        try {
          localStorage.setItem(key, value);
          console.log(`✅ localStorage设置成功: ${key}`);
        } catch (localStorageError) {
          console.warn(`localStorage不可用，使用内存存储: ${key}`, localStorageError);
          this.cache.set(key, value);
        }
      }
    } catch (error) {
      console.warn(`存储设置失败 ${key}:`, error);
      this.cache.set(key, value); // 回退到内存存储
    }
  }

  async getItem(key) {
    try {
      if (this.isFigmaEnvironment) {
        // 优先从缓存获取
        if (this.cache.has(key)) {
          console.log(`📦 从缓存获取: ${key}`);
          return this.cache.get(key);
        }
        
        const value = await figma.clientStorage.getAsync(key);
        if (value !== undefined) {
          this.cache.set(key, value);
          console.log(`✅ Figma存储读取成功: ${key}`);
        }
        return value;
      } else {
        // 在非Figma环境中，检测localStorage是否可用
        // 添加额外的data:协议检查，防止在Figma沙盒中误调用localStorage
        if (window.location.protocol === 'data:') {
          console.warn(`检测到data:协议，跳过localStorage，使用内存存储: ${key}`);
          return this.cache.get(key);
        }
        
        try {
          const value = localStorage.getItem(key);
          console.log(`✅ localStorage读取成功: ${key}`);
          return value;
        } catch (localStorageError) {
          console.warn(`localStorage不可用，使用内存存储: ${key}`, localStorageError);
          return this.cache.get(key);
        }
      }
    } catch (error) {
      console.warn(`存储读取失败 ${key}:`, error);
      return this.cache.get(key); // 回退到内存存储
    }
  }

  async removeItem(key) {
    try {
      if (this.isFigmaEnvironment) {
        await figma.clientStorage.deleteAsync(key);
        this.cache.delete(key);
        console.log(`✅ Figma存储删除成功: ${key}`);
      } else {
        // 在非Figma环境中，检测localStorage是否可用
        // 添加额外的data:协议检查，防止在Figma沙盒中误调用localStorage
        if (window.location.protocol === 'data:') {
          console.warn(`检测到data:协议，跳过localStorage，使用内存存储: ${key}`);
          this.cache.delete(key);
          return;
        }
        
        try {
          localStorage.removeItem(key);
          console.log(`✅ localStorage删除成功: ${key}`);
        } catch (localStorageError) {
          console.warn(`localStorage不可用，使用内存存储: ${key}`, localStorageError);
          this.cache.delete(key);
        }
      }
    } catch (error) {
      console.warn(`存储删除失败 ${key}:`, error);
      this.cache.delete(key); // 回退到内存存储
    }
  }

  async getAllKeys() {
    try {
      if (this.isFigmaEnvironment) {
        const keys = await figma.clientStorage.keysAsync();
        console.log(`✅ Figma存储键获取成功: ${keys.length}个`);
        return keys;
      } else {
        // 在非Figma环境中，检测localStorage是否可用
        // 添加额外的data:协议检查，防止在Figma沙盒中误调用localStorage
        if (window.location.protocol === 'data:') {
          console.warn(`检测到data:协议，跳过localStorage，使用内存存储`);
          return Array.from(this.cache.keys());
        }
        
        try {
          const keys = Object.keys(localStorage);
          console.log(`✅ localStorage键获取成功: ${keys.length}个`);
          return keys;
        } catch (localStorageError) {
          console.warn(`localStorage不可用，使用内存存储`, localStorageError);
          return Array.from(this.cache.keys());
        }
      }
    } catch (error) {
      console.warn('获取存储键失败:', error);
      return Array.from(this.cache.keys()); // 回退到内存存储
    }
  }
}

// 创建全局存储适配器实例
const storageAdapter = new StorageAdapter();

// 导出到全局
window.storageAdapter = storageAdapter;

// ==================== 工具函数模块 ====================

// 标签页切换功能
function switchTab(tabName) {
  // 移除所有标签页的激活状态
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.classList.remove('active');
  });
  
  // 隐藏所有标签页内容
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => {
    content.classList.remove('active');
  });
  
  // 激活目标标签页
  const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (targetTab) {
    targetTab.classList.add('active');
  }
  
  // 显示目标标签页内容
  const targetContent = document.getElementById(`${tabName}-content`);
  if (targetContent) {
    targetContent.classList.add('active');
  }
}

// 按钮版本切换功能
function switchButtonVersion() {
  const selector = document.getElementById('buttonVersionSelect');
  if (!selector) return;
  
  // 隐藏所有版本内容
  const contents = document.querySelectorAll('#buttonVersionContent .version-content');
  contents.forEach(content => content.classList.remove('active'));
  
  // 显示选中的版本内容
  const selectedValue = selector.value;
  const targetContent = document.getElementById(`${selectedValue}Content`);
  if (targetContent) {
    targetContent.classList.add('active');
  }
}

// 创建原型功能
function createPrototype() {
  try {
    console.log('开始创建原型...');
    
    // 收集表单数据
    const config = window.dataCollector.collectFormData();
    
    // 发送到插件主线程
    window.pluginComm.postMessage('create-prototype', { config });
    
  } catch (error) {
    console.error('创建原型失败:', error);
    window.notificationSystem.show(`创建失败: ${error.message}`, 'error');
  }
}

// 获取图片数据
async function getImageData(inputId) {
  try {
    const input = document.getElementById(inputId);
    if (!input || !input.files || input.files.length === 0) {
      return null;
    }
    
    const file = input.files[0];
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
  } catch (error) {
    console.error(`获取图片数据失败 (${inputId}):`, error);
    return null;
  }
}

// 收集模块数据
function collectModuleData() {
  const modules = document.querySelectorAll('#modulesContainer .module');
  const moduleData = [];
  
  modules.forEach(moduleEl => {
    const moduleType = moduleEl.dataset.moduleType;
    const moduleId = moduleEl.id;
    
    if (moduleType && moduleId) {
      const moduleContent = collectModuleContent(moduleEl, moduleType);
      if (moduleContent) {
        moduleData.push({
          id: moduleId,
          type: moduleType,
          content: moduleContent
        });
      }
    }
  });
  
  return moduleData;
}

// 收集模块内容
function collectModuleContent(container, moduleType) {
  switch (moduleType) {
    case 'nineGrid':
      return collectNineGridData(container);
    case 'signIn':
      return collectSignInData(container, container.id);
    case 'collectCards':
      return collectCardsData(container, container.id);
    case 'activityContent':
      return collectActivityContentData(container, container.id);
    default:
      console.warn(`未知的模块类型: ${moduleType}`);
      return null;
  }
}

// 收集九宫格数据
function collectNineGridData(container) {
  const data = {
    prizes: []
  };
  
  // 收集奖品信息
  const prizeElements = container.querySelectorAll('.prize-item');
  prizeElements.forEach((prizeEl, index) => {
    const nameInput = prizeEl.querySelector('.prize-name');
    const imageInput = prizeEl.querySelector('.prize-upload');
    
    if (nameInput || imageInput) {
      const prize = {
        position: getPrizePosition(index),
        name: nameInput ? nameInput.value : '',
        image: imageInput && imageInput.files[0] ? imageInput.files[0] : null
      };
      data.prizes.push(prize);
    }
  });
  
  return data;
}

// 收集签到数据
function collectSignInData(container, moduleId) {
  const data = {};
  
  // 收集基本信息
  const titleInput = container.querySelector('.sign-in-title');
  if (titleInput) data.title = titleInput.value;
  
  const descInput = container.querySelector('.sign-in-description');
  if (descInput) data.description = descInput.value;
  
  // 收集图片
  const images = ['title', 'bg', 'dayicon', 'signbtn'];
  images.forEach(imageType => {
    const imageData = window.imageManager.getModule(`${moduleId}-${imageType}`);
    if (imageData) {
      data[`${imageType}Image`] = imageData;
    }
  });
  
  return data;
}

// 收集集卡数据
function collectCardsData(container, moduleId) {
  const data = {};
  
  // 收集基本信息
  const titleInput = container.querySelector('.collect-title');
  if (titleInput) data.title = titleInput.value;
  
  const descInput = container.querySelector('.collect-description');
  if (descInput) data.description = descInput.value;
  
  // 收集图片
  const images = ['title', 'bg', 'cardbg', 'combinebtn'];
  images.forEach(imageType => {
    const imageData = window.imageManager.getModule(`${moduleId}-${imageType}`);
    if (imageData) {
      data[`${imageType}Image`] = imageData;
    }
  });
  
  return data;
}

// 收集活动内容数据
function collectActivityContentData(container, moduleId) {
  const data = {};
  
  // 收集文本内容
  const mainTitleInput = container.querySelector('.activity-main-title');
  if (mainTitleInput) data.mainTitle = mainTitleInput.value;
  
  const subTitleInput = container.querySelector('.activity-sub-title');
  if (subTitleInput) data.subTitle = subTitleInput.value;
  
  const contentInput = container.querySelector('.activity-content-text');
  if (contentInput) data.content = contentInput.value;
  
  // 收集图片
  const images = ['main-title-bg', 'sub-title-bg', 'image'];
  images.forEach(imageType => {
    const imageData = window.imageManager.getModule(`${moduleId}-${imageType}`);
    if (imageData) {
      data[`${imageType.replace('-', '')}Image`] = imageData;
    }
  });
  
  return data;
}

// 获取奖品位置
function getPrizePosition(index) {
  // 九宫格位置映射
  const positions = [
    { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
    { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
    { row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }
  ];
  
  return positions[index] || { row: 0, col: 0 };
}

// 通用图片预览函数
function previewImage(input, previewElement) {
  if (!input.files || input.files.length === 0) return;
  
  const file = input.files[0];
  if (!file.type.startsWith('image/')) {
    alert('请选择有效的图片文件');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    if (previewElement) {
      previewElement.innerHTML = `<img src="${e.target.result}" style="width: 100%; height: 100%; object-fit: contain;">`;
    }
  };
  reader.readAsDataURL(file);
  
  // 处理模块图片上传
  if (input.closest('.module')) {
    window.fileProcessor.handleModuleImageUpload({ target: input });
  }
}

// 主题系统功能
function setupSystemThemeListener() {
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = async (e) => {
      const isDark = e.matches;
      console.log('系统主题变化:', isDark ? '深色' : '浅色');
      
      // 检查是否启用了自动主题
      if (window.storageAdapter) {
        try {
          const autoThemeEnabled = await window.storageAdapter.getItem('autoTheme') === 'true';
          if (autoThemeEnabled) {
            applyTheme(isDark ? 'dark' : 'light');
            
            // 通知用户主题已自动切换
            const themeText = isDark ? '深色' : '浅色';
            console.log(`已自动切换到${themeText}主题`);
          }
        } catch (error) {
          console.warn('检查自动主题设置失败:', error);
        }
      } else {
        console.warn('StorageAdapter不可用，无法检查自动主题设置');
      }
    };
    
    // 监听系统主题变化
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleThemeChange);
    }
    
    // 初始检查
    handleThemeChange(mediaQuery);
  }
}

// 加载主题偏好
async function loadThemePreference() {
  try {
    // 确保StorageAdapter已经初始化
    if (!window.storageAdapter) {
      console.warn('StorageAdapter未初始化，使用默认主题');
      applyTheme('light');
      return;
    }

    console.log('开始加载主题偏好...');
    
    const savedTheme = await window.storageAdapter.getItem('theme');
    const autoTheme = await window.storageAdapter.getItem('autoTheme') === 'true';
    
    console.log('主题设置:', { savedTheme, autoTheme });
    
    if (autoTheme) {
      // 自动主题：跟随系统
      console.log('使用自动主题模式');
      detectAndApplySystemTheme();
    } else if (savedTheme) {
      // 使用保存的主题
      console.log(`使用保存的主题: ${savedTheme}`);
      applyTheme(savedTheme);
    } else {
      // 默认跟随系统
      console.log('使用默认系统主题');
      detectAndApplySystemTheme();
    }
  } catch (error) {
    console.error('加载主题偏好失败:', error);
    // 降级到默认浅色主题
    console.log('降级到默认浅色主题');
    applyTheme('light');
  }
}

// 检测并应用系统主题
function detectAndApplySystemTheme() {
  try {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? 'dark' : 'light';
    applyTheme(systemTheme);
    console.log('已应用系统主题:', systemTheme);
  } catch (error) {
    console.error('检测系统主题失败:', error);
    applyTheme('light');
  }
}

// 应用主题
async function applyTheme(theme) {
  try {
    // 移除现有主题类
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // 应用新主题
    document.body.classList.add(`${theme}-theme`);
    
    // 更新主题按钮状态
    updateThemeButtonsState(theme);
    
    // 保存主题偏好（如果存储适配器可用）
    if (window.storageAdapter) {
      try {
        await window.storageAdapter.setItem('theme', theme);
        console.log(`✅ 主题已保存: ${theme}`);
      } catch (storageError) {
        console.warn(`主题保存失败，但已应用到界面: ${theme}`, storageError);
      }
    } else {
      console.warn(`StorageAdapter不可用，主题仅应用到界面: ${theme}`);
    }
    
    console.log('主题已切换到:', theme);
  } catch (error) {
    console.error('应用主题失败:', error);
  }
}

// 更新主题按钮状态
function updateThemeButtonsState(activeTheme) {
  try {
    const lightBtn = document.getElementById('lightTheme');
    const darkBtn = document.getElementById('darkTheme');
    
    if (lightBtn && darkBtn) {
      // 更新按钮状态
      lightBtn.classList.toggle('active', activeTheme === 'light');
      darkBtn.classList.toggle('active', activeTheme === 'dark');
      
      // 更新按钮文本或图标（如果需要）
      // lightBtn.setAttribute('aria-pressed', activeTheme === 'light');
      // darkBtn.setAttribute('aria-pressed', activeTheme === 'dark');
    }
  } catch (error) {
    console.error('更新主题按钮状态失败:', error);
  }
}

// 切换主题
async function switchTheme(theme) {
  try {
    await applyTheme(theme);
    
    // 禁用自动主题（如果存储适配器可用）
    if (window.storageAdapter) {
      try {
        await window.storageAdapter.setItem('autoTheme', 'false');
        console.log('✅ 自动主题已禁用');
      } catch (storageError) {
        console.warn('自动主题设置保存失败:', storageError);
      }
    } else {
      console.warn('StorageAdapter不可用，无法保存自动主题设置');
    }
    
    console.log('手动切换主题到:', theme);
  } catch (error) {
    console.error('切换主题失败:', error);
  }
}

// 绑定主题按钮事件
function bindThemeButtonEvents() {
  try {
    const lightBtn = document.getElementById('lightTheme');
    const darkBtn = document.getElementById('darkTheme');
    
    if (lightBtn) {
      lightBtn.addEventListener('click', () => switchTheme('light'));
    }
    
    if (darkBtn) {
      darkBtn.addEventListener('click', () => switchTheme('dark'));
    }
    
    // 可选：添加键盘快捷键支持
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + T 切换主题
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        switchTheme(newTheme);
      }
    });
    
    console.log('主题按钮事件已绑定');
  } catch (error) {
    console.error('绑定主题按钮事件失败:', error);
  }
}

// 全局点击处理器
function globalClickHandler(e) {
  // 处理标签页点击
  if (e.target.classList.contains('tab')) {
    const tabName = e.target.dataset.tab;
    if (tabName) {
      switchTab(tabName);
    }
  }
  
  // 处理主题按钮点击
  if (e.target.id === 'lightTheme') {
    switchTheme('light');
  } else if (e.target.id === 'darkTheme') {
    switchTheme('dark');
  }
  
  // 创建按钮已由UI控制器处理，避免重复绑定
  
  // 处理重置按钮点击
  if (e.target.id === 'reset') {
    if (confirm('确定要重置所有设置吗？此操作无法撤销。')) {
      window.formResetter.resetAll();
    }
  }
}

// 全局change处理器
function globalChangeHandler(e) {
  // 处理按钮版本选择器
  if (e.target.id === 'buttonVersionSelect') {
    switchButtonVersion();
  }
  
  // 处理文件上传
  if (e.target.type === 'file') {
    handleFileUpload(e.target);
  }
}

// 全局input处理器
function globalInputHandler(e) {
  // 处理颜色输入同步
  if (e.target.type === 'color') {
    const textInput = e.target.nextElementSibling;
    if (textInput && textInput.classList.contains('color-value')) {
      textInput.value = e.target.value.toUpperCase();
    }
  }
  
  // 处理颜色文本输入
  if (e.target.classList.contains('color-value')) {
    const colorInput = e.target.previousElementSibling;
    if (colorInput && colorInput.type === 'color' && /^#[0-9A-F]{6}$/i.test(e.target.value)) {
      colorInput.value = e.target.value;
    }
  }
}

// 处理文件上传
function handleFileUpload(input) {
  if (!input.files || input.files.length === 0) return;
  
  // 查找预览容器
  const previewContainer = input.nextElementSibling?.querySelector('.img-preview-inline, .preview-container');
  if (previewContainer) {
    previewImage(input, previewContainer);
  }
  
  // 特殊处理游戏图标
  if (input.id === 'gameIconUpload') {
    const gameIconPreview = document.getElementById('gameIconPreview');
    if (gameIconPreview) {
      previewImage(input, gameIconPreview);
    }
  }
}

// 重置表单
function resetForm() {
  if (window.formResetter) {
    window.formResetter.resetAll();
  }
}

// 导出供其他模块使用
window.utilityFunctions = {
  switchTab,
  switchButtonVersion,
  createPrototype,
  getImageData,
  collectModuleData,
  previewImage,
  setupSystemThemeListener,
  loadThemePreference,
  applyTheme,
  switchTheme,
  bindThemeButtonEvents,
  globalClickHandler,
  globalChangeHandler,
  globalInputHandler,
  handleFileUpload,
  resetForm
};
