// 模式切换脚本
// 用于在内联模式和外部CSS模式之间切换

const fs = require('fs');
const path = require('path');

const MODES = {
  INLINE: 'inline',
  EXTERNAL: 'external'
};

const CONFIGS = {
  [MODES.INLINE]: {
    manifest: 'manifest.json',
    description: '内联模式 - 所有CSS和JS内联，适配Figma插件沙盒环境'
  },
  [MODES.EXTERNAL]: {
    manifest: 'manifest.external.json', 
    description: '外部模式 - CSS通过jsDelivr CDN加载，减小插件体积'
  }
};

function getCurrentMode() {
  if (!fs.existsSync('manifest.json')) {
    console.error('❌ manifest.json 文件不存在');
    return null;
  }
  
  const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
  
  if (manifest.ui === 'dist/ui.html') {
    return MODES.INLINE;
  } else if (manifest.ui === 'dist/ui-external.html') {
    return MODES.EXTERNAL;
  }
  
  return 'unknown';
}

function switchToMode(targetMode) {
  if (!CONFIGS[targetMode]) {
    console.error(`❌ 未知模式: ${targetMode}`);
    console.log('支持的模式:', Object.keys(CONFIGS).join(', '));
    return false;
  }
  
  const config = CONFIGS[targetMode];
  
  // 检查目标配置文件是否存在
  if (!fs.existsSync(config.manifest)) {
    console.error(`❌ 配置文件不存在: ${config.manifest}`);
    return false;
  }
  
  try {
    // 备份当前manifest
    if (fs.existsSync('manifest.json')) {
      const currentMode = getCurrentMode();
      if (currentMode && currentMode !== 'unknown') {
        const backupFile = `manifest.${currentMode}.json`;
        fs.copyFileSync('manifest.json', backupFile);
        console.log(`📁 当前配置已备份为: ${backupFile}`);
      }
    }
    
    // 复制目标配置
    fs.copyFileSync(config.manifest, 'manifest.json');
    console.log(`✅ 已切换到${targetMode}模式`);
    console.log(`📝 ${config.description}`);
    
    return true;
  } catch (error) {
    console.error(`❌ 切换失败: ${error.message}`);
    return false;
  }
}

function showStatus() {
  const currentMode = getCurrentMode();
  
  console.log('📊 当前模式状态:');
  console.log(`   当前模式: ${currentMode || '未知'}`);
  
  if (currentMode && CONFIGS[currentMode]) {
    console.log(`   描述: ${CONFIGS[currentMode].description}`);
  }
  
  console.log('\n🔧 可用模式:');
  Object.entries(CONFIGS).forEach(([mode, config]) => {
    const isCurrent = mode === currentMode;
    const marker = isCurrent ? '👉' : '  ';
    console.log(`${marker} ${mode}: ${config.description}`);
  });
  
  console.log('\n💡 使用方法:');
  console.log('   node scripts/switch-mode.js inline   # 切换到内联模式');
  console.log('   node scripts/switch-mode.js external # 切换到外部CSS模式');
  console.log('   node scripts/switch-mode.js status   # 显示当前状态');
}

// 主逻辑
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command || command === 'status') {
    showStatus();
    return;
  }
  
  if (command === 'inline' || command === 'external') {
    const success = switchToMode(command);
    if (success) {
      console.log('\n🚀 下一步操作:');
      if (command === 'external') {
        console.log('1. 运行: npm run build:external');
        console.log('2. 提交CSS文件到GitHub');
        console.log('3. 在Figma中重新加载插件');
      } else {
        console.log('1. 运行: npm run build');
        console.log('2. 在Figma中重新加载插件');
      }
    }
  } else {
    console.error(`❌ 未知命令: ${command}`);
    showStatus();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  getCurrentMode,
  switchToMode,
  showStatus,
  MODES
}; 