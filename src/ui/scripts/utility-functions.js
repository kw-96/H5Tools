// ==================== 存储适配器 ====================
// 解决Figma插件沙盒环境中localStorage被禁用的问题
class StorageAdapter {
  constructor() {
    // 更严格的Figma环境检测
    this.isFigmaEnvironment = this.checkFigmaEnvironment();
    this.cache = new Map(); // 内存缓存
    this.defaults = {
      theme: 'light',
      autoTheme: false
    };
    
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
    // 关键修复：在Figma插件UI中，figma对象不可用！
    // 我们需要通过其他方式检测Figma环境
    const isDataURL = window.location.protocol === 'data:';
    const isFigmaUA = navigator.userAgent.includes('Figma') || window.location.href.includes('figma');
    const hasFigmaParent = window.parent !== window; // 插件运行在iframe中
    
    // 🚨 重要修复：在Figma插件UI线程中，figma对象是undefined！
    // 但我们仍在Figma环境中，需要使用data:协议作为主要判断依据
    const result = isDataURL || isFigmaUA;
    
    console.log('🔧 Figma环境检测详情:', {
      isDataURL,
      isFigmaUA,
      hasFigmaParent,
      protocol: window.location.protocol,
      href: window.location.href,
      userAgent: navigator.userAgent,
      result: result ? '✅ Figma环境' : '❌ 非Figma环境'
    });
    
    return result;
  }

  async setItem(key, value) {
    try {
      if (this.isFigmaEnvironment) {
        // 🚨 重要修复：在Figma UI线程中，不能直接访问figma.clientStorage
        // 需要通过postMessage与插件主线程通信
        console.log(`📤 向插件发送存储设置请求: ${key}`);
        
        // 发送消息到插件主线程
        window.parent.postMessage({
          pluginMessage: {
            type: 'storage-set',
            key: key,
            value: value
          }
        }, '*');
        
        // 同时保存到内存缓存
        this.cache.set(key, value);
        console.log(`✅ 缓存设置成功: ${key}`);
      } else {
        // 在非Figma环境中，尝试使用localStorage
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
      // 先检查缓存
      if (this.cache.has(key)) {
        console.log('📦 从缓存获取:', key);
        return this.cache.get(key);
      }

      let value;
      
      if (this.isFigmaEnvironment) {
        // 发送消息给插件获取存储值
        window.pluginComm.postMessage('storage-get', { key });
        value = await new Promise((resolve) => {
          const handler = (message) => {
            if (message.type === 'storage-get-response' && message.key === key) {
              window.pluginComm.off('storage-get-response', handler);
              resolve(message.value);
            }
          };
          window.pluginComm.on('storage-get-response', handler);
          // 5秒超时
          setTimeout(() => resolve(this.defaults[key]), 5000);
        });
      } else {
        value = localStorage.getItem(key);
      }

      // 如果值不存在，使用默认值
      if (value === null || value === undefined) {
        value = this.defaults[key];
        if (value === undefined) {
          console.warn(`⚠️ 缓存中没有找到 ${key}，返回默认值`);
        }
      }

      // 更新缓存
      if (value !== undefined) {
        this.cache.set(key, value);
      }

      return value;
    } catch (error) {
      console.error(`获取存储值失败 ${key}:`, error);
      return this.defaults[key];
    }
  }

  async removeItem(key) {
    try {
      if (this.isFigmaEnvironment) {
        // 🚨 重要修复：在Figma UI线程中，不能直接访问figma.clientStorage
        // 需要通过postMessage与插件主线程通信
        console.log(`📤 向插件发送存储删除请求: ${key}`);
        
        // 发送消息到插件主线程
        window.parent.postMessage({
          pluginMessage: {
            type: 'storage-delete',
            key: key
          }
        }, '*');
        
        // 同时从内存缓存中删除
        this.cache.delete(key);
        console.log(`✅ 缓存删除成功: ${key}`);
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
        // 🚨 重要修复：在Figma UI线程中，不能直接访问figma.clientStorage
        // 优先返回内存缓存的键，避免复杂的异步通信
        console.log(`📦 返回缓存中的存储键`);
        return Array.from(this.cache.keys());
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
  // 九宫格位置映射 (3x3网格)
  const positions = [
    { row: 0, col: 0 }, // 位置0: 左上
    { row: 0, col: 1 }, // 位置1: 上中
    { row: 0, col: 2 }, // 位置2: 右上
    { row: 1, col: 2 }, // 位置3: 右中
    { row: 2, col: 2 }, // 位置4: 右下
    { row: 2, col: 1 }, // 位置5: 下中
    { row: 2, col: 0 }, // 位置6: 左下
    { row: 1, col: 0 }, // 位置7: 左中
    { row: 1, col: 1 }  // 位置8: 中心(抽奖按钮位置)
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

// 主题系统功能（简化版 - 仅监听系统主题变化）
function setupSystemThemeListener() {
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = async (e) => {
      const isDark = e.matches;
      const newTheme = isDark ? 'dark' : 'light';
      
      // 检查当前主题，避免不必要的切换
      const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
      if (currentTheme !== newTheme) {
        applyTheme(newTheme);
        console.log(`✅ 系统主题变化，已切换到${isDark ? '深色' : '浅色'}主题`);
      }
    };
    
    // 监听系统主题变化
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleThemeChange);
    } else {
      // 兼容旧版浏览器
      mediaQuery.addListener(handleThemeChange);
    }
    
    console.log('✅ 系统主题监听器已设置');
  }
}

// 注意：主题缓存机制已被移除，不再保存/读取主题偏好
// 现在直接应用系统主题或默认主题

// 检测并应用系统主题（防重复调用）
function detectAndApplySystemTheme() {
  // 防止重复调用
  if (window._h5ToolsThemeInitialized) {
    console.log('⚠️ 主题已经初始化，跳过重复应用');
    return;
  }
  
  try {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const systemTheme = prefersDark ? 'dark' : 'light';
    applyTheme(systemTheme);
    console.log('✅ 已应用系统主题:', systemTheme);
    
    // 标记主题已初始化
    window._h5ToolsThemeInitialized = true;
  } catch (error) {
    console.error('检测系统主题失败:', error);
    applyTheme('light');
    window._h5ToolsThemeInitialized = true;
  }
}

// 应用主题（简化版）
async function applyTheme(theme) {
  try {
    // 移除现有主题类
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // 应用新主题
    document.body.classList.add(`${theme}-theme`);
    
    // 更新主题按钮状态
    updateThemeButtonsState(theme);
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

// 切换主题（简化版）
async function switchTheme(theme) {
  try {
    await applyTheme(theme);
    console.log(`✅ 手动切换到${theme === 'dark' ? '深色' : '浅色'}主题`);
  } catch (error) {
    console.error('切换主题失败:', error);
  }
}

// 绑定主题按钮事件（防重复绑定）
function bindThemeButtonEvents() {
  // 防止重复绑定
  if (window._h5ToolsThemeEventsInitialized) {
    console.log('⚠️ 主题按钮事件已经绑定，跳过重复绑定');
    return;
  }
  
  try {
    const lightBtn = document.getElementById('lightTheme');
    const darkBtn = document.getElementById('darkTheme');
    
    if (lightBtn && !lightBtn._themeEventBound) {
      lightBtn.addEventListener('click', () => switchTheme('light'));
      lightBtn._themeEventBound = true;
    }
    
    if (darkBtn && !darkBtn._themeEventBound) {
      darkBtn.addEventListener('click', () => switchTheme('dark'));
      darkBtn._themeEventBound = true;
    }
    
    // 可选：添加键盘快捷键支持（防重复绑定）
    if (!window._h5ToolsKeyboardShortcutBound) {
      document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Shift + T 切换主题
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
          e.preventDefault();
          const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          switchTheme(newTheme);
        }
      });
      window._h5ToolsKeyboardShortcutBound = true;
    }
    
    console.log('✅ 主题按钮事件已绑定');
    window._h5ToolsThemeEventsInitialized = true;
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
  
  // 🚨 修复：移除重复的主题按钮处理，避免与bindThemeButtonEvents重复
  // 主题按钮点击已在bindThemeButtonEvents中单独处理
  // if (e.target.id === 'lightTheme') {
  //   switchTheme('light');
  // } else if (e.target.id === 'darkTheme') {
  //   switchTheme('dark');
  // }
  
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

// 导出供其他模块使用（已移除loadThemePreference）
window.utilityFunctions = {
  switchTab,
  switchButtonVersion,
  createPrototype,
  getImageData,
  collectModuleData,
  previewImage,
  setupSystemThemeListener,
  detectAndApplySystemTheme,
  applyTheme,
  switchTheme,
  bindThemeButtonEvents,
  globalClickHandler,
  globalChangeHandler,
  globalInputHandler,
  handleFileUpload,
  resetForm
};
