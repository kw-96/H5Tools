// H5Tools 主构建脚本 - 外部CSS版本
// 统一构建脚本，包含核心库、插件和外部CSS版本构建

const fs = require('fs');
const path = require('path');

// 构建配置
const config = {
  srcDir: 'src',
  distDir: 'dist',
  coreDir: 'src/core',
  pluginDir: 'src/plugin', 
  uiDir: 'src/ui'
};

// GitHub配置
const GITHUB_CONFIG = {
  username: 'kw-96',
  repo: 'H5Tools',
  branch: 'main'
};

// 清理dist目录
function cleanDist() {
  if (fs.existsSync(config.distDir)) {
    fs.rmSync(config.distDir, { recursive: true, force: true });
  }
  fs.mkdirSync(config.distDir, { recursive: true });
  console.log('✅ 清理dist目录完成');
}

// 构建核心库
function buildCore() {
  const { execSync } = require('child_process');
  
  try {
    // 使用TypeScript编译核心库
    execSync('npx tsc -p src/core/tsconfig.json', { stdio: 'inherit' });
    console.log('✅ 核心库构建完成');
  } catch (error) {
    console.error('❌ 核心库构建失败:', error.message);
    throw error;
  }
}

// 构建插件
function buildPlugin() {
  const { execSync } = require('child_process');
  
  try {
    // 确保插件输出目录存在
    const pluginDistDir = path.join(config.distDir, 'plugin');
    if (!fs.existsSync(pluginDistDir)) {
      fs.mkdirSync(pluginDistDir, { recursive: true });
    }
    
    // 使用Rollup构建插件，解决模块系统问题
    execSync('npx rollup -c rollup.config.js', { stdio: 'inherit' });
    console.log('✅ 插件构建完成');
  } catch (error) {
    console.error('❌ 插件构建失败:', error.message);
    throw error;
  }
}

// 生成CDN URL
function generateCDNUrl(filePath) {
  const fileName = filePath.replace('dist/', '');
  return `https://cdn.jsdelivr.net/gh/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}@${GITHUB_CONFIG.branch}/dist/${fileName}`;
}

// 合并CSS文件
function combineCSS() {
  const cssFiles = [
    'src/ui/styles/base.css',
    'src/ui/styles/layout.css',
    'src/ui/styles/components/notification.css',
    'src/ui/styles/components/loading.css',
    'src/ui/styles/components/tabs.css',
    'src/ui/styles/components/forms.css',
    'src/ui/styles/components/buttons.css',
    'src/ui/styles/components/upload.css',
    'src/ui/styles/components/modules.css',
    'src/ui/styles/components/channels.css',
    'src/ui/styles/themes/dark.css'
  ];
  
  let combinedCSS = '/* H5Tools - 渠道美术H5延展工具样式文件 */\n';
  combinedCSS += '/* 版本: 2.0.0 - jsDelivr CDN版本 */\n';
  combinedCSS += `/* 构建时间: ${new Date().toISOString()} */\n`;
  combinedCSS += `/* CDN链接: ${generateCDNUrl('styles.min.css')} */\n\n`;
  
  cssFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      content = content.replace(/@import\s+[^;]+;/g, '');
      
      const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (cleanContent.length === 0) {
        console.warn(`⚠️  跳过空CSS文件: ${filePath}`);
        return;
      }
      
      combinedCSS += content + '\n';
    } else {
      console.warn(`⚠️  CSS文件不存在: ${filePath}`);
    }
  });
  
  // CSS优化
  combinedCSS = combinedCSS
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();
  
  console.log(`✅ CSS合并完成: ${(combinedCSS.length / 1024).toFixed(1)}KB`);
  return combinedCSS;
}

// 合并外联JavaScript文件
function combineExternalJavaScript() {
  const jsFiles = [
    'src/ui/scripts/plugin-communicator.js', // 🔧 重要：插件通信器必须包含
    'src/ui/scripts/data-manager.js',
    'src/ui/scripts/file-processor.js',
    'src/ui/scripts/image-slice-handler.js',
    'src/ui/scripts/notification-system.js',
    'src/ui/scripts/data-collector.js',
    'src/ui/scripts/ui-controller.js',
    'src/ui/scripts/module-manager.js',
    'src/ui/scripts/image-uploader.js',
    'src/ui/scripts/theme-manager.js',
    'src/ui/scripts/form-resetter.js',
    'src/ui/scripts/channel-manager.js',
    'src/ui/scripts/utility-functions.js',
    'src/ui/scripts/app.js'
  ];
  
  let combinedJS = `// H5Tools UI Scripts\n`;
  combinedJS += `// 外联JavaScript文件，通过CDN加载\n`;
  combinedJS += `// 构建时间: ${new Date().toISOString()}\n\n`;
  
  jsFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      combinedJS += `/* === ${path.basename(filePath)} === */\n`;
      combinedJS += content;
      combinedJS += `\n/* === End ${path.basename(filePath)} === */\n\n`;
    } else {
      console.warn(`⚠️  JS文件不存在: ${filePath}`);
    }
  });
  
  console.log(`✅ 外联JavaScript合并完成: ${(combinedJS.length / 1024).toFixed(1)}KB`);
  return combinedJS;
}

// 生成核心内联JavaScript（仅加载管理相关）
function generateCoreJavaScript() {
  const coreJS = `
// H5Tools 核心JavaScript - 仅加载管理
// 构建时间: ${new Date().toISOString()}

/* === JavaScript加载管理器 === */
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
    script.src = '${generateCDNUrl('scripts.min.js')}';
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
    
    // 脚本加载成功后，检查关键对象是否存在
    if (window.pluginComm) {
      console.log('✅ 插件通信器已就绪');
    } else {
      console.error('❌ 插件通信器加载失败');
    }
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
});
`;

  return coreJS;
}

// 提取应用内容
function extractAppContent() {
  const htmlPath = path.join(config.uiDir, 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`HTML模板文件不存在: ${htmlPath}`);
  }
  
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  
  if (!bodyMatch) {
    throw new Error('无法提取HTML body内容');
  }
  
  let content = bodyMatch[1];
  content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  content = content.replace(/<script[^>]*\/>/gi, '');
  
  return content.trim();
}

// 构建HTML文件
function buildHTML() {
  const cdnUrl = generateCDNUrl('styles.min.css');
  const appContent = extractAppContent();
  const coreJS = generateCoreJavaScript();
  
  // StyleLoadManager代码
  const styleLoadManagerCode = `
    class StyleLoadManager {
      constructor() {
        this.isStyleLoaded = false;
        this.loadTimeout = 10000; // 10秒超时
        this.init();
      }
      
      init() {
        this.checkStyleLoad();
        this.setupTimeout();
      }
      
      checkStyleLoad() {
        const link = document.getElementById('external-styles');
        if (link) {
          link.onload = () => this.onStylesLoaded();
          link.onerror = () => this.onStylesLoadFailed('样式加载失败');
        }
      }
      
      setupTimeout() {
        setTimeout(() => {
          if (!this.isStyleLoaded) {
            this.onStylesLoadFailed('样式加载超时');
          }
        }, this.loadTimeout);
      }
      
      onStylesLoaded() {
        if (this.isStyleLoaded) return;
        this.isStyleLoaded = true;
        
        console.log('✅ 样式加载成功');
        this.hideLoading();
        this.showApp();
        
        // 标记样式已加载，供脚本加载器使用
        window.StyleLoadManager = { isStyleLoaded: true };
      }
      
      onStylesLoadFailed(reason) {
        if (this.isStyleLoaded) return;
        this.isStyleLoaded = true;
        
        console.error('❌ 样式加载失败: ' + reason);
        this.updateLoadingMessage('样式加载失败，请检查网络连接');
        
        setTimeout(() => {
          this.updateLoadingMessage('请刷新页面重试');
        }, 2000);
      }
      
      updateLoadingMessage(message) {
        const loadingContent = document.querySelector('.loading-content div:last-child');
        if (loadingContent) {
          loadingContent.textContent = message;
        }
      }
      
      hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
          loadingOverlay.style.opacity = '0';
          setTimeout(() => {
            loadingOverlay.classList.add('hidden');
          }, 300);
        }
      }
      
      showApp() {
        const appContent = document.getElementById('app-content');
        if (appContent) {
          appContent.classList.remove('hidden');
        }
      }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
      new StyleLoadManager();
    });
    
    window.addEventListener('error', (e) => {
      if (e.target && e.target.tagName === 'LINK') {
        console.error('样式文件加载错误:', e);
      }
    });
  `;

  // 生成完整HTML
  const htmlTemplate = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>渠道美术-H5延展工具</title>
  
  <!-- jsDelivr CDN样式 -->
  <link rel="stylesheet" href="${cdnUrl}" id="external-styles">
  
  <!-- 加载状态样式 -->
  <style id="loading-styles">
    .loading-overlay { 
      position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
      background: #f8f9fa; display: flex; align-items: center; justify-content: center; 
      z-index: 9999; font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; color: #666; 
    }
    .loading-content { text-align: center; padding: 20px; }
    .loading-spinner { 
      width: 40px; height: 40px; border: 3px solid #e0e0e0; border-top: 3px solid #0066cc; 
      border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; 
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .hidden { display: none !important; }
  </style>
  
  <meta name="description" content="H5Tools 渠道美术H5延展工具">
  <meta name="keywords" content="Figma, H5, 设计工具, 渠道适配">
</head>
<body>
  <!-- 加载状态 -->
  <div id="loading-overlay" class="loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div>正在加载样式和脚本...</div>
    </div>
  </div>

  <!-- 应用内容 -->
  <div id="app-content" class="hidden">
    ${appContent}
  </div>

  <!-- 样式加载管理器 -->
  <script>
${styleLoadManagerCode}
  </script>

  <!-- 核心JavaScript（Figma通信） -->
  <script>
${coreJS}
  </script>
</body>
</html>`;

  console.log(`✅ HTML构建完成: ${(htmlTemplate.length / 1024).toFixed(1)}KB`);
  return htmlTemplate;
}

// 主构建函数
function build() {
  console.log('🚀 开始构建H5Tools...\n');
  
  try {
    // 1. 清理输出目录
    cleanDist();
    
    // 2. 构建核心库
    buildCore();
    
    // 3. 构建插件
    buildPlugin();
    
    // 4. 合并CSS并写入文件
    console.log('🎨 构建CSS文件...');
    const combinedCSS = combineCSS();
    fs.writeFileSync(path.join(config.distDir, 'styles.min.css'), combinedCSS);
    console.log('✅ CSS文件生成: dist/styles.min.css');
    
    // 5. 合并外联JavaScript并写入文件
    console.log('📜 构建外联JavaScript文件...');
    const externalJS = combineExternalJavaScript();
    fs.writeFileSync(path.join(config.distDir, 'scripts.min.js'), externalJS);
    console.log('✅ 外联JavaScript文件生成: dist/scripts.min.js');
    
    // 6. 构建HTML文件（包含内联核心JavaScript）
    console.log('🌐 构建HTML文件...');
    const htmlContent = buildHTML();
    fs.writeFileSync(path.join(config.distDir, 'ui.html'), htmlContent);
    console.log('✅ HTML文件生成: dist/ui.html');
    
    console.log('\n✅ H5Tools构建完成！');
    console.log('🌐 CSS和JavaScript将通过jsDelivr CDN加载');
    console.log('📁 输出目录:', config.distDir);
    
    // 显示构建结果
    const distFiles = fs.readdirSync(config.distDir);
    console.log('📦 构建产物:');
    distFiles.forEach(file => {
      const filePath = path.join(config.distDir, file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        console.log(`   ${file}: ${(stats.size / 1024).toFixed(1)}KB`);
      } else {
        console.log(`   ${file}/ (目录)`);
      }
    });
    
    // 显示特性信息
    const cdnStylesUrl = generateCDNUrl('styles.min.css');
    const cdnScriptsUrl = generateCDNUrl('scripts.min.js');
    console.log('\n🔧 项目特性:');
    console.log('   ✅ CSS和JavaScript通过CDN加载，极大减小HTML体积');
    console.log('   ✅ StyleLoadManager和ScriptLoadManager智能加载管理');
    console.log('   ✅ 核心Figma通信代码内联，确保插件基础功能');
    console.log('   ✅ jsDelivr全球CDN加速');
    console.log('   ✅ 支持CDN缓存和版本更新');
    
    console.log('\n📋 重要信息:');
    console.log(`🔗 CSS CDN链接: ${cdnStylesUrl}`);
    console.log(`🔗 JavaScript CDN链接: ${cdnScriptsUrl}`);
    console.log(`📁 CSS文件大小: ${(combinedCSS.length / 1024).toFixed(1)}KB`);
    console.log(`📁 JavaScript文件大小: ${(externalJS.length / 1024).toFixed(1)}KB`);
    console.log(`📁 HTML文件大小: ${(htmlContent.length / 1024).toFixed(1)}KB`);
    
    console.log('\n🚀 下一步操作:');
    console.log('1. 提交构建产物到GitHub:');
    console.log('   git add dist/styles.min.css dist/scripts.min.js dist/ui.html');
    console.log('   git commit -m "外联CSS+JS版本构建产物"');
    console.log('   git push origin main');
    console.log('2. 等待1-2分钟让jsDelivr缓存更新');
    console.log(`3. 测试CDN链接:`);
    console.log(`   - CSS: ${cdnStylesUrl}`);
    console.log(`   - JavaScript: ${cdnScriptsUrl}`);
    console.log('4. 在Figma中重新加载插件测试');
    
  } catch (error) {
    console.error('\n❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  build();
}

module.exports = { 
  build,
  cleanDist,
  buildCore,
  buildPlugin,
  combineCSS,
  combineExternalJavaScript,
  generateCoreJavaScript,
  buildHTML,
  generateCDNUrl,
  GITHUB_CONFIG
}; 