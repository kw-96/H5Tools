// H5Tools 主构建脚本 - 外部CSS版本
// 统一构建脚本，包含核心库、插件和外部CSS版本构建

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { execSync } = require('child_process');

// 运行系统命令
function runCommand(command) {
  return new Promise((resolve, reject) => {
    try {
      execSync(command, { stdio: 'inherit' });
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

// 创建内容生成函数
function createContentHeader(type, description) {
    return [
        `// H5Tools UI ${type}`,
        `// ${description}`,
        `// 构建时间: ${new Date().toISOString()}`,
        ''
    ].join('\n');
}

// 构建核心库
async function buildCore() {
  console.log('🔧 构建核心库...');
  return runCommand('cd src/core && npm run build');
}

// 构建插件
async function buildPlugin() {
  console.log('🔧 构建插件...');
  return runCommand('npm run build:plugin');
}

// 清理构建目录
function clearDistDirectory() {
  console.log('🧹 清理构建目录...');
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
  }
  fs.mkdirSync('dist', { recursive: true });
  console.log('✅ 构建目录已清理');
}

// 构建HTML文件
function buildHTML() {
  try {
    console.log('📄 开始构建HTML文件...');
    
    // 在函数顶部声明所有变量，避免重复声明
    let htmlContent = '';
    let jsContent = '';
    let cssContent = '';
    
    // 读取HTML模板
    try {
      htmlContent = fs.readFileSync('src/ui/index.html', 'utf8');
    } catch (error) {
      throw new Error(`无法读取HTML模板: ${error.message}`);
    }
    
    // 读取并处理CSS文件
    const cssFiles = [
      'src/ui/styles/base.css',
      'src/ui/styles/layout.css', 
      'src/ui/styles/app-new.css',
      ...glob.sync('src/ui/styles/components/*.css'),
      ...glob.sync('src/ui/styles/themes/*.css')
    ];

    const cssHeader = createContentHeader('CSS', '外联CSS文件，通过CDN加载');
    
    cssFiles.forEach(file => {
      if (fs.existsSync(file)) {
        cssContent += fs.readFileSync(file, 'utf8') + '\n';
      }
    });
    
    // 轻量级CSS优化
    cssContent = cssContent
      .replace(/\/\*\s*===.*?===\s*\*\//g, '') // 移除分隔注释
      .replace(/\n\s*\n\s*\n/g, '\n\n') // 移除多余空行
      .trim();
    
    console.log(`✅ CSS合并完成: ${(cssContent.length / 1024).toFixed(1)}KB`);
    
    // 生成独立的CSS文件
    const cssOutputPath = 'dist/styles.min.css';
    fs.writeFileSync(cssOutputPath, cssContent);
    console.log(`✅ CSS文件生成: ${cssOutputPath}`);
    
    // 读取并处理JavaScript文件
    const jsFiles = [
      'src/ui/scripts/utility-functions.js',
      'src/ui/scripts/plugin-communicator.js',
      'src/ui/scripts/notification-system.js',
      'src/ui/scripts/theme-manager.js',
      'src/ui/scripts/file-processor.js',
      'src/ui/scripts/data-collector.js',
      'src/ui/scripts/data-manager.js',
      'src/ui/scripts/channel-manager.js',
      'src/ui/scripts/image-uploader.js',
      'src/ui/scripts/image-slice-handler.js',
      'src/ui/scripts/module-manager.js',
      'src/ui/scripts/form-resetter.js',
      'src/ui/scripts/ui-controller.js',
      'src/ui/scripts/app.js',
      'src/ui/scripts/global-init.js'
    ];
    
    const jsHeader = createContentHeader('Scripts', 'JavaScript 文件');
    
    console.log(`🔍 准备处理 ${jsFiles.length} 个JS文件`);
    console.log(`🔍 jsContent当前状态: ${typeof jsContent}, 长度: ${jsContent.length}`);
    
    jsFiles.forEach((file, index) => {
      try {
        console.log(`🔍 处理第 ${index + 1} 个文件: ${file}`);
        
        if (fs.existsSync(file)) {
          const fileContent = fs.readFileSync(file, 'utf8');
          const fileName = path.basename(file);
          console.log(`📁 包含文件: ${fileName} (${(fileContent.length / 1024).toFixed(1)}KB)`);
          
          // 确保 jsContent 仍然是字符串
          if (typeof jsContent !== 'string') {
            console.error(`❌ jsContent 类型异常: ${typeof jsContent}`);
            jsContent = '';
          }
          
          jsContent += `/* === ${fileName} === */\n${fileContent}\n\n`;
        } else {
          console.warn(`⚠️ 文件不存在: ${file}`);
        }
      } catch (fileError) {
        console.error(`❌ 处理文件失败 ${file}:`, fileError.message);
      }
    });

    console.log(`✅ JavaScript合并完成: ${(jsContent.length / 1024).toFixed(1)}KB`);
    
    // 生成独立的JavaScript文件
    const jsOutputPath = 'dist/scripts.min.js';
    fs.writeFileSync(jsOutputPath, jsContent);
    console.log(`✅ JS文件生成: ${jsOutputPath}`);
    
    // H5Tools 终极CDN加载方案
    const ultimateCDNLoaderCode = `// H5Tools 终极CDN加载方案
// 构建时间: ${new Date().toISOString()}
// 目标：100%可靠的CDN资源加载

console.log('🚀 H5Tools 终极CDN加载器启动...');

// 1. 核心配置
const CDN_CONFIG = {
  css: 'https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css',
  js: 'https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/scripts.min.js',
  timeout: 10000,
  retryDelay: 1000,
  maxRetries: 3
};

// 2. 状态管理
const LoaderState = {
  cssLoaded: false,
  jsLoaded: false,
  appInitialized: false,
  retryCount: 0,
  startTime: Date.now()
};

// 3. 工具函数
function logWithTime(message, type = 'log') {
  const elapsed = Date.now() - LoaderState.startTime;
  console[type](\`[\${elapsed}ms] \${message}\`);
}

// 4. 导出Figma API到全局对象
if (typeof figma !== 'undefined') {
  window.figma = figma;
  logWithTime('✅ Figma API已导出到全局对象');
}

// 5. 创建全局通信桥接器
window.figmaBridge = {
  postMessage: function(pluginMessage) {
    if (typeof parent !== 'undefined' && parent.postMessage) {
      parent.postMessage({ pluginMessage }, '*');
      logWithTime(\`📤 通过桥接器发送消息: \${JSON.stringify(pluginMessage).substring(0, 100)}...\`);
    } else {
      logWithTime('❌ 无法访问parent对象发送消息', 'error');
    }
  },
  messageHandlers: new Map(),
  on: function(type, handler) {
    this.messageHandlers.set(type, handler);
    logWithTime(\`📝 通过桥接器注册消息处理器: \${type}\`);
  }
};

// 6. 设置全局消息监听器
window.addEventListener('message', function(event) {
  try {
    const message = event.data.pluginMessage;
    if (!message) return;
    
    logWithTime(\`📥 收到插件消息: \${message.type}\`);
    
    if (window.figmaBridge && window.figmaBridge.messageHandlers) {
      const handler = window.figmaBridge.messageHandlers.get(message.type);
      if (handler) {
        handler(message);
      }
    }
    
    if (window.pluginComm) {
      const handler = window.pluginComm.messageHandlers && 
                     window.pluginComm.messageHandlers.get(message.type);
      if (handler) {
        handler(message);
      }
    }
  } catch (error) {
    logWithTime(\`❌ 处理消息失败: \${error.message}\`, 'error');
  }
});

// 7. 应急样式
function createFallbackUI() {
  const style = document.createElement('style');
  style.textContent = \`
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .fallback-container { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .tab-container { display: flex; border-bottom: 1px solid #e0e0e0; margin: 20px 0; }
    .tab { padding: 12px 20px; cursor: pointer; border: none; background: none; color: #666; border-bottom: 2px solid transparent; }
    .tab.active { color: #2196f3; border-bottom-color: #2196f3; }
    .tab-content { display: none; padding: 20px 0; }
    .tab-content.active { display: block; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
    .form-group input, .form-group select { width: 100%; padding: 8px 12px; border: 1px solid #ddd; border-radius: 4px; }
    .create-btn { background: #4caf50; color: white; border: none; padding: 12px 24px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px; }
    .create-btn:hover { background: #45a049; }
    .create-btn:disabled { background: #ccc; cursor: not-allowed; }
  \`;
  document.head.appendChild(style);
  logWithTime('✅ 应急样式已加载');
}

// 8. 基础标签页切换功能
function initBasicTabSwitching() {
  const tabs = document.querySelectorAll('.tab');
  const contents = document.querySelectorAll('.tab-content');
  
  if (tabs.length === 0) {
    setTimeout(initBasicTabSwitching, 100);
    return;
  }
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      const content = document.getElementById(\`\${tabId}-content\`);
      if (content) {
        content.classList.add('active');
      }
      
      logWithTime(\`✅ 标签页切换: \${tabId}\`);
    });
  });
  
  logWithTime('✅ 基础标签页切换已激活');
}

// 9. CSS加载器
function loadCSS() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = CDN_CONFIG.css;
    
    const timeout = setTimeout(() => {
      reject(new Error('CSS加载超时'));
    }, CDN_CONFIG.timeout);
    
    link.onload = () => {
      clearTimeout(timeout);
      LoaderState.cssLoaded = true;
      logWithTime('✅ CSS加载成功');
      resolve();
    };
    
    link.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('CSS加载失败'));
    };
    
    document.head.appendChild(link);
    logWithTime('🔄 开始加载CSS...');
  });
}

// 10. JavaScript加载器
function loadJS() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CDN_CONFIG.js;
    
    const timeout = setTimeout(() => {
      reject(new Error('JavaScript加载超时'));
    }, CDN_CONFIG.timeout);
    
    script.onload = () => {
      clearTimeout(timeout);
      LoaderState.jsLoaded = true;
      logWithTime('✅ JavaScript加载成功');
      
      if (!window.pluginComm) {
        window.pluginComm = {
          messageHandlers: new Map(),
          postMessage: function(type, data = {}) {
            window.figmaBridge.postMessage({ type, ...data });
          },
          on: function(type, handler) {
            window.figmaBridge.on(type, handler);
          },
          init: function() {
            logWithTime('✅ 临时通信器已初始化');
          }
        };
        window.pluginComm.init();
      }
      
      resolve();
    };
    
    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('JavaScript加载失败'));
    };
    
    document.head.appendChild(script);
    logWithTime('🔄 开始加载JavaScript...');
  });
}

// 11. 应用初始化检查
function checkAppInitialization() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 20;
    
    const check = () => {
      attempts++;
      
      if (window.initializeApp && typeof window.initializeApp === 'function') {
        LoaderState.appInitialized = true;
        logWithTime('✅ ');
        resolve();
        return;
      }
      
      if (attempts >= maxAttempts) {
        reject(new Error('应用初始化检查失败'));
        return;
      }
      
      setTimeout(check, 100);
    };
    
    check();
  });
}

// 12. 重试机制
async function retryLoad() {
  if (LoaderState.retryCount >= CDN_CONFIG.maxRetries) {
    logWithTime('❌ 达到最大重试次数，进入应急模式', 'error');
    createFallbackUI();
    initBasicTabSwitching();
    return;
  }
  
  LoaderState.retryCount++;
  logWithTime(\`🔄 第\${LoaderState.retryCount}次重试...\`);
  
  LoaderState.cssLoaded = false;
  LoaderState.jsLoaded = false;
  LoaderState.appInitialized = false;
  
  setTimeout(startLoad, CDN_CONFIG.retryDelay);
}

// 13. 主加载流程
async function startLoad() {
  try {
    logWithTime('🚀 开始加载CDN资源...');
    
    await Promise.all([
      loadCSS().catch(err => {
        logWithTime(\`⚠️ CSS加载失败: \${err.message}\`, 'warn');
        createFallbackUI();
      }),
      loadJS()
    ]);
    
    await checkAppInitialization();
    
    if (window.initializeApp) {
      logWithTime('🎯 调用应用初始化...');
      try {
        window.initializeApp();
      } catch (error) {
        logWithTime(\`❌ 应用初始化失败: \${error.message}\`, 'error');
      }
    }
    
    logWithTime('🎉 H5Tools加载完成！');
    
  } catch (error) {
    logWithTime(\`❌ 加载失败: \${error.message}\`, 'error');
    await retryLoad();
  }
}

// 14. 启动加载
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    logWithTime('📄 DOM已就绪');
    startLoad();
    initBasicTabSwitching();
  });
} else {
  logWithTime('📄 DOM已就绪（页面已加载）');
  startLoad();
  initBasicTabSwitching();
}

// 15. 全局错误处理
window.addEventListener('error', (event) => {
  logWithTime(\`🚨 全局错误: \${event.error?.message || event.message}\`, 'error');
});

// 16. 发送UI就绪消息
setTimeout(() => {
  if (window.figmaBridge) {
    window.figmaBridge.postMessage({ type: 'ui-loaded' });
    logWithTime('📤 发送UI就绪消息');
  }
}, 500);

logWithTime('🔧 H5Tools 终极CDN加载器已就绪');`;

    // 替换HTML中的模板内容
    htmlContent = htmlContent.replace('{{EXTERNAL_CSS_LINK}}', 
      '<link id="external-styles" rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css">');
    
    htmlContent = htmlContent.replace('{{APP_SCRIPTS}}', 
      `<script>\n${ultimateCDNLoaderCode}\n</script>`);
    
    // 写入HTML文件
    const htmlOutputPath = 'dist/ui.html';
    fs.writeFileSync(htmlOutputPath, htmlContent);
    
    console.log(`✅ HTML文件生成: ${htmlOutputPath}`);
    
    return {
      cssSize: cssContent.length,
      jsSize: jsContent.length,
      htmlSize: htmlContent.length
    };
  } catch (error) {
    console.error('❌ HTML构建失败:', error);
    throw error;
  }
}

// 主构建函数
async function build() {
  try {
    console.log('🚀 开始H5Tools统一构建...');
    const startTime = Date.now();
    
    clearDistDirectory();
    await buildCore();
    await buildPlugin();
    const buildResult = buildHTML();
    
    const duration = Date.now() - startTime;
    console.log(`\n🎉 构建完成! 耗时: ${duration}ms`);
    console.log('📊 构建统计:');
    console.log(`   CSS文件: ${(buildResult.cssSize / 1024).toFixed(1)}KB`);
    console.log(`   JS文件: ${(buildResult.jsSize / 1024).toFixed(1)}KB`); 
    console.log(`   HTML文件: ${(buildResult.htmlSize / 1024).toFixed(1)}KB`);
    
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

build();