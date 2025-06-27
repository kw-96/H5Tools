// H5Tools 主构建脚本 - 外部CSS版本
// 统一构建脚本，包含核心库、插件和外部CSS版本构建

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { glob } from 'glob';
import { execSync } from 'child_process';
import crypto from 'crypto';
import cssnano from 'cssnano';
import { minify } from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 构建配置
const BUILD_CONFIG = {
  paths: {
    dist: 'dist',
    core: path.join('src', 'core'),
    plugin: path.join('src', 'plugin'),
    ui: {
      root: path.join('src', 'ui'),
      styles: path.join('src', 'ui', 'styles'),
      scripts: path.join('src', 'ui', 'scripts'),
      html: path.join('src', 'ui', 'index.html')
    }
  },
  cdn: {
    baseUrl: 'https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist',
    timeout: 10000,
    retryDelay: 1000,
    baseUrl: 'https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist'
  }
};

// 构建状态跟踪
const BUILD_STATE = {
  startTime: 0,
  errors: [],
  warnings: [],
  stats: {
    cssSize: 0,
    jsSize: 0,
    htmlSize: 0
  },
  timers: {}
};

// 日志工具
const logger = {
  log: (message) => console.log(message),
  info: (message) => console.log(`ℹ️ ${message}`),
  success: (message) => console.log(`✅ ${message}`),
  warn: (message) => {
    console.warn(`⚠️ ${message}`);
    BUILD_STATE.warnings.push(message);
  },
  error: (message, error) => {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    console.error(`❌ ${errorMessage}`);
    BUILD_STATE.errors.push(errorMessage);
    if (error?.stack) {
      console.error(error.stack);
    }
  }
};

// 性能监控工具
const performance = {
  start(label) {
    BUILD_STATE.timers = BUILD_STATE.timers || {};
    BUILD_STATE.timers[label] = Date.now();
  },
  end(label) {
    if (!BUILD_STATE.timers?.[label]) return 0;
    const duration = Date.now() - BUILD_STATE.timers[label];
    delete BUILD_STATE.timers[label];
    return duration;
  }
};

// 文件处理工具
const fileUtils = {
  // 检查并创建目录
  ensureDir(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`创建目录: ${dir}`);
    }
  },

  // 清理目录
  cleanDir(dir) {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
      logger.info(`清理目录: ${dir}`);
    }
    this.ensureDir(dir);
  },

  // 读取文件
  readFile(filePath, encoding = 'utf8') {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`文件不存在: ${filePath}`);
      }
      const content = fs.readFileSync(filePath, encoding);
      const stats = fs.statSync(filePath);
      return {
        content,
        size: stats.size,
        path: filePath
      };
    } catch (error) {
      throw new Error(`读取文件失败 ${filePath}: ${error.message}`);
    }
  },

  // 写入文件
  writeFile(filePath, content) {
    try {
      const dir = path.dirname(filePath);
      this.ensureDir(dir);
      fs.writeFileSync(filePath, content);
      const stats = fs.statSync(filePath);
      logger.success(`文件生成: ${filePath} (${this.formatSize(stats.size)})`);
      return stats.size;
    } catch (error) {
      throw new Error(`写入文件失败 ${filePath}: ${error.message}`);
    }
  },

  // 格式化文件大小
  formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
};

// 构建报告生成器
const reportBuilder = {
  generate() {
    const totalTime = Date.now() - BUILD_STATE.startTime;
    const report = [
      '\n📊 构建报告',
      '===========',
      `构建时间: ${totalTime}ms`,
      `CSS大小: ${fileUtils.formatSize(BUILD_STATE.stats.cssSize)}`,
      `JS大小: ${fileUtils.formatSize(BUILD_STATE.stats.jsSize)}`,
      `HTML大小: ${fileUtils.formatSize(BUILD_STATE.stats.htmlSize)}`
    ];

    if (BUILD_STATE.warnings.length > 0) {
      report.push('\n⚠️ 警告:');
      BUILD_STATE.warnings.forEach(warn => report.push(`- ${warn}`));
    }

    if (BUILD_STATE.errors.length > 0) {
      report.push('\n❌ 错误:');
      BUILD_STATE.errors.forEach(err => report.push(`- ${err}`));
    }

    return report.join('\n');
  }
};

// 运行系统命令
async function runCommand(command) {
  return new Promise((resolve, reject) => {
    try {
      execSync(command, { stdio: 'inherit' });
      resolve();
    } catch (error) {
      reject(new Error(`命令执行失败: ${command}\n${error.message}`));
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
  logger.info('构建核心库...');
  try {
    await runCommand(`cd ${BUILD_CONFIG.paths.core} && npm run build`);
    logger.success('核心库构建完成');
  } catch (error) {
    throw new Error(`核心库构建失败: ${error.message}`);
  }
}

// 构建插件
async function buildPlugin() {
  logger.info('构建插件...');
  try {
    await runCommand('npm run build:plugin');
    logger.success('插件构建完成');
  } catch (error) {
    throw new Error(`插件构建失败: ${error.message}`);
  }
}

// 清理构建目录
function clearDistDirectory() {
  logger.info('清理构建目录...');
  const distPath = BUILD_CONFIG.paths.dist;
  
  try {
    if (fs.existsSync(distPath)) {
      fs.rmSync(distPath, { recursive: true, force: true });
    }
    fs.mkdirSync(distPath, { recursive: true });
    logger.success('构建目录已清理');
  } catch (error) {
    throw new Error(`清理构建目录失败: ${error.message}`);
  }
}

// 构建HTML文件
function buildHTML() {
  logger.info('开始构建HTML文件...');
  
  try {
    // 声明所有变量
    const htmlContent = fileUtils.readFile(BUILD_CONFIG.paths.ui.html).content;
    let processedHtml = htmlContent;
    let cssContent = '';
    let jsContent = '';
    
    // 处理CSS文件
    // 注意：app-new.css 仅供开发入口用，生产构建请勿合并，避免重复内容
    // 按 app-new.css 的 @import 顺序手动列举所有需要合并的CSS文件，确保顺序和完整性
    const cssFiles = [
      path.join(BUILD_CONFIG.paths.ui.styles, 'base.css'),
      path.join(BUILD_CONFIG.paths.ui.styles, 'layout.css'),
      path.join(BUILD_CONFIG.paths.ui.styles, 'components', 'notification.css'),
      path.join(BUILD_CONFIG.paths.ui.styles, 'components', 'loading.css'),
      path.join(BUILD_CONFIG.paths.ui.styles, 'components', 'tabs.css'),
      path.join(BUILD_CONFIG.paths.ui.styles, 'components', 'forms.css'),
      path.join(BUILD_CONFIG.paths.ui.styles, 'components', 'buttons.css'),
      path.join(BUILD_CONFIG.paths.ui.styles, 'components', 'upload.css'),
      path.join(BUILD_CONFIG.paths.ui.styles, 'components', 'modules.css'),
      path.join(BUILD_CONFIG.paths.ui.styles, 'components', 'channels.css'),
      path.join(BUILD_CONFIG.paths.ui.styles, 'themes', 'dark.css')
    ];

    // 输出所有将被合并的CSS文件
    logger.info('本次将合并以下CSS文件:');
    cssFiles.forEach(file => logger.info('- ' + file));

    // 合并CSS内容并记录每个文件的第一个选择器或注释
    const cssFileChecks = [];
    cssFiles.forEach(file => {
      try {
        const content = fileUtils.readFile(file).content;
        cssContent += content + '\n';
        // 提取第一个选择器或注释用于校验
        const match = content.match(/([.#][a-zA-Z0-9_-]+|\/\*.*?\*\/)/);
        if (match) {
          cssFileChecks.push({ file, check: match[0] });
        } else {
          cssFileChecks.push({ file, check: null });
        }
      } catch (error) {
        logger.warn(`处理CSS文件失败 ${file}: ${error.message}`);
      }
    });

    // CSS优化
    cssContent = cssContent
      .replace(/\/\*\s*===.*?===\s*\*\//g, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    BUILD_STATE.stats.cssSize = cssContent.length;
    logger.success(`CSS合并完成: ${(cssContent.length / 1024).toFixed(1)}KB`);

    // 生成CSS文件
    fileUtils.writeFile(
      path.join(BUILD_CONFIG.paths.dist, 'styles.min.css'),
      cssContent
    );

    // 自动校验每个CSS文件内容是否被包含
    logger.info('开始自动校验CSS内容是否被合并...');
    let missingCount = 0;
    cssFileChecks.forEach(({ file, check }) => {
      if (!check) {
        logger.warn(`无法提取校验标记，建议检查文件内容: ${file}`);
        return;
      }
      if (!cssContent.includes(check)) {
        logger.warn(`警告：CSS文件内容可能未被合并: ${file}（未找到标记：${check}）`);
        missingCount++;
      }
    });
    if (missingCount === 0) {
      logger.success('所有CSS文件内容均已成功合并！');
    } else {
      logger.warn(`有 ${missingCount} 个CSS文件内容未被正确合并，请检查上方警告！`);
    }
    
    // 处理JavaScript文件
    const jsFiles = [
      'utility-functions.js',
      'plugin-communicator.js',
      'notification-system.js',
      'theme-manager.js',
      'file-processor.js',
      'data-collector.js',
      'data-manager.js',
      'channel-manager.js',
      'image-uploader.js',
      'image-slice-handler.js',
      'module-manager.js',
      'form-resetter.js',
      'ui-controller.js',
      'app.js',
      'global-init.js'
    ].map(file => path.join(BUILD_CONFIG.paths.ui.scripts, file));
    
    logger.info(`准备处理 ${jsFiles.length} 个JS文件`);
    
    jsFiles.forEach((file, index) => {
      try {
        const fileContent = fileUtils.readFile(file).content;
        const fileName = path.basename(file);
        logger.info(`包含文件: ${fileName} (${(fileContent.length / 1024).toFixed(1)}KB)`);
        jsContent += `/* === ${fileName} === */\n${fileContent}\n\n`;
      } catch (error) {
        logger.warn(`处理JS文件失败 ${file}: ${error.message}`);
      }
    });
    
    BUILD_STATE.stats.jsSize = jsContent.length;
    logger.success(`JavaScript合并完成: ${(jsContent.length / 1024).toFixed(1)}KB`);
    
    // 生成JS文件
    fileUtils.writeFile(
      path.join(BUILD_CONFIG.paths.dist, 'scripts.min.js'),
      jsContent
    );
    
    // 替换HTML中的模板内容
    processedHtml = processedHtml
      .replace('{{EXTERNAL_CSS_LINK}}', 
        `<link id="external-styles" rel="stylesheet" href="${BUILD_CONFIG.cdn.baseUrl}/styles.min.css">`)
      .replace('{{APP_SCRIPTS}}',
        `<script>\n${ultimateCDNLoaderCode}\n</script>`);
    
    // 生成HTML文件
    fileUtils.writeFile(
      path.join(BUILD_CONFIG.paths.dist, 'ui.html'),
      processedHtml
    );
    
    BUILD_STATE.stats.htmlSize = processedHtml.length;
    
    return BUILD_STATE.stats;
  } catch (error) {
    throw new Error(`HTML构建失败: ${error.message}`);
  }
}

// CDN加载器代码
const ultimateCDNLoaderCode = `
// CDN资源加载器
async function loadExternalResource(url, type) {
  return new Promise((resolve, reject) => {
    const element = type === 'css' 
      ? document.createElement('link') 
      : document.createElement('script');
    
    if (type === 'css') {
      element.rel = 'stylesheet';
      element.href = url;
    } else {
      element.src = url;
    }
    
    const timeout = setTimeout(() => {
      reject(new Error(\`资源加载超时: \${url}\`));
    }, 10000);
    
    element.onload = () => {
      clearTimeout(timeout);
      resolve();
    };
    
    element.onerror = () => {
      clearTimeout(timeout);
      reject(new Error(\`资源加载失败: \${url}\`));
    };
    
    document.head.appendChild(element);
  });
}

// 创建备用样式
function createFallbackUI() {
  const style = document.createElement('style');
  style.textContent = \`
    body { font-family: sans-serif; margin: 0; padding: 20px; }
    .container { max-width: 400px; margin: 0 auto; }
    /* 其他基础样式... */
  \`;
  document.head.appendChild(style);
  console.log('✅ 应急样式已加载');
}

// 智能资源加载
async function loadResources() {
  try {
    await loadExternalResource('${BUILD_CONFIG.cdn.baseUrl}/styles.min.css', 'css')
      .catch(err => {
        console.warn(\`⚠️ CSS加载失败: \${err.message}\`);
        createFallbackUI();
      });
      
    await loadExternalResource('${BUILD_CONFIG.cdn.baseUrl}/scripts.min.js', 'js')
      .catch(err => {
        console.error(\`❌ JS加载失败: \${err.message}\`);
        throw err;
      });
      
    console.log('✅ CDN资源加载完成');
  } catch (error) {
    console.error(\`❌ 资源加载失败: \${error.message}\`);
  }
}

// 初始化加载
document.addEventListener('DOMContentLoaded', loadResources);
`;

// 主构建函数
async function build() {
  BUILD_STATE.startTime = Date.now();
  logger.log('🚀 开始H5Tools统一构建...');
  
  try {
    clearDistDirectory();
    await buildCore();
    await buildPlugin();
    const buildResult = buildHTML();
    
    const duration = Date.now() - BUILD_STATE.startTime;
    
    // 输出构建报告
    logger.log(reportBuilder.generate());
    
    logger.log('\n🎉 构建成功!');
    
  } catch (error) {
    logger.error('构建失败', error);
    process.exit(1);
  }
}

// 启动构建
build();