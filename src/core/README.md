# @h5tools/core

渠道美术-H5延展工具核心库

## 📋 简介

这是一个专为Figma插件设计的核心功能库，提供H5页面原型生成和多渠道适配的核心功能。通过将核心逻辑独立为库，可以实现功能的模块化管理和跨项目复用。

## ✨ 特性

- 🎨 **类型安全**: 完整的TypeScript类型定义，100%类型覆盖
- 🔧 **模块化设计**: 清晰的模块划分，职责分离
- 🚀 **高性能**: 优化的算法和数据结构
- 📱 **多渠道支持**: 支持微信、微博、抖音、小红书等8个主流渠道
- 🎯 **专业工具**: 丰富的工具函数和服务类
- 🔨 **高级功能**: 羽化遮罩、批量处理、复杂布局模式

## 📦 安装

```bash
npm install @h5tools/core
```

## 🛠️ 构建

```bash
# 构建核心库
npm run build

# 开发模式
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint
```

## 🚀 快速开始

```typescript
import { 
  H5Config, 
  H5PrototypeBuilder,
  ConfigService, 
  Utils,
  CONSTANTS,
  ChannelAdapter,
  ChannelType
} from '@h5tools/core';

// 创建H5配置
const config: H5Config = {
  pageTitle: '活动页面',
  pageBgColor: '#ffffff',
  pageBgImage: null,
  gameName: '我的游戏',
  gameDesc: '精彩活动等你来',
  gameTextColor: '#333333',
  buttonVersion: 'single',
  canvasWidth: 375,
  canvasHeight: 812,
  modules: []
};

// 构建H5原型
const builder = new H5PrototypeBuilder(config);
const prototype = await builder.build();

// 渠道适配
const adaptedConfig = ChannelAdapter.adaptH5ConfigForChannel(config, ChannelType.WECHAT);
```

## 📚 API 文档

### 🏗️ 核心类型

#### H5Config
H5页面的完整配置接口：

```typescript
interface H5Config {
  pageTitle: string;              // 页面标题
  pageBgColor: string;           // 背景颜色
  pageBgImage: ImageInfo | null; // 背景图片
  gameName: string;              // 游戏名称
  gameDesc: string;              // 游戏描述
  gameTextColor: string;         // 文字颜色
  buttonVersion: string;         // 按钮版本
  canvasWidth: number;           // 画布宽度
  canvasHeight: number;          // 画布高度
  modules: ModuleData[];         // 模块数据
  channelType?: ChannelType;     // 渠道类型
}
```

#### ImageInfo
图片信息接口：

```typescript
interface ImageInfo {
  data: Uint8Array;    // 图片数据
  width: number;       // 图片宽度
  height: number;      // 图片高度
  name: string;        // 文件名
  type: string;        // MIME类型
  fileSize?: number;   // 文件大小
  format?: string;     // 图片格式
}
```

#### ModuleType
支持的模块类型：

```typescript
enum ModuleType {
  HEADER = 'header',                    // 头部模块
  GAME_INFO = 'gameInfo',              // 游戏信息模块
  ACTIVITY_CONTENT = 'activityContent', // 活动内容模块
  SIGN_IN = 'signIn',                  // 签到模块
  COLLECT_CARDS = 'collectCards',      // 集卡模块
  NINE_GRID = 'nineGrid',              // 九宫格模块
  RULES = 'rules',                     // 规则模块
  FOOTER = 'footer'                    // 底部模块
}
```

#### ChannelType
支持的渠道类型：

```typescript
enum ChannelType {
  WECHAT = 'wechat',        // 微信
  WEIBO = 'weibo',          // 微博
  DOUYIN = 'douyin',        // 抖音
  XIAOHONGSHU = 'xiaohongshu', // 小红书
  KUAISHOU = 'kuaishou',    // 快手
  BILIBILI = 'bilibili',    // B站
  ZHIHU = 'zhihu',          // 知乎
  CUSTOM = 'custom'         // 自定义
}
```

### 🏗️ 构建器类

#### H5PrototypeBuilder
H5原型构建器，负责生成完整的H5页面原型：

```typescript
class H5PrototypeBuilder {
  constructor(config: H5Config);
  
  // 构建H5原型
  async build(): Promise<FrameNode>;
  
  // 构建指定模块
  async buildModule(moduleData: ModuleData): Promise<FrameNode>;
  
  // 设置背景
  async setBackground(frame: FrameNode): Promise<void>;
}
```

### 🛠️ 服务类

#### ConfigService
配置管理服务：

```typescript
class ConfigService {
  // 保存配置
  static async saveConfig(config: H5Config): Promise<void>;
  
  // 加载配置
  static async loadConfig(): Promise<H5Config>;
  
  // 验证配置
  static validateConfig(config: H5Config): ValidationResult;
  
  // 创建默认配置
  static createDefaultConfig(): H5Config;
  
  // 重置配置
  static async resetConfig(): Promise<void>;
}
```

#### ThemeService
主题管理服务：

```typescript
class ThemeService {
  // 保存主题
  static async saveTheme(theme: string): Promise<void>;
  
  // 获取当前主题
  static async getCurrentTheme(): Promise<string>;
  
  // 检测系统主题
  static detectSystemTheme(): string;
  
  // 应用主题
  static applyTheme(theme: string): void;
}
```

#### ChannelImageService
渠道图片管理服务：

```typescript
class ChannelImageService {
  // 保存渠道图片
  static async saveChannelImage(channel: string, type: string, imageData: Uint8Array): Promise<void>;
  
  // 加载渠道图片
  static async loadChannelImages(channel: string): Promise<Record<string, Uint8Array>>;
  
  // 删除渠道图片
  static async deleteChannelImage(channel: string, type: string): Promise<void>;
  
  // 获取存储使用情况
  static async getStorageUsage(): Promise<StorageUsage>;
}
```

### 🔧 工具类

#### Utils
基础工具函数集合：

```typescript
class Utils {
  // 延迟执行
  static delay(ms: number): Promise<void>;
  
  // 提取图片数据
  static extractUint8Array(imageInfo: ImageInfo): Uint8Array;
  
  // 颜色转换
  static hexToRgb(hex: string): { r: number; g: number; b: number };
  
  // 深拷贝
  static deepClone<T>(obj: T): T;
  
  // 生成唯一ID
  static generateId(): string;
  
  // 格式化文件大小
  static formatFileSize(bytes: number): string;
}
```

#### ImageUtils
图片处理工具：

```typescript
class ImageUtils {
  // 验证图片格式
  static isValidImageType(mimeType: string): boolean;
  
  // 获取文件扩展名
  static getImageExtension(mimeType: string): string;
  
  // 计算缩放比例
  static calculateScale(
    sourceWidth: number, 
    sourceHeight: number, 
    targetWidth: number, 
    targetHeight: number, 
    mode: 'fit' | 'fill' | 'stretch'
  ): { scaleX: number; scaleY: number };
  
  // 调整图片尺寸
  static resizeImage(imageInfo: ImageInfo, width: number, height: number): Promise<ImageInfo>;
  
  // 压缩图片
  static compressImage(imageInfo: ImageInfo, quality: number): Promise<ImageInfo>;
}
```

#### ColorUtils
颜色处理工具：

```typescript
class ColorUtils {
  // 十六进制转RGB
  static hexToRgb(hex: string): { r: number; g: number; b: number };
  
  // RGB转十六进制
  static rgbToHex(r: number, g: number, b: number): string;
  
  // 获取对比色
  static getContrastColor(color: string): string;
  
  // 调整亮度
  static adjustBrightness(color: string, amount: number): string;
  
  // 生成渐变色
  static generateGradient(startColor: string, endColor: string, steps: number): string[];
  
  // 验证颜色格式
  static isValidColor(color: string): boolean;
}
```

#### ValidationUtils
数据验证工具：

```typescript
class ValidationUtils {
  // 验证必填字段
  static validateRequired(value: any, fieldName: string): string | null;
  
  // 验证数字范围
  static validateNumberRange(value: number, min: number, max: number, fieldName: string): string | null;
  
  // 验证字符串长度
  static validateStringLength(value: string, minLength: number, maxLength: number, fieldName: string): string | null;
  
  // 验证颜色格式
  static validateColor(color: string): boolean;
  
  // 验证图片信息
  static isValidImageInfo(imageInfo: any): imageInfo is ImageInfo;
  
  // 验证渠道类型
  static isValidChannelType(channelType: any): channelType is ChannelType;
}
```

### 🎯 高级功能

#### ChannelAdapter
渠道适配器：

```typescript
class ChannelAdapter {
  // 适配H5配置到指定渠道
  static adaptH5ConfigForChannel(config: H5Config, channelType: ChannelType): H5Config;
  
  // 获取渠道配置
  static getChannelConfig(channelType: ChannelType): ChannelConfig;
  
  // 验证渠道兼容性
  static validateChannelCompatibility(config: H5Config, channelType: ChannelType): ValidationResult;
}
```

#### AdvancedFeatures
高级功能服务：

```typescript
class AdvancedFeatures {
  // 创建九宫格布局
  static async createNineGridLayout(config: NineGridConfig): Promise<FrameNode>;
  
  // 批量处理图片
  static async batchProcessImages(images: ImageInfo[], config: BatchProcessConfig): Promise<ImageInfo[]>;
  
  // 创建复杂布局
  static async createComplexLayout(type: ComplexLayoutType, content: any): Promise<FrameNode>;
  
  // 应用羽化遮罩
  static async applyFeatherMask(node: SceneNode, config: FeatherMaskConfig): Promise<void>;
}
```

#### FeatherMaskUtils
羽化遮罩工具：

```typescript
class FeatherMaskUtils {
  // 创建羽化遮罩
  static async createFeatherMask(width: number, height: number, featherRadius: number): Promise<FrameNode>;
  
  // 应用遮罩到节点
  static async applyMaskToNode(node: SceneNode, mask: FrameNode): Promise<void>;
  
  // 创建渐变遮罩
  static async createGradientMask(width: number, height: number, direction: string): Promise<FrameNode>;
}
```

## 📊 常量

```typescript
import { CONSTANTS } from '@h5tools/core';

// 尺寸常量
console.log(CONSTANTS.H5_WIDTH);        // 1080 - H5页面宽度
console.log(CONSTANTS.H5_HEIGHT);       // 1920 - H5页面高度
console.log(CONSTANTS.MODULE_WIDTH);    // 950 - 模块宽度
console.log(CONSTANTS.GRID_SIZE);       // 3 - 九宫格尺寸

// 颜色常量
console.log(CONSTANTS.DEFAULT_BG_COLOR);     // '#ffffff'
console.log(CONSTANTS.DEFAULT_TEXT_COLOR);   // '#333333'

// 文件常量
console.log(CONSTANTS.MAX_FILE_SIZE);        // 5MB
console.log(CONSTANTS.SUPPORTED_FORMATS);    // ['jpg', 'png', 'gif']
```

## 🛠️ 开发

### 构建

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

### 类型检查

```bash
npm run type-check
```

### 代码检查

```bash
npm run lint
npm run lint:fix
```

## 📈 版本历史

### 2.0.0 (2024-12-19)
- 🏗️ 完全重构为模块化架构
- 🎯 支持8个主流渠道适配
- 🔧 新增高级功能（羽化遮罩、批量处理等）
- 📦 完整的TypeScript类型定义
- ✅ 通过所有代码质量检查

### 1.0.0 (2024-初版)
- 🎯 初始版本发布
- ✨ 基础H5原型生成功能
- 🎨 基础渠道适配支持

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request来帮助改进这个项目。

### 开发规范
- 使用TypeScript编写代码
- 遵循ESLint规则
- 添加适当的JSDoc注释
- 确保类型安全
- 编写清晰的提交信息

## 📞 支持

如果您在使用过程中遇到问题，请：

1. 查看文档和示例
2. 搜索已有的Issues
3. 创建新的Issue并提供详细信息

## 🔗 相关链接

- [项目主页](../../README.md)
- [完整日志](../../log.md)
- [GitHub仓库](https://github.com/your-username/H5Tools)

---

<div align="center">
  <p>Made with ❤️ by H5Tools Team</p>
  <p>🌟 如果这个库对你有帮助，请给我们一个星标！</p>
</div> 