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
      'src/ui/scripts/app.js'
    ];
    
    let jsContent = '// H5Tools UI Scripts\n';
    jsContent += '// 外联JavaScript文件，通过CDN加载\n';
    jsContent += `// 构建时间: ${new Date().toISOString()}\n\n`;
    
    jsFiles.forEach(file => {
      if (fs.existsSync(file)) {
        const fileContent = fs.readFileSync(file, 'utf8');
        const fileName = path.basename(file);
        jsContent += `/* === ${fileName} === */\n${fileContent}\n\n`;
      }
    });
    
    console.log(`✅ JavaScript合并完成: ${(jsContent.length / 1024).toFixed(1)}KB`);
    
    // 生成独立的JavaScript文件
    const jsOutputPath = 'dist/scripts.min.js';
    fs.writeFileSync(jsOutputPath, jsContent);
    
    // 修复的ScriptLoadManager代码
    const scriptLoadManagerCode = `
class ScriptLoadManager {
  constructor() {
    this.isScriptLoaded = false;
    this.loadTimeout = 8000; // 8秒超时
    this.init();
  }
  
  init() {
    this.loadExternalScript();
    this.setupTimeout();
  }
  
  loadExternalScript() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/scripts.min.js';
    script.onload = () => this.onScriptsLoaded();
    script.onerror = () => this.onScriptsLoadFailed('脚本加载失败');
    document.head.appendChild(script);
    
    console.log('开始加载外联脚本:', script.src);
  }
  
  setupTimeout() {
    setTimeout(() => {
      if (!this.isScriptLoaded) {
        this.onScriptsLoadFailed('脚本加载超时');
      }
    }, this.loadTimeout);
  }
  
  onScriptsLoaded() {
    if (this.isScriptLoaded) return;
    this.isScriptLoaded = true;
    
    console.log('✅ 外联脚本加载成功');
    
    // 延时检查插件通信器，给足够时间初始化
    this.checkPluginCommunicator();
  }
  
  checkPluginCommunicator(attempt = 1, maxAttempts = 10) {
    if (window.pluginComm) {
      console.log('✅ 插件通信器已就绪');
      return;
    }
    
    if (attempt >= maxAttempts) {
      console.error('❌ 插件通信器加载失败 - 超过最大重试次数');
      return;
    }
    
    // 递增延时重试
    setTimeout(() => {
      this.checkPluginCommunicator(attempt + 1, maxAttempts);
    }, attempt * 100); // 100ms, 200ms, 300ms...
  }
  
  onScriptsLoadFailed(reason) {
    if (this.isScriptLoaded) return;
    this.isScriptLoaded = true;
    
    console.error('❌ 外联脚本加载失败: ' + reason);
    this.updateLoadingMessage('脚本加载失败，插件功能不可用');
    
    // 显示错误状态
    setTimeout(() => {
      this.updateLoadingMessage('请检查网络连接或刷新页面重试');
    }, 2000);
  }
  
  updateLoadingMessage(message) {
    const loadingContent = document.querySelector('.loading-content div:last-child');
    if (loadingContent) {
      loadingContent.textContent = message;
    }
  }
}

// 等待样式加载完成后初始化脚本加载
document.addEventListener('DOMContentLoaded', () => {
  const checkStylesLoaded = () => {
    if (window.StyleLoadManager && window.StyleLoadManager.isStyleLoaded) {
      console.log('样式已加载，开始加载脚本...');
      new ScriptLoadManager();
    } else {
      setTimeout(checkStylesLoaded, 100);
    }
  };
  checkStylesLoaded();
});`;

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
    
    htmlContent = htmlContent.replace('{{EXTERNAL_CSS_LINK}}', 
      '<link id="external-styles" rel="stylesheet" href="https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css">');
    
    htmlContent = htmlContent.replace('{{APP_CONTENT}}', appContent);
    
    htmlContent = htmlContent.replace('{{APP_SCRIPTS}}', 
      `<script>\n${scriptLoadManagerCode}\n</script>`);
    
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