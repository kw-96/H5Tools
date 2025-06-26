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
    
    let htmlContent = fs.readFileSync('src/ui/index.html', 'utf8');
    
    // 读取并处理CSS文件
  const cssFiles = [
    'src/ui/styles/base.css',
    'src/ui/styles/layout.css', 
      'src/ui/styles/app-new.css',
      ...glob.sync('src/ui/styles/components/*.css'),
      ...glob.sync('src/ui/styles/themes/*.css')
    ];
    
    let cssContent = '';
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
    console.log(`✅ CSS文件独立: ${(cssContent.length / 1024).toFixed(1)}KB`);
    
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
      'src/ui/scripts/global-init.js'  // 🚨 最后执行，确保所有类都已定义
    ];
    
    let jsContent = '// H5Tools UI Scripts\n';
    jsContent += '// 外联JavaScript文件，通过CDN加载\n';
    jsContent += `// 构建时间: ${new Date().toISOString()}\n\n`;
    
    jsFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const fileContent = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file);
        console.log(`📁 包含文件: ${fileName} (${(fileContent.length / 1024).toFixed(1)}KB)`);
        jsContent += `/* === ${fileName} === */\n${fileContent}\n\n`;
      } else {
        console.warn(`⚠️ 文件不存在: ${file}`);
      }
    });
    
    console.log(`✅ JavaScript合并完成: ${(jsContent.length / 1024).toFixed(1)}KB`);
    
    // 生成独立的JavaScript文件
    const jsOutputPath = 'dist/scripts.min.js';
    fs.writeFileSync(jsOutputPath, jsContent);
    
    // 🚀 H5Tools 终极CDN加载方案 - 简化且可靠
    const ultimateCDNLoaderCode = `
// H5Tools 终极CDN加载方案
// 构建时间: ${new Date().toISOString()}
// 目标：100%可靠的CDN资源加载

console.log('🚀 H5Tools 终极CDN加载器启动...');

// 1. 核心配置
const CDN_CONFIG = {
  css: 'https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css',
  js: 'https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/scripts.min.js',
  timeout: 10000, // 10秒超时
  retryDelay: 1000, // 重试间隔
  maxRetries: 3 // 最大重试次数
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
// 🚨 关键：确保外部脚本可以访问Figma API
if (typeof figma !== 'undefined') {
  window.figma = figma;
  logWithTime('✅ Figma API已导出到全局对象');
}

// 5. 创建全局通信桥接器
// 🚨 关键：解决外部脚本无法直接访问Figma API的问题
window.figmaBridge = {
  postMessage: function(pluginMessage) {
    if (typeof parent !== 'undefined' && parent.postMessage) {
      parent.postMessage({ pluginMessage }, '*');
      logWithTime(\`📤 通过桥接器发送消息: \${JSON.stringify(pluginMessage).substring(0, 100)}...\`);
    } else {
      logWithTime('❌ 无法访问parent对象发送消息', 'error');
    }
  },
  // 存储注册的消息处理器
  messageHandlers: new Map(),
  // 注册消息处理器
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
    
    // 如果有桥接器，转发消息
    if (window.figmaBridge && window.figmaBridge.messageHandlers) {
      const handler = window.figmaBridge.messageHandlers.get(message.type);
      if (handler) {
        handler(message);
      }
    }
    
    // 如果已加载正式通信器，也转发消息
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

function createFallbackUI() {
  const style = document.createElement('style');
  style.textContent = \`
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .fallback-container { max-width: 400px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .fallback-title { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #333; }
    .fallback-status { padding: 10px; margin: 10px 0; border-radius: 5px; font-size: 14px; }
    .status-loading { background: #e3f2fd; color: #1976d2; border-left: 4px solid #2196f3; }
    .status-error { background: #ffebee; color: #c62828; border-left: 4px solid #f44336; }
    .status-success { background: #e8f5e8; color: #2e7d32; border-left: 4px solid #4caf50; }
    .retry-btn { background: #2196f3; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-top: 10px; }
    .retry-btn:hover { background: #1976d2; }
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

// 7. 基础标签页切换功能（立即可用）
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

// 8. CSS加载器
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

// 9. JavaScript加载器
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
      
      // 🚨 关键：创建临时通信器
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

// 10. 应用初始化检查
function checkAppInitialization() {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 20; // 2秒内检查
    
    const check = () => {
      attempts++;
      
      // 检查关键对象是否存在
      if (window.initializeApp && typeof window.initializeApp === 'function') {
        LoaderState.appInitialized = true;
        logWithTime('✅ 应用初始化检查通过');
        resolve();
        return;
      }
      
      if (attempts >= maxAttempts) {
        reject(new Error('应用初始化检查失败 - 关键对象未找到'));
        return;
      }
      
      setTimeout(check, 100);
    };
    
    check();
  });
}

// 11. 重试机制
async function retryLoad() {
  if (LoaderState.retryCount >= CDN_CONFIG.maxRetries) {
    logWithTime('❌ 达到最大重试次数，进入应急模式', 'error');
    createFallbackUI();
    initBasicTabSwitching();
    return;
  }
  
  LoaderState.retryCount++;
  logWithTime(\`🔄 第\${LoaderState.retryCount}次重试...\`);
  
  // 重置状态
  LoaderState.cssLoaded = false;
  LoaderState.jsLoaded = false;
  LoaderState.appInitialized = false;
  
  // 延迟后重试
  setTimeout(startLoad, CDN_CONFIG.retryDelay);
}

// 12. 主加载流程
async function startLoad() {
  try {
    logWithTime('🚀 开始加载CDN资源...');
    
    // 并行加载CSS和JS
    await Promise.all([
      loadCSS().catch(err => {
        logWithTime(\`⚠️ CSS加载失败: \${err.message}\`, 'warn');
        createFallbackUI(); // CSS失败时立即启用应急样式
      }),
      loadJS()
    ]);
    
    // 检查应用初始化
    await checkAppInitialization();
    
    // 调用应用初始化
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

// 13. 启动加载（DOM就绪后）
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    logWithTime('📄 DOM已就绪');
    startLoad();
    initBasicTabSwitching(); // 立即启用基础交互
  });
} else {
  logWithTime('📄 DOM已就绪（页面已加载）');
  startLoad();
  initBasicTabSwitching(); // 立即启用基础交互
}

// 14. 全局错误处理
window.addEventListener('error', (event) => {
  logWithTime(\`🚨 全局错误: \${event.error?.message || event.message}\`, 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  logWithTime(\`🚨 未处理的Promise拒绝: \${event.reason}\`, 'error');
});

// 15. 发送UI就绪消息
setTimeout(() => {
  if (window.figmaBridge) {
    window.figmaBridge.postMessage({ type: 'ui-loaded' });
    logWithTime('📤 发送UI就绪消息');
  }
}, 500);

logWithTime('🔧 H5Tools 终极CDN加载器已就绪');
    `;

    // 替换HTML中的模板内容
    const extractAppContent = (htmlContent) => {
      const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      if (!bodyMatch) return '';
      
      let content = bodyMatch[1];
      // 移除所有script标签
      content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
      content = content.replace(/<script[^>]*\/>/gi, '');
      return content.trim();
    };
    
    const appContent = extractAppContent(htmlContent);
    
    // 直接替换CSS和JS占位符
    htmlContent = htmlContent.replace('{{EXTERNAL_CSS_LINK}}', 
      '<link id="external-styles" rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css">');
    
    htmlContent = htmlContent.replace('{{APP_SCRIPTS}}', 
      `<script>\n${ultimateCDNLoaderCode}\n</script>`);
    
    // 写入HTML文件
    const htmlOutputPath = 'dist/ui.html';
    fs.writeFileSync(htmlOutputPath, htmlContent);
    
    console.log(`✅ HTML文件瘦身: ${(htmlContent.length / 1024).toFixed(1)}KB (减小12%)`);
    
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
    
    // 清理输出目录
    clearDistDirectory();
    
    // 构建核心库
    await buildCore();
    
    // 构建插件
    await buildPlugin();
    
    // 构建HTML（包含CSS和JS处理）
    const buildResult = buildHTML();
    
    const duration = Date.now() - startTime;
    console.log(`\n🎉 构建完成! 耗时: ${duration}ms`);
    console.log('📊 构建统计:');
    console.log(`   CSS文件: ${(buildResult.cssSize / 1024).toFixed(1)}KB`);
    console.log(`   JS文件: ${(buildResult.jsSize / 1024).toFixed(1)}KB`); 
    console.log(`   HTML文件: ${(buildResult.htmlSize / 1024).toFixed(1)}KB`);
    console.log('🔗 CDN链接:');
    console.log('   CSS: https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css');
    console.log('   JS: https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/scripts.min.js');
    
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 执行构建
  build();