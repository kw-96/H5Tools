// 渠道美术-H5延展工具 - 核心类型定义
// 这个文件包含所有的接口和类型定义，将作为独立库发布到GitHub

// ==================== 常量定义 ====================
export const CONSTANTS = {
  H5_WIDTH: 1080,           // H5画板宽度
  MODULE_WIDTH: 950,        // 模块宽度
  PADDING: 0,               // 内边距
  GRID_SIZE: 3,             // 九宫格行列数
  DEFAULT_SPACING: 20       // 默认间距
} as const;

// ==================== 基础类型定义 ====================

// 图片信息接口
export interface ImageInfo {
  data: Uint8Array;    // 图片数据，以无符号8位整数数组形式存储
  width: number;       // 图片宽度
  height: number;      // 图片高度
  name: string;        // 图片名称
  type: string;        // 图片类型（如 'png', 'jpg' 等）
  fileSize?: number;   // 文件大小（字节）
  format?: string;     // 图片格式（用于渠道适配）
}

// 模块类型枚举
export enum ModuleType {
  HEADER = 'header',
  GAME_INFO = 'gameInfo',
  FOOTER = 'footer',
  ACTIVITY_CONTENT = 'activityContent',
  SIGN_IN = 'signIn',
  COLLECT_CARDS = 'collectCards',
  NINE_GRID = 'nineGrid',
  CAROUSEL = 'carousel',
  RULES = 'rules',
  CUSTOM = 'custom'
}

// 模块数据接口
export interface ModuleData {
  id: string;      // 模块唯一标识
  title: string;   // 模块标题
  type: string;    // 模块类型
  content: Record<string, unknown>;
}

// 模块接口定义
export interface Module {
  id: string;          // 模块唯一标识
  type: ModuleType;    // 模块类型，使用 ModuleType 枚举
  title: string;       // 模块标题
  content: ModuleContent;  // 模块内容，根据不同类型有不同的结构
}

// 模块内容类型定义
export type ModuleContent = ActivityContentData | SignInContent | CollectCardsContent | NineGridContent | CarouselContent;

// ==================== 具体模块内容接口 ====================

// 活动内容接口（区别于活动规则）
export interface ActivityContentData {
  mainTitle: string;            // 主标题
  mainTitleBg: Uint8Array | ImageInfo | null; // 主标题背景图片
  subTitle: string;             // 副标题
  subTitleBg: Uint8Array | ImageInfo | null;  // 副标题背景图片
  text: string;                 // 活动内容文本
  image: Uint8Array | ImageInfo | null;     // 活动内容插图
}

// 签到内容接口
export interface SignInContent {
  titleImage: Uint8Array | null;  // 标题图片
  bgImage: Uint8Array | null;     // 背景图片
  daysCount: number;              // 签到天数
  dayIcon: Uint8Array | null;     // 每日图标
  signButton: Uint8Array | null;  // 签到按钮图片
}

// 集卡内容接口
export interface CollectCardsContent {
  titleImage: Uint8Array | null;    // 标题图片
  bgImage: Uint8Array | null;       // 背景图片
  cardsCount: number;               // 卡片数量
  cardStyle: 'style1' | 'style2' | 'style3';  // 卡片样式
  cardBg: Uint8Array | null;        // 卡片背景图片
  combineButton: Uint8Array | null; // 合成按钮图片
}

// 九宫格内容接口
export interface NineGridContent {
  mainTitle: string;            // 主标题
  titleBgImage: Uint8Array | ImageInfo | null;  // 标题背景图片
  gridBgImage: Uint8Array | ImageInfo | null;   // 九宫格背景图片
  drawButtonImage: Uint8Array | ImageInfo | null;  // 抽奖按钮图片
  prizeBgImage: Uint8Array | ImageInfo | null;     // 奖品背景图片
  prizes: PrizeItem[];          // 奖品列表
}

// 图片轮播（横版）内容接口
export interface CarouselContent {
  title: string;                // 轮播标题
  titleBgImage: Uint8Array | ImageInfo | null;  // 标题背景图片
  carouselImage: Uint8Array | ImageInfo | null;  // 轮播图片
  carouselBgImage: Uint8Array | ImageInfo | null;  // 轮播图背景图片
}

// 奖品项目接口
export interface PrizeItem {
  image: Uint8Array | ImageInfo | null;  // 奖品图片，使用 Uint8Array 或 ImageInfo 存储二进制数据，可以为 null
  name: string;              // 奖品名称
}



// ==================== 图片切片相关接口 ====================

// 切片策略接口
export interface SliceStrategy {
  direction: 'horizontal' | 'vertical' | 'both' | 'none';
  sliceWidth: number;
  sliceHeight: number;
  slicesCount: number;
  description: string;
}

// 切片数据接口
export interface SliceData {
  bytes: ArrayBuffer;
  width: number;
  height: number;
  x: number;
  y: number;
}

// ==================== 渠道图片相关接口 ====================

// 渠道图片数据接口
export interface ChannelImageData {
  data: number[] | string;
  width: number;
  height: number;
  name: string;
  type: string;
  size: number;
  timestamp: number;
}

// 渠道图片存储接口
export interface ChannelImages {
  [channel: string]: {
    [imageType: string]: ChannelImageData;
  };
}

// ==================== 插件消息相关接口 ====================

// 插件消息类型
export type PluginMessageType = 
  | 'create-prototype'
  | 'save-config'
  | 'load-config'
  | 'get-theme'
  | 'save-theme'
  | 'close-plugin'
  | 'reset-complete'
  | 'ping'
  | 'slice-image-response'
  | 'generate'
  | 'channel-generate'
  | 'channel-image-upload'
  | 'storage-set'
  | 'storage-delete'
  | 'ui-loaded'
  | 'ui-ready';

// 插件消息基础接口
export interface BasePluginMessage {
  type: PluginMessageType;
}

// 具体的插件消息接口
export interface CreatePrototypeMessage extends BasePluginMessage {
  type: 'create-prototype' | 'generate';
  config: H5Config;
}

export interface ConfigMessage extends BasePluginMessage {
  type: 'save-config' | 'load-config';
  config?: H5Config;
}

export interface ThemeMessage extends BasePluginMessage {
  type: 'get-theme' | 'save-theme';
  theme?: string;
}

export interface ChannelImageMessage extends BasePluginMessage {
  type: 'channel-image-upload';
  channel: string;
  imageType: string;
  imageData: ChannelImageData;
}

export interface ChannelGenerateMessage extends BasePluginMessage {
  type: 'channel-generate';
  channel: string;
}

export interface SimpleMessage extends BasePluginMessage {
  type: 'close-plugin' | 'reset-complete' | 'ping' | 'slice-image-response';
}

export type StorageMessage = {
  type: 'storage-set' | 'storage-delete';
  key: string;
  value?: unknown;
};

// 联合类型
export type PluginMessage = {
  type: 'create-prototype' | 'generate' | 'save-config' | 'load-config' | 
        'get-theme' | 'save-theme' | 'channel-image-upload' | 'channel-generate' |
        'close-plugin' | 'reset-complete' | 'ping' | 'slice-image-response' |
        'storage-set' | 'storage-delete' | 'ui-loaded' | 'ui-ready';
  config?: H5Config;
  theme?: string;
  message?: string;
  data?: Record<string, unknown>;
  key?: string;
  value?: unknown;
};

// ==================== H5配置接口 ====================

// H5配置接口
export interface H5Config {
  pageTitle: string;          // 页面标题
  pageBgColor: string;        // 页面背景颜色
  pageBgImage: ImageInfo | null;  // 页面背景图片
  headerImage: ImageInfo | null;  // 头部图片
  titleUpload: ImageInfo | null;  // 上传的标题图片
  gameIcon: ImageInfo | null;     // 游戏图标
  gameName: string;           // 游戏名称
  gameDesc: string;           // 游戏描述
  gameTextColor: string;      // 游戏名称和描述文字颜色
  buttonVersion: string;      // 按钮版本
  
  // 带icon版按钮字段
  iconButtonText: string;     // 带icon版按钮文本
  iconButtonTextColor: string; // 带icon版按钮文本颜色
  iconButtonBg: ImageInfo | null; // 带icon版按钮底图
  
  // 单按钮版字段
  singleButtonText: string;   // 单按钮版文本
  singleButtonTextColor: string; // 单按钮版文本颜色
  singleButtonBg: ImageInfo | null; // 单按钮版底图
  
  // 双按钮版字段
  leftButtonText: string;     // 左侧按钮文本
  leftButtonTextColor: string; // 左侧按钮文本颜色
  leftButtonBg: ImageInfo | null; // 左侧按钮底图
  rightButtonText: string;    // 右侧按钮文本
  rightButtonTextColor: string; // 右侧按钮文本颜色
  rightButtonBg: ImageInfo | null; // 右侧按钮底图
  buttonSpacing: number;      // 按钮间距
  
  modules: ModuleData[];      // 模块数据数组
  rulesTitle: string;         // 规则标题
  rulesBgImage: ImageInfo | null;  // 规则背景图片
  rulesContent: string;       // 规则内容
  footerLogo: ImageInfo | null;    // 页脚logo
  footerBg: ImageInfo | null;      // 页脚背景
  
  // 高级功能需要的属性
  canvasWidth: number;        // 画布宽度
  canvasHeight: number;       // 画布高度
  title?: string;             // 标题（可选）
  channelType?: ChannelType;  // 渠道类型（可选）
  channelConfig?: ChannelConfig; // 渠道配置（可选）
}

// ==================== 渠道配置接口 ====================

// 渠道配置接口
export interface ChannelConfig {
  name: string;
  maxWidth: number;
  maxHeight: number;
  aspectRatio: number;
  supportedFormats: string[];
  maxFileSize: number;
  requirements: {
    minWidth: number;
    minHeight: number;
    preferredWidth: number;
    preferredHeight: number;
  };
}

// 注意：ChannelImageData 和 ChannelImages 接口已在上方定义
// 注意：PluginMessage 类型已在上方定义

// 活动规则内容接口
export interface ActivityRulesContent {
  rulesTitle: string;               // 规则标题
  rulesBgImage: ImageInfo | null;   // 规则标题背景图片
  rulesContent: string;             // 规则内容文本
}

// ==================== 高级功能接口 ====================

// 九宫格配置接口
export interface NineGridConfig {
  name?: string;
  totalWidth: number;
  totalHeight: number;
  gap: number;
  backgroundColor?: RGB;
  images?: ImageInfo[];
  cellConfig?: Record<string, unknown>;
}

// 批量处理配置接口
export interface BatchProcessConfig {
  images: ImageInfo[];
  operations: Array<{
    type: string;
    params: Record<string, unknown>;
  }>;
}

// 渠道类型枚举
export enum ChannelType {
  OPPO = 'oppo',
  VIVO = 'vivo',
  HUAWEI = 'huawei',
  XIAOMI = 'xiaomi'
}

// 渠道适配器配置接口
export interface ChannelAdapterConfig {
  channelType: ChannelType;
  targetWidth: number;
  targetHeight: number;
  quality: number;
  format: 'jpg' | 'png' | 'webp';
  enableOptimization: boolean;
  compressionLevel: number;
  customSettings: Record<string, unknown>;
} 