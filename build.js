// H5Tools 构建脚本
// 用于编译TypeScript文件到dist目录

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

// 读取并合并CSS文件
function readAndCombineCSS() {
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
  
  let combinedCSS = `/* H5Tools - 渠道美术H5延展工具样式文件 */\n`;
  combinedCSS += `/* 版本: 2.0.0 - 内联版本，适配Figma插件沙盒环境 */\n\n`;
  
  cssFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      combinedCSS += `/* === ${path.basename(filePath)} === */\n`;
      combinedCSS += content;
      combinedCSS += `\n/* === End ${path.basename(filePath)} === */\n\n`;
    } else {
      console.warn(`⚠️  CSS文件不存在: ${filePath}`);
    }
  });
  
  console.log(`✅ CSS合并完成: ${(combinedCSS.length / 1024).toFixed(1)}KB`);
  return combinedCSS;
}

// 读取并合并JavaScript文件
function readAndCombineJS() {
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
  
  let combinedJS = `// H5Tools UI Scripts - 内联版本\n`;
  combinedJS += `// 适配Figma插件沙盒环境，所有脚本已内联\n`;
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

// 构建内联HTML文件（适配Figma插件沙盒）
function buildInlineHTML() {
  const htmlPath = path.join(config.uiDir, 'index.html');
  
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`HTML文件不存在: ${htmlPath}`);
  }
  
  // 读取原始HTML
  let htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // 获取合并的CSS和JS内容
  const cssContent = readAndCombineCSS();
  const jsContent = readAndCombineJS();
  
  // 替换外部CSS链接为内联样式
  htmlContent = htmlContent.replace(
    /<link[^>]*rel="stylesheet"[^>]*>/gi,
    `<style>${cssContent}</style>`
  );
  
  // 移除现有的外部script标签（包括换行符）
  htmlContent = htmlContent.replace(/<script[^>]*src="[^"]*"[^>]*><\/script>\s*/gi, '');
  
  // 在</body>之前添加内联JavaScript
  const inlineScript = `<script>${jsContent}</script>`;
  htmlContent = htmlContent.replace('</body>', `${inlineScript}\n</body>`);
  
  // 添加Figma插件沙盒适配说明
  const figmaComment = `<!-- 
H5Tools UI - Figma插件沙盒适配版本
构建时间: ${new Date().toISOString()}
版本: 2.0.0
特性: 所有CSS和JavaScript已内联，适配Figma插件沙盒环境
CSS大小: ${(cssContent.length / 1024).toFixed(1)}KB
JS大小: ${(jsContent.length / 1024).toFixed(1)}KB
总大小: ${((htmlContent.length + cssContent.length + jsContent.length) / 1024).toFixed(1)}KB
-->`;
  
  htmlContent = htmlContent.replace('</head>', `${figmaComment}\n</head>`);
  
  // 确保字符编码正确
  if (!htmlContent.includes('charset=')) {
    htmlContent = htmlContent.replace('<head>', '<head>\n  <meta charset="UTF-8">');
  }
  
  // 写入最终HTML文件
  const outputPath = path.join(config.distDir, 'ui.html');
  fs.writeFileSync(outputPath, htmlContent, 'utf8');
  
  console.log(`✅ 内联HTML构建完成: ${(htmlContent.length / 1024).toFixed(1)}KB`);
  console.log(`📦 Figma插件沙盒适配: CSS + JS 已完全内联`);
  
  return htmlContent;
}

// 主构建函数
function build() {
  console.log('🚀 开始构建H5Tools (Figma插件沙盒适配版本)...\n');
  
  try {
    // 1. 清理输出目录
    cleanDist();
    
    // 2. 构建核心库
    buildCore();
    
    // 3. 构建插件
    buildPlugin();
    
    // 4. 构建内联HTML（适配Figma沙盒）
    buildInlineHTML();
    
    console.log('\n✅ H5Tools构建完成！');
    console.log('🎯 已适配Figma插件沙盒环境');
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
    
    console.log('\n🔧 Figma插件沙盒适配说明:');
    console.log('   ✅ CSS已内联到HTML中');
    console.log('   ✅ JavaScript已内联到HTML中');
    console.log('   ✅ 无外部资源依赖');
    console.log('   ✅ 符合Figma插件安全策略');
    
  } catch (error) {
    console.error('\n❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  build();
}

module.exports = { build }; 