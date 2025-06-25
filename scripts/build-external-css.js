const fs = require('fs');
const path = require('path');

// 🎯 GitHub配置 - 根据您提供的链接配置
const GITHUB_CONFIG = {
  username: 'kw-96',
  repo: 'H5Tools',
  branch: 'main'  // 或者 'master'，根据您的默认分支
};

/**
 * 生成jsDelivr CDN链接
 * @param {string} filePath 文件路径（相对于仓库根目录）
 * @returns {string} CDN链接
 */
function generateCDNUrl(filePath) {
  return `https://cdn.jsdelivr.net/gh/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}@${GITHUB_CONFIG.branch}/${filePath}`;
}

/**
 * 读取并合并所有CSS文件
 * @returns {string} 合并后的CSS内容
 */
function combineCSS() {
  // 正确的CSS文件顺序，排除包含@import的app-new.css
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
  combinedCSS += `/* CDN链接: ${generateCDNUrl('dist/styles.min.css')} */\n\n`;
  
  cssFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // 移除@import语句，因为我们要直接合并文件内容
      content = content.replace(/@import\s+[^;]+;/g, '');
      
      // 跳过空文件或只包含@import的文件
      const cleanContent = content.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (cleanContent.length === 0) {
        console.warn(`⚠️  跳过空CSS文件: ${filePath}`);
        return;
      }
      
      combinedCSS += `\n/* === ${path.basename(filePath)} === */\n`;
      combinedCSS += content;
      combinedCSS += `\n/* === End ${path.basename(filePath)} === */\n`;
    } else {
      console.warn(`⚠️  CSS文件不存在: ${filePath}`);
    }
  });
  
  // 轻量级CSS优化（保留换行和基本格式）
  combinedCSS = combinedCSS
    .replace(/\/\*\s*===.*?===\s*\*\//g, '') // 移除分隔注释
    .replace(/\n\s*\n\s*\n/g, '\n\n') // 移除多余空行
    .replace(/\s*{\s*/g, ' {\n  ') // 格式化大括号
    .replace(/;\s*}/g, ';\n}') // 格式化结束大括号
    .replace(/}\s*/g, '}\n\n') // 在规则间添加空行
    .trim();
  
  console.log(`✅ CSS合并完成: ${(combinedCSS.length / 1024).toFixed(1)}KB`);
  return combinedCSS;
}

/**
 * 生成外部CSS版本的HTML模板
 * @returns {string} HTML内容
 */
function generateExternalHTML() {
  const cdnUrl = generateCDNUrl('dist/styles.min.css');
  
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>渠道美术-H5延展工具</title>
  
  <!-- jsDelivr CDN 样式 - 自动缓存和加速 -->
  <link rel="stylesheet" href="${cdnUrl}" id="external-styles">
  
  <!-- 样式加载状态管理 -->
  <style id="loading-styles">
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
      color: #666;
    }
    .loading-content {
      text-align: center;
      padding: 20px;
    }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e0e0e0;
      border-top: 3px solid #0066cc;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .hidden { display: none !important; }
  </style>
  
  <!-- 备用内联样式（核心样式压缩版） -->
  <style id="fallback-styles" class="hidden">
    /* 核心备用样式 - 确保基本功能可用 */
    body { 
      font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; 
      margin: 0; 
      padding: 16px; 
      background: #f8f9fa; 
      color: #333;
    }
    .container { 
      max-width: 400px; 
      margin: 0 auto; 
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .tab-container {
      display: flex;
      background: #ffffff;
      border-bottom: 1px solid #e0e0e0;
    }
    .tab {
      flex: 1;
      padding: 12px 8px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;
    }
    .tab.active { 
      background: #f0f7ff; 
      border-bottom-color: #0066cc; 
      color: #0066cc;
    }
    .tab-content {
      padding: 20px;
      display: none;
    }
    .tab-content.active { display: block; }
    .form-section {
      margin-bottom: 24px;
      padding: 16px;
      background: #fafafa;
      border-radius: 6px;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .form-group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }
    .text-input, .text-area {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .btn, .upload-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .btn-primary { 
      background: #0066cc; 
      color: white; 
    }
    .btn-primary:hover { 
      background: #0052a3; 
    }
    .error { 
      color: #dc3545; 
      background: #f8d7da; 
      padding: 8px 12px; 
      border-radius: 4px; 
      margin: 8px 0;
    }
    .success { 
      color: #155724; 
      background: #d4edda; 
      padding: 8px 12px; 
      border-radius: 4px; 
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <!-- 加载覆盖层 -->
  <div id="loading-overlay" class="loading-overlay">
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div>正在加载样式...</div>
      <div style="font-size: 12px; margin-top: 8px; color: #999;">
        通过jsDelivr CDN加载中
      </div>
    </div>
  </div>
  
  <!-- 应用主体内容 -->
  <div id="app-content" class="hidden">
    {{APP_CONTENT}}
  </div>

  <script>
    // 样式加载管理器
    class StyleLoadManager {
      constructor() {
        this.isStyleLoaded = false;
        this.loadTimeout = 5000; // 5秒超时
        this.init();
      }
      
      init() {
        this.checkStyleLoad();
        this.setupTimeout();
        this.setupFallbackDetection();
      }
      
      checkStyleLoad() {
        const link = document.getElementById('external-styles');
        if (link) {
          link.onload = () => this.onStylesLoaded();
          link.onerror = () => this.onStylesLoadFailed('加载失败');
        }
      }
      
      setupTimeout() {
        setTimeout(() => {
          if (!this.isStyleLoaded) {
            this.onStylesLoadFailed('加载超时');
          }
        }, this.loadTimeout);
      }
      
      setupFallbackDetection() {
        // 通过检测特定样式规则来验证CSS是否真正加载
        window.addEventListener('load', () => {
          setTimeout(() => {
            if (!this.isStyleLoaded) {
              this.checkStyleRules();
            }
          }, 1000);
        });
      }
      
      checkStyleRules() {
        try {
          const sheets = Array.from(document.styleSheets);
          const externalSheet = sheets.find(sheet => 
            sheet.href && sheet.href.includes('jsdelivr')
          );
          
          if (externalSheet && externalSheet.cssRules && externalSheet.cssRules.length > 0) {
            this.onStylesLoaded();
          } else {
            this.onStylesLoadFailed('样式规则为空');
          }
        } catch (e) {
          this.onStylesLoadFailed('样式检测失败');
        }
      }
      
      onStylesLoaded() {
        if (this.isStyleLoaded) return;
        this.isStyleLoaded = true;
        
        console.log('✅ 外部样式加载成功');
        this.hideLoading();
        this.showApp();
      }
      
      onStylesLoadFailed(reason) {
        if (this.isStyleLoaded) return;
        this.isStyleLoaded = true;
        
        console.warn(\`⚠️ 外部样式加载失败: \${reason}，启用备用样式\`);
        this.enableFallbackStyles();
        this.updateLoadingMessage('使用备用样式模式');
        
        setTimeout(() => {
          this.hideLoading();
          this.showApp();
        }, 1000);
      }
      
      enableFallbackStyles() {
        const fallbackStyles = document.getElementById('fallback-styles');
        if (fallbackStyles) {
          fallbackStyles.classList.remove('hidden');
        }
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
    
    // 初始化样式加载管理器
    document.addEventListener('DOMContentLoaded', () => {
      new StyleLoadManager();
    });
    
    // 全局错误处理
    window.addEventListener('error', (e) => {
      if (e.target && e.target.tagName === 'LINK') {
        console.error('样式文件加载错误:', e);
      }
    });
  </script>
  
  <!-- 应用JavaScript将在这里插入 -->
  {{APP_SCRIPTS}}
</body>
</html>`;
}

/**
 * 从现有HTML文件提取应用内容
 * @returns {string} 应用内容HTML
 */
function extractAppContent() {
  const htmlPath = 'src/ui/index.html';
  
  if (!fs.existsSync(htmlPath)) {
    console.warn('⚠️ 源HTML文件不存在，使用空内容');
    return '';
  }
  
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // 提取body内容（移除head中的样式引用）
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1];
  }
  
  console.warn('⚠️ 无法提取应用内容，使用空内容');
  return '';
}

/**
 * 读取并合并JavaScript文件
 * @returns {string} 合并后的JavaScript内容
 */
function combineJavaScript() {
  // 根据您当前的JS文件结构配置
  const jsFiles = [
    'src/ui/scripts/data-manager.js',
    'src/ui/scripts/file-processor.js',
    'src/ui/scripts/image-slice-handler.js',
    'src/ui/scripts/plugin-communicator.js',
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
  
  let combinedJS = '// H5Tools UI Scripts - 外部CSS版本\n';
  combinedJS += '// jsDelivr CDN样式 + 内联JavaScript\n';
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
  
  console.log(`✅ JavaScript合并完成: ${(combinedJS.length / 1024).toFixed(1)}KB`);
  return combinedJS;
}

/**
 * 构建外部CSS版本
 */
async function buildExternalVersion() {
  console.log('🌐 构建外部CSS版本...');
  console.log(`🎯 GitHub仓库: ${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}`);
  
  // 1. 确保dist目录存在
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  // 2. 合并CSS文件
  const combinedCSS = combineCSS();
  fs.writeFileSync('dist/styles.min.css', combinedCSS);
  console.log('✅ CSS合并完成:', 'dist/styles.min.css');
  
  // 3. 生成外部HTML模板
  let htmlTemplate = generateExternalHTML();
  
  // 4. 提取应用内容
  const appContent = extractAppContent();
  
  // 5. 合并JavaScript
  const jsContent = combineJavaScript();
  
  // 6. 替换模板占位符
  htmlTemplate = htmlTemplate
    .replace('{{APP_CONTENT}}', appContent)
    .replace('{{APP_SCRIPTS}}', `<script>${jsContent}</script>`);
  
  // 7. 写入最终HTML
  fs.writeFileSync('dist/ui-external.html', htmlTemplate);
  console.log('✅ 外部版本HTML生成:', 'dist/ui-external.html');
  
  // 8. 显示关键信息
  const cdnUrl = generateCDNUrl('dist/styles.min.css');
  console.log('\n📋 重要信息:');
  console.log(`🔗 CDN链接: ${cdnUrl}`);
  console.log(`📁 CSS文件大小: ${(combinedCSS.length / 1024).toFixed(1)}KB`);
  console.log(`📁 HTML文件大小: ${(htmlTemplate.length / 1024).toFixed(1)}KB`);
  
  console.log('\n🚀 下一步操作:');
  console.log('1. 提交dist/styles.min.css到GitHub:');
  console.log('   git add dist/styles.min.css dist/ui-external.html');
  console.log('   git commit -m "添加外部CSS版本构建产物"');
  console.log('   git push origin main');
  console.log('2. 等待1-2分钟让jsDelivr缓存更新');
  console.log(`3. 测试CDN链接: ${cdnUrl}`);
  console.log('4. 修改manifest.json中的ui路径为"dist/ui-external.html"');
  console.log('5. 在Figma中重新加载插件测试');
  
  return {
    cdnUrl,
    cssSize: combinedCSS.length,
    htmlSize: htmlTemplate.length
  };
}

// 导出函数
module.exports = {
  GITHUB_CONFIG,
  generateCDNUrl,
  combineCSS,
  buildExternalVersion
};

// 如果直接运行此脚本
if (require.main === module) {
  buildExternalVersion().catch(console.error);
} 