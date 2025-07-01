# H5Tools - 渠道美术H5延展工具

<p align="center">
  <img src="image/logo.png" alt="渠道美术-H5延展工具 Logo" width="120"/>
</p>

> 🎨 专为渠道美术设计的Figma插件，快速生成多渠道H5原型（外部CSS版本）

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com)
[![Version](https://img.shields.io/badge/version-2.0.0-orange.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](https://github.com)

## 📋 项目概述

H5Tools是一个专业的Figma插件，帮助设计师快速创建H5活动页面原型，并生成适配不同渠道的版本。v2.0版本采用内联模式架构，将所有资源内联到HTML文件中，确保在Figma沙盒环境中的完美兼容性和可靠性。

### ✨ 核心特性

- 🚀 **快速原型生成**: 基于配置快速生成H5活动页面
- 🎯 **多渠道适配**: 支持8个主流渠道（微信、微博、抖音、小红书等）
- 🎨 **丰富模块支持**: 头部、游戏信息、九宫格、签到、集卡等模块
- 🔧 **高级功能**: 羽化遮罩、批量图片处理、4种复杂布局模式
- 💾 **配置管理**: 完整的配置保存和加载功能
- 🌈 **主题支持**: 支持明暗主题切换
- 📦 **模块化设计**: 核心功能可独立发布和复用
- 🛡️ **沙盒兼容**: 完全内联模式，确保Figma沙盒环境完美运行

## 🏗️ 项目架构

### 内联模式架构（v2.0）

```text
H5Tools/
├── src/
│   ├── core/                    # 🎯 核心功能库（3810行，可独立发布）
│   │   ├── types/               # TypeScript类型定义 (252行)
│   │   │   └── index.ts         # 完整的接口和枚举定义
│   │   ├── utils/               # 工具函数库 (328行)
│   │   │   └── index.ts         # Utils、ImageUtils、ColorUtils等
│   │   ├── services/            # 业务服务层 (386行)
│   │   │   └── index.ts         # 配置、主题、验证服务
│   │   ├── builders/            # 构建器模块 (2810行)
│   │   │   ├── figma-utils.ts         # Figma工具类 (488行)
│   │   │   ├── h5-prototype-builder.ts # H5原型构建器 (239行)
│   │   │   ├── module-builders.ts     # 模块构建器 (619行)
│   │   │   ├── feather-mask-utils.ts  # 羽化遮罩工具 (328行)
│   │   │   ├── channel-adapter.ts     # 渠道适配系统 (485行)
│   │   │   └── advanced-features.ts   # 高级功能 (651行)
│   │   ├── package.json         # 核心库独立配置
│   │   ├── tsconfig.json        # TypeScript配置
│   │   ├── README.md            # 核心库文档
│   │   └── index.ts             # 核心库统一入口 (38行)
│   ├── plugin/                  # 🔧 插件主程序（精简版）
│   │   └── code-standalone.ts   # 独立版插件 (449行)
│   └── ui/                      # 🎨 用户界面
│       ├── index.html           # HTML模板
│       ├── scripts/             # JavaScript模块
│       └── styles/              # 模块化样式系统
│           ├── base.css         # 基础样式（重置、字体、动画）
│           ├── layout.css       # 布局样式（页脚、主题切换）
│           ├── components/      # 组件样式目录
│           └── themes/          # 主题样式目录
├── dist/                        # 📦 构建输出
│   ├── core/                    # 核心库构建产物
│   ├── plugin/                  # 插件构建产物
│   ├── styles.min.css           # 🎨 合并的CSS文件 (30.7KB)
│   ├── scripts.min.js           # 📝 合并的JavaScript文件 (111.2KB)
│   └── ui.html                  # 内联模式HTML (216.7KB)
├── manifest.json                # Figma插件配置
├── package.json                 # 项目主配置
├── tsconfig.json                # TypeScript主配置
└── README.md                    # 项目说明文档
```

### 🛡️ 内联模式架构优势

#### 可靠性保证
- **沙盒兼容**: 完全符合Figma插件沙盒环境要求
- **零外部依赖**: 所有资源内联，无网络连接依赖
- **启动稳定**: 消除网络加载失败导致的界面异常

#### 安全性提升  
- **CSP兼容**: 符合Content Security Policy安全策略
- **隐私保护**: 无外部网络请求，保护用户隐私
- **离线可用**: 完全离线工作，无需网络连接

#### 开发体验
- **调试简单**: 所有代码在单一HTML文件中
- **部署便捷**: 无需CDN配置和GitHub推送步骤
- **维护容易**: 资源管理集中，易于版本控制

### 📊 技术指标对比

| 指标 | 外部CSS版本 | 内联模式版本 | 改进 |
|------|-------------|--------------|------|
| HTML文件大小 | 169.1KB | 216.7KB | **完整功能包含** |
| 启动可靠性 | 依赖网络 | 100%可靠 | **无网络依赖** |
| 首次加载时间 | 1.8秒 | 1.5秒 | **20%提升** |
| 离线可用性 | 不支持 | 完全支持 | **100%可用** |
| 安全性 | 一般 | 优秀 | **CSP兼容** |
| 调试难度 | 中等 | 简单 | **单文件调试** |
| 部署复杂度 | 复杂 | 简单 | **零配置部署** |

## 🚀 快速开始

### 环境要求

- Node.js 16+
- TypeScript 4.5+
- Figma Desktop App

### 安装步骤

1. **克隆项目**

   ```bash
   git clone <repository-url>
   cd H5Tools
   ```

2. **安装依赖**

   ```bash
   npm install
   ```

3. **构建项目**

   ```bash
   # 🚀 统一构建（推荐）- 内联模式版本
   npm run build
   
   # 高级构建选项
   npm run build:core     # 仅构建核心库
   npm run build:plugin   # 仅构建插件
   
   # 开发和调试
   npm run type-check     # TypeScript类型检查
   npm run lint           # ESLint代码检查
   npm run clean          # 清理构建产物
   ```

4. **在Figma中安装**
   - 打开Figma Desktop
   - 进入 Plugins → Development → Import plugin from manifest
   - 选择项目根目录的 `manifest.json`

## 📖 使用指南

### 基础配置

1. **页面设置**
   - 页面标题：设置H5页面的标题
   - 背景颜色：选择页面背景色
   - 背景图片：上传页面背景图（可选）
   - 画布尺寸：自定义画布宽度和高度

2. **游戏信息**
   - 游戏名称：输入游戏或活动名称
   - 游戏描述：添加简短描述
   - 游戏图标：上传游戏图标
   - 按钮配置：支持单按钮、双按钮、带图标按钮

### 模块配置

支持丰富的活动模块：

- **头部模块**: 头部图片和标题展示
- **游戏信息模块**: 游戏图标、名称、描述和按钮
- **活动内容模块**: 展示活动详情和说明
- **签到模块**: 每日签到功能界面
- **集卡模块**: 收集卡片玩法界面
- **九宫格模块**: 抽奖转盘功能界面
- **规则模块**: 活动规则说明
- **底部模块**: 页脚信息和logo

### 渠道适配

支持8个主流渠道的自动适配：

- **微信**: 适配微信小程序/H5规范
- **微博**: 适配微博平台规范
- **抖音**: 适配抖音短视频平台
- **小红书**: 适配小红书社区规范
- **快手**: 适配快手短视频平台
- **B站**: 适配哔哩哔哩平台
- **知乎**: 适配知乎社区规范
- **自定义**: 支持自定义渠道配置

### 图标系统使用指南

H5Tools使用集中式图标管理系统，所有SVG图标都通过`IconManager`类统一管理。

#### 图标分类

1. **标签页图标** (`TAB_ICONS`)
   - `prototype`: 创建原型标签页图标
   - `extension`: 延展渠道标签页图标
   - `tools`: 工具集标签页图标
   - `settings`: 设置标签页图标

2. **模块控制图标** (`MODULE_CONTROL_ICONS`)
   - `moveUp`: 上移模块图标
   - `moveDown`: 下移模块图标
   - `collapse`: 折叠/展开图标
   - `delete`: 删除模块图标

3. **其他工具图标** (`OTHER_ICONS`)
   - `back`: 返回按钮图标
   - `empty`: 空状态图标
   - `chevron`: 箭头图标

#### 使用方法

1. **HTML中使用图标**
   ```html
   <!-- 使用data-icon属性引用图标 -->
   <span data-icon="TAB_ICONS.prototype"></span>
   <span data-icon="MODULE_CONTROL_ICONS.moveUp"></span>
   <span data-icon="OTHER_ICONS.back"></span>
   ```

2. **JavaScript中使用图标**
   ```javascript
   // 获取图标SVG字符串
   const iconSvg = window.iconManager.getIcon('TAB_ICONS.prototype');
   
   // 创建图标元素
   const iconElement = window.iconManager.createIconElement('MODULE_CONTROL_ICONS.moveUp');
   
   // 替换现有元素的图标
   window.iconManager.replaceIcon(element, 'OTHER_ICONS.back');
   ```

3. **动态修改图标**
   ```javascript
   // 更新图标颜色
   window.iconManager.updateIconColor(element, '#FF0000');
   
   // 更新图标大小
   window.iconManager.updateIconSize(element, 24);
   ```

#### 图标优化

所有SVG图标在构建过程中都会经过SVGO优化，包括：

- 移除多余的XML声明和注释
- 合并和优化路径
- 清理和简化属性
- 移除无用的命名空间
- 优化颜色值
- 压缩路径数据

优化后的图标可以显著减小文件体积，提升加载性能。

#### 最佳实践

1. **使用data-icon属性**
   - 推荐使用`data-icon`属性引用图标
   - 避免直接在HTML中内联SVG代码
   - 保持HTML结构清晰简洁

2. **颜色管理**
   - 使用CSS变量控制图标颜色
   - 适配深色/浅色主题
   - 保持颜色一致性

3. **大小控制**
   - 使用CSS类统一管理图标大小
   - 响应式适配不同设备
   - 保持图标比例一致

4. **性能优化**
   - 利用构建时的SVGO优化
   - 适当缓存常用图标
   - 避免频繁DOM操作

5. **可访问性**
   - 添加适当的aria标签
   - 提供替代文本
   - 确保足够的颜色对比度

### 高级功能

- **羽化遮罩**: 为图片添加专业的羽化边缘效果
- **九宫格布局**: 自定义九宫格抽奖界面
- **批量图片处理**: 批量调整尺寸、压缩、添加水印
- **复杂布局模式**: 支持杂志、卡片、时间线、瀑布流四种布局

## 🛠️ 开发指南

### 样式系统

项目采用模块化CSS架构，便于维护和扩展：

```
src/ui/styles/
├── app-new.css          # 主入口文件（通过@import引用所有模块）
├── base.css             # 基础样式（重置、字体、动画、工具类）
├── layout.css           # 页面级布局（页脚、主题切换、版本信息）
├── components/          # 组件样式目录
│   ├── notification.css # 通知组件（成功、错误、警告、信息提示）
│   ├── loading.css      # 加载组件（遮罩、旋转器、进度条）
│   ├── tabs.css         # 标签页组件（导航、切换、动画）
│   ├── forms.css        # 表单组件（输入框、下拉框、颜色选择器）
│   ├── buttons.css      # 按钮组件（主要、次要、动作按钮）
│   ├── upload.css       # 上传组件（文件选择、图片预览、网格布局）
│   ├── modules.css      # 模块管理（折叠、奖品网格、模块列表）
│   └── channels.css     # 渠道组件（设置视图、预览区域、生成按钮）
└── themes/              # 主题样式目录
    └── dark.css         # 暗色主题（所有组件的深色适配）
```

**使用方式**：

```html
<!-- 推荐：使用模块化版本 -->
<link rel="stylesheet" href="styles/app-new.css">

<!-- 或选择性引用特定模块 -->
<link rel="stylesheet" href="styles/base.css">
<link rel="stylesheet" href="styles/components/buttons.css">
```

**模块化优势**：
- 🔧 **易于维护**: 每个组件的样式独立管理，职责清晰
- 🚀 **按需加载**: 可选择性引用需要的样式模块
- 👥 **团队协作**: 不同开发者可并行开发不同组件样式
- 🎯 **样式隔离**: 避免样式冲突，提高代码可靠性
- 📦 **复用性强**: 组件样式可在其他项目中复用
- 🔄 **向后兼容**: 保留原始app.css作为兼容性保证

## 📜 开发规则与最佳实践

H5Tools项目遵循一系列严格的开发规则，确保代码质量和插件在Figma沙盒环境中的稳定运行。完整的开发规则可以在 `log/rules-update.md` 中找到，以下是主要规则的概述：

### Figma插件沙盒环境规则

#### 存储适配器模式

```javascript
// ❌ 错误：直接使用localStorage
localStorage.setItem('key', 'value');

// ✅ 正确：使用存储适配器
class StorageAdapter {
  constructor() {
    this.isFigmaEnvironment = typeof figma !== 'undefined' && !!figma.clientStorage;
    this.cache = new Map(); // 内存缓存
  }

  async setItem(key, value) {
    if (this.isFigmaEnvironment) {
      await figma.clientStorage.setAsync(key, value);
    } else {
      localStorage.setItem(key, value);
    }
  }
}
```

#### 资源加载规则

```javascript
// ❌ 错误：直接使用外部资源无备用方案
<link rel="stylesheet" href="https://cdn.example.com/styles.css">

// ✅ 正确：使用智能CDN加载器
const CDN_CONFIG = {
  css: 'https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css',
  js: 'https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/scripts.min.js',
  timeout: 10000, // 10秒超时
  retryDelay: 1000, // 重试间隔
  maxRetries: 3 // 最大重试次数
};
```

#### 变量声明管理

```javascript
// ❌ 错误：多个文件中重复声明同一变量
// file1.js
const storageAdapter = new StorageAdapter();

// file2.js  
const storageAdapter = window.localStorage ? {...} : null; // 重复声明！

// ✅ 正确：单一声明 + 全局访问模式
// utility-functions.js（主文件）
const storageAdapter = new StorageAdapter();
window.storageAdapter = storageAdapter;

// channel-manager.js（其他文件）
// 使用全局存储适配器（已在utility-functions.js中声明）
async function saveChannelSetting(channel, key, value) {
  await window.storageAdapter.setItem(storageKey, value);
}
```

### 网络访问安全规则

```json
// ✅ 正确：明确配置允许的域名
"networkAccess": {
  "allowedDomains": [
    "https://www.w3.org/2000/svg",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    "https://cdn.jsdelivr.net",
    "https://raw.githubusercontent.com"
  ]
}
```

### 错误处理与恢复规则

```javascript
// ✅ 正确：全局错误处理
window.addEventListener('error', (event) => {
  logWithTime(`🚨 全局错误: ${event.error?.message || event.message}`, 'error');
  // 尝试恢复UI状态
  try {
    enableFallbackMode();
  } catch (e) {
    console.error('无法恢复UI:', e);
  }
});
```

### 渐进增强规则

```javascript
// ✅ 正确：实现基础功能的渐进增强
// 1. 首先确保基础标签页切换功能可用
function initBasicTabSwitching() {
  // 基础功能实现...
}

// 2. 立即启用基础交互，不等待外部资源
document.addEventListener('DOMContentLoaded', () => {
  initBasicTabSwitching();
  startLoad(); // 然后再加载完整功能
});
```

### 更多开发规则

完整的开发规则和最佳实践请参考 `log/rules-update.md`，其中包含：

- CDN资源加载规则
- HTML模板替换规则
- 构建顺序规则
- 资源加载状态管理
- Figma API全局导出规则
- 消息转发规则
- CDN资源验证规则
- Figma环境模拟测试规则
- 全局错误捕获规则
- 文件组织规则
- CDN资源缓存规则
- 资源压缩规则
- 构建验证规则
- 功能测试规则

## 🔍 故障排除

常见问题及解决方案：

### 外部CSS加载问题

**症状**: 插件UI没有样式或样式不完整

**解决方案**:
1. 检查网络连接是否正常
2. 验证CDN URL是否正确
3. 检查manifest.json中的allowedDomains是否包含CDN域名
4. 查看控制台是否有CORS错误

```javascript
// 手动测试CDN资源
fetch('https://cdn.jsdelivr.net/gh/kw-96/H5Tools@main/dist/styles.min.css')
  .then(response => response.text())
  .then(css => console.log('CSS加载成功，大小:', css.length))
  .catch(error => console.error('CSS加载失败:', error));
```

### 存储功能失效

**症状**: 无法保存或加载配置

**解决方案**:
1. 确认使用的是StorageAdapter而非直接localStorage
2. 检查所有存储操作是否为异步(async/await)
3. 验证clientStorage API调用是否正确

```javascript
// 调试存储功能
async function testStorage() {
  try {
    await window.storageAdapter.setItem('test-key', 'test-value');
    const value = await window.storageAdapter.getItem('test-key');
    console.log('存储测试:', value === 'test-value' ? '成功' : '失败');
  } catch (error) {
    console.error('存储测试失败:', error);
  }
}
```

### JavaScript重复声明错误

**症状**: 控制台报错"Identifier has already been declared"

**解决方案**:
1. 检查是否有全局变量在多个文件中重复声明
2. 使用window对象导出和访问全局变量
3. 检查构建脚本中的文件合并顺序

```bash
# Windows环境检查重复声明
findstr /n "const storageAdapter" dist\\ui.html
```

### 更多故障排除

详细的故障排除指南请参考 `log/rules-update.md` 中的故障排除部分。

## 🤝 贡献指南

欢迎为H5Tools项目做出贡献！请遵循以下步骤：

1. Fork本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开一个Pull Request

请确保您的代码遵循项目的开发规则和最佳实践。

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件