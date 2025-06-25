// H5Tools 构建脚本 - 外部CSS版本
// 用于编译TypeScript文件到dist目录，并构建外部CSS版本

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

// 主构建函数 - 仅构建外部CSS版本
function build() {
  console.log('🚀 开始构建H5Tools（外部CSS版本）...\n');
  
  try {
    // 1. 清理输出目录
    cleanDist();
    
    // 2. 构建核心库
    buildCore();
    
    // 3. 构建插件
    buildPlugin();
    
    // 4. 构建外部CSS版本
    console.log('🌐 构建外部CSS版本...');
    const { buildExternalVersion } = require('./scripts/build-external-css');
    const result = buildExternalVersion();
    
    console.log('\n✅ H5Tools外部CSS版本构建完成！');
    console.log('🌐 CSS将通过jsDelivr CDN加载');
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
    
    console.log('\n🔧 外部CSS版本特性:');
    console.log('   ✅ CSS通过CDN加载，减小HTML体积');
    console.log('   ✅ StyleLoadManager智能加载管理');
    console.log('   ✅ 备用样式自动降级保障');
    console.log('   ✅ 支持CDN缓存和全球加速');
    
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
  buildPlugin
}; 