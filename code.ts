// 渠道美术-H5延展工具核心逻辑
/// <reference types="@figma/plugin-typings" />

// ==================== 常量定义 ====================
const CONSTANTS = {
  H5_WIDTH: 1080,           // H5画板宽度
  MODULE_WIDTH: 950,        // 模块宽度
  PADDING: 0,               // 内边距
  GRID_SIZE: 3,             // 九宫格行列数
  DEFAULT_SPACING: 20       // 默认间距
} as const;

// ==================== 类型定义 ====================

// 图片信息接口
interface ImageInfo {
  data: Uint8Array;    // 图片数据，以无符号8位整数数组形式存储
  width: number;       // 图片宽度
  height: number;      // 图片高度
  name: string;        // 图片名称
  type: string;        // 图片类型（如 'png', 'jpg' 等）
}

// 模块数据接口
interface ModuleData {
  id: string;      // 模块唯一标识
  title: string;   // 模块标题
  type: string;    // 模块类型
  content: Record<string, unknown>;
}

// H5配置接口
// 模块类型定义
type ModuleType = 'activityContent' | 'signIn' | 'collectCards' | 'nineGrid';
interface H5Config {
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
}

// 模块类型定义


// 模块接口定义
interface Module {
  id: string;          // 模块唯一标识
  type: ModuleType;    // 模块类型，使用 ModuleType 枚举
  title: string;       // 模块标题
  content: ModuleContent;  // 模块内容，根据不同类型有不同的结构
}

// 模块内容类型定义
// 可以是活动内容、签到内容、集卡内容或九宫格内容中的一种
type ModuleContent = ActivityContentData | SignInContent | CollectCardsContent | NineGridContent;

// 各种内容模块接口

// 活动内容接口（区别于活动规则）
interface ActivityContentData {
  mainTitle: string;            // 主标题
  mainTitleBg: Uint8Array | ImageInfo | null; // 主标题背景图片
  subTitle: string;             // 副标题
  subTitleBg: Uint8Array | ImageInfo | null;  // 副标题背景图片
  text: string;                 // 活动内容文本
  image: Uint8Array | ImageInfo | null;     // 活动内容插图
}

// 活动规则内容接口
interface ActivityRulesContent {
  mainTitle: string;            // 主标题
  mainTitleBg: Uint8Array | null; // 主标题背景图片
  subTitle: string;             // 副标题
  subTitleBg: Uint8Array | null;  // 副标题背景图片
  text: string;                 // 规则文本内容
  image: Uint8Array | null;     // 规则相关图片
}

// 签到内容接口
interface SignInContent {
  titleImage: Uint8Array | null;  // 标题图片
  bgImage: Uint8Array | null;     // 背景图片
  daysCount: number;              // 签到天数
  dayIcon: Uint8Array | null;     // 每日图标
  signButton: Uint8Array | null;  // 签到按钮图片
}

// 集卡内容接口
interface CollectCardsContent {
  titleImage: Uint8Array | null;    // 标题图片
  bgImage: Uint8Array | null;       // 背景图片
  cardsCount: number;               // 卡片数量
  cardStyle: 'style1' | 'style2' | 'style3';  // 卡片样式
  cardBg: Uint8Array | null;        // 卡片背景图片
  combineButton: Uint8Array | null; // 合成按钮图片
}


// 九宫格内容接口
interface NineGridContent {
  mainTitle: string;            // 主标题
  titleBgImage: Uint8Array | ImageInfo | null;  // 标题背景图片
  gridBgImage: Uint8Array | ImageInfo | null;   // 九宫格背景图片
  drawButtonImage: Uint8Array | ImageInfo | null;  // 抽奖按钮图片
  prizeBgImage: Uint8Array | ImageInfo | null;     // 奖品背景图片
  prizes: PrizeItem[];          // 奖品列表
}

// 奖品项目接口
interface PrizeItem {
  image: Uint8Array | ImageInfo | null;  // 奖品图片，使用 Uint8Array 或 ImageInfo 存储二进制数据，可以为 null
  name: string;              // 奖品名称
}

// 插件消息接口
interface PluginMessage {
  type: string;                 // 消息类型
  config?: H5Config;            // 可选的H5配置
  [key: string]: unknown;       // 允许添加任意其他属性
}

// ==================== 工具函数 ====================

// 工具函数
class Utils {
  // 延迟函数，返回一个Promise，在指定的毫秒数后resolve
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 从ImageInfo或Uint8Array中提取Uint8Array数据
  static extractUint8Array(imageData: ImageInfo | Uint8Array | null): Uint8Array | null {
    if (!imageData) return null;
    
    // 如果已经是Uint8Array，直接返回
    if (imageData instanceof Uint8Array) {
      return imageData;
    }
    
    // 如果是对象且包含data属性，返回data
    if (typeof imageData === 'object' && 'data' in imageData) {
      return imageData.data;
    }
    
    // 如果都不符合，返回null
    return null;
  }
}

// 字体加载管理
const FontManager = {
  fonts: [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" }, 
    { family: "Inter", style: "Bold" }
  ] as const,

  async loadAll(): Promise<void> {
    const loadPromises = this.fonts.map(async (font) => {
      try {
        await figma.loadFontAsync(font);
        return { success: true, font };
      } catch (error) {
        return { success: false, font, error };
      }
    });
    
    const results = await Promise.all(loadPromises);
    
    const failedFonts = results
      .filter(result => !result.success)
      .map(result => result.font);
    
    if (failedFonts.length > 0) {
      console.warn('部分字体加载失败:', failedFonts);
    }
  },

  async loadSingle(fontName: FontName): Promise<void> {
    try {
      await figma.loadFontAsync(fontName);
    } catch (error) {
      console.warn(`字体加载失败: ${fontName.family} ${fontName.style}`, error);
    }
  }
};

// 颜色处理工具
const ColorUtils = {
  hexToRgb(hex: string): RGB {
    // 处理缩写形式 (#fff -> #ffffff)
    const fullHex = hex.length === 4 
      ? '#' + hex.slice(1).split('').map(c => c + c).join('')
      : hex;
    
    const cleanHex = fullHex.replace('#', '');
    
    return {
      r: parseInt(cleanHex.substring(0, 2), 16) / 255,
      g: parseInt(cleanHex.substring(2, 4), 16) / 255,
      b: parseInt(cleanHex.substring(4, 6), 16) / 255
    };
  },

  createSolidFill(color: RGB, opacity = 1): SolidPaint {
    return {
      type: 'SOLID',
      color,
      opacity
    };
  }
};

// 节点创建工具
const NodeUtils = {
  // 创建一个新的Frame节点
  createFrame(name: string, width: number, height: number): FrameNode {
    const frame = figma.createFrame();
    frame.name = name;
    frame.resize(width, height);
    return frame;
  },

  // 创建一个新的Text节点并设置其属性
  async createText(text: string, fontSize: number, fontWeight: 'Regular' | 'Medium' | 'Bold' = 'Regular'): Promise<TextNode> {
    const textNode = figma.createText();
    const fontName = { family: "Inter", style: fontWeight };
    
    // 加载所需的字体
    await FontManager.loadSingle(fontName);
    
    // 设置文本节点的属性
    textNode.characters = text;
    textNode.fontSize = fontSize;
    textNode.fontName = fontName;
    
    return textNode;
  },

  // 为Frame节点设置自动布局属性
  setupAutoLayout(
    frame: FrameNode, 
    direction: 'HORIZONTAL' | 'VERTICAL' = 'VERTICAL',
    spacing = 0,
    padding = 0
  ): void {
    frame.layoutMode = direction;
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "FIXED";
    frame.itemSpacing = spacing;
    frame.paddingTop = padding;
    frame.paddingBottom = padding;
    frame.paddingLeft = padding;
    frame.paddingRight = padding;
    frame.primaryAxisAlignItems = "MIN";
    frame.counterAxisAlignItems = "CENTER";
  }
};

// 辅助函数-创建标题容器
async function createTitleContainer(
  title: string, 
  bgImage: Uint8Array | ImageInfo | null,
  width: number,
  height: number,
  fontSize: number = 24,
  fontWeight: 'Regular' | 'Medium' | 'Bold' = 'Bold'
): Promise<FrameNode> {
  const container = NodeUtils.createFrame("标题容器", width, height);
  
  // 设置容器填充为透明
  container.fills = [];
  
  // 如果有背景图片，直接插入背景图片节点，上下左右居中对齐
  if (bgImage) {
    try {
      const backgroundNode = await ImageNodeBuilder.insertImage(
        bgImage,
        "标题背景",
        width,
        height
      );
      if (backgroundNode) {
        // 上下左右居中对齐
        backgroundNode.x = (width - backgroundNode.width) / 2;
        backgroundNode.y = (height - backgroundNode.height) / 2;
        container.appendChild(backgroundNode);
      }
    } catch (error) {
      console.error('标题背景图片创建失败:', error);
      // 如果图片创建失败，使用默认背景色
      container.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 0.95 })];
    }
  }

  // 添加标题文本
  const titleText = await NodeUtils.createText(title, fontSize, fontWeight);
  titleText.resize(width, titleText.height);
  titleText.textAlignHorizontal = "CENTER";
  titleText.y = (height - titleText.height) / 2;
  
  container.appendChild(titleText);
  return container;
}

// ==================== 主程序入口 ====================

// 初始化插件UI
figma.showUI(__html__, { 
  width: 360, 
  height: 700,  
  themeColors: true 
});

// 插件初始数据
const PLUGIN_DATA = {
  version: '1.0.0',
  moduleTypes: [
    { id: 'nineGrid', name: '九宫格抽奖' },
    { id: 'signIn', name: '每日签到' },
    { id: 'collectCards', name: '集卡活动' },
    { id: 'activityRules', name: '活动详情' }
  ]
} as const;

// 初始化UI
figma.ui.postMessage({ 
  type: 'init',
  data: PLUGIN_DATA
});

// ==================== 消息处理器 ====================

const MessageHandlers = {
  async handleCreatePrototype(config: H5Config): Promise<void> {
    if (!config) {
      throw new Error('配置数据为空');
    }

    await FontManager.loadAll();
    await createH5Prototype(config);
    
    figma.ui.postMessage({ 
      type: 'creation-success',
      message: '原型创建成功！'
    });
  },

  async handleSaveConfig(config: H5Config): Promise<void> {
    try {
      await figma.clientStorage.setAsync('h5-config', JSON.stringify(config));
      figma.ui.postMessage({
        type: 'save-success',
        message: '配置已保存'
      });
    } catch (error) {
      throw new Error(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  },

  async handleLoadConfig(): Promise<void> {
    try {
      const configStr = await figma.clientStorage.getAsync('h5-config');
      const config = configStr ? JSON.parse(configStr) : null;
      
      figma.ui.postMessage({
        type: 'load-config-success',
        config: config
      });
    } catch (error) {
      throw new Error(`加载配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
};

// 消息处理主函数
figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    switch (msg.type) {
      case 'create-prototype':
        await MessageHandlers.handleCreatePrototype(msg.config!);
        break;
      
      case 'save-config':
        await MessageHandlers.handleSaveConfig(msg.config!);
        break;
      
      case 'load-config':
        await MessageHandlers.handleLoadConfig();
        break;
      
      case 'close-plugin':
        figma.closePlugin();
        break;

      case 'reset-complete':
        console.log('UI重置完成');
        // 发送确认消息回UI
        figma.ui.postMessage({
          type: 'reset-acknowledged',
          message: '插件已确认重置完成'
        });
        break;
        
      case 'ping':
        console.log('收到UI ping消息');
        // 回复pong消息
        figma.ui.postMessage({
          type: 'pong',
          message: '插件连接正常'
        });
        break;
      
      default:
        console.warn('未知消息类型:', msg.type);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    figma.ui.postMessage({
      type: `${msg.type.replace(/^(create-prototype|save-config|load-config)$/, '$1-error')}`,
      message: errorMessage
    });
    
    figma.notify(errorMessage, { timeout: 5000 });
  }
};

// ==================== H5原型创建器 ====================

class H5PrototypeBuilder {
  private config: H5Config;
  private outerFrame!: FrameNode;
  private h5Frame!: FrameNode;

  constructor(config: H5Config) {
    this.config = config;
  }

  async build(): Promise<FrameNode> {
    await FontManager.loadAll();
    
    this.createBaseFrames();
    await this.setupBackground();
    await this.addModules();
    this.finalizeLayout();
    
    return this.outerFrame;
  }

  private createBaseFrames(): void {
    // 创建外层背景画板
    this.outerFrame = NodeUtils.createFrame('H5原型', CONSTANTS.H5_WIDTH, 100);
    
    // 创建主H5画板
    this.h5Frame = NodeUtils.createFrame('自适应模块', CONSTANTS.H5_WIDTH, 100);
    this.h5Frame.fills = [];
    
    // 设置自动布局
    NodeUtils.setupAutoLayout(this.h5Frame, 'VERTICAL', 0, 0);
    this.h5Frame.clipsContent = true;// 设置内容裁剪
    this.h5Frame.layoutWrap = "NO_WRAP";// 设置布局不换行，确保所有子元素在一列中垂直排列

    // 设置自动布局
    NodeUtils.setupAutoLayout(this.outerFrame, 'VERTICAL', 0, 0);
    this.outerFrame.clipsContent = true;// 设置内容裁剪
    this.outerFrame.layoutWrap = "NO_WRAP";// 设置布局不换行，确保所有子元素在一列中垂直排列
    
    this.outerFrame.appendChild(this.h5Frame);
  }

  /**
   * 设置背景
   * 根据配置设置页面背景，可以是图片或颜色
   */
  private async setupBackground(): Promise<void> {
    // 设置背景
    let backgroundFill: Paint;
    if (this.config.pageBgImage) {
      const bgImageData = Utils.extractUint8Array(this.config.pageBgImage);
      if (bgImageData) {
        backgroundFill = await ImageNodeBuilder.createImageFill(bgImageData);
      } else {
        backgroundFill = ColorUtils.createSolidFill(ColorUtils.hexToRgb(this.config.pageBgColor));
      }
    } else {
      backgroundFill = ColorUtils.createSolidFill(ColorUtils.hexToRgb(this.config.pageBgColor));
    }
    this.outerFrame.fills = [backgroundFill];
  }

  /**
   * 添加模块
   * 创建所有模块并将它们添加到H5画板中
   */
  private async addModules(): Promise<void> {
    // 创建所有模块
    const modules = await this.createAllModules();
    
    // 遍历模块数组，将非空模块添加到H5画板中
    modules.forEach(module => {
      if (module) {
        this.h5Frame.appendChild(module);
      }
    });
  }

  /**
   * 创建所有模块
   * 异步方法，用于创建所有需要的模块
   * @returns Promise，解析为一个包含所有创建的模块（FrameNode或null）的数组
   */
  private async createAllModules(): Promise<(FrameNode | null)[]> {
    return Promise.all([
      this.createHeaderModuleIfNeeded(),     // 创建头部模块（如果需要）
      this.createGameInfoModuleIfNeeded(),   // 创建游戏信息模块（如果需要）
      ...this.createCustomModules(),         // 创建自定义模块（展开数组）
      this.createRulesModuleIfNeeded(),      // 创建规则模块（如果需要）
      this.createFooterModule()              // 创建底部模块
    ]);
  }

  private async createHeaderModuleIfNeeded(): Promise<FrameNode | null> {
    if (this.config.headerImage || this.config.titleUpload) {
      return createHeaderModule(this.config.headerImage, this.config.titleUpload);
    }
    return null;
  }

  private async createGameInfoModuleIfNeeded(): Promise<FrameNode | null> {
    if (this.config.gameName || this.config.gameDesc || this.config.gameIcon) {
      const module = await createGameInfoModule(this.config);
      module.layoutAlign = "CENTER";
      return module;
    }
    return null;
  }

  private createCustomModules(): Promise<FrameNode>[] {
    return this.config.modules?.map(async module => {
      const moduleFrame = await createCustomModule(module as unknown as Module);
      return moduleFrame;
    }) || [];
  }

  private async createRulesModuleIfNeeded(): Promise<FrameNode | null> {
    if (this.config.rulesContent) {
      const module = await createRulesModule(this.config);
      module.layoutAlign = "CENTER";
      return module;
    }
    return null;
  }

  private async createFooterModule(): Promise<FrameNode> {
    const module = await createFooterModule(this.config);
    module.layoutAlign = "STRETCH";
    return module;
  }

  private finalizeLayout(): void {
    // 调整外层背景画板高度适应内容
    this.outerFrame.resize(CONSTANTS.H5_WIDTH, this.h5Frame.height);
    
    // 添加到当前页面并居中显示
    figma.currentPage.appendChild(this.outerFrame);
    figma.viewport.scrollAndZoomIntoView([this.outerFrame]);
  }
}

// 主创建函数
async function createH5Prototype(config: H5Config): Promise<FrameNode> {
  try {
    const builder = new H5PrototypeBuilder(config);
    return await builder.build();
  } catch (error) {
    const errorMessage = `创建失败: ${error instanceof Error ? error.message : '未知错误'}`;
    figma.notify(errorMessage, { timeout: 5000 });
    throw error;
  }
}

// ==================== 图片处理模块 ====================

// 统一的图片处理类
class ImageNodeBuilder {
  // 创建图片对象
  static async createImage(bytes: Uint8Array): Promise<Image | null> {
    try {
      return figma.createImage(bytes);
    } catch (error) {
      console.error('图片创建失败:', error);
      return null;
    }
  }

  // 创建图片填充
  static async createImageFill(bytes: Uint8Array, scaleMode: 'FILL' | 'FIT' = 'FILL'): Promise<SolidPaint | ImagePaint> {
    const image = await this.createImage(bytes);
    
    if (image) {
      return {
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: scaleMode
      } as ImagePaint;
    }
    
    // 失败时返回灰色填充
    return ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 });
  }

  // 直接插入图片节点，使用前端获取的真实尺寸
  static async insertImage(
    imageData: ImageInfo | Uint8Array, 
    name: string, 
    defaultWidth: number = 800, 
    defaultHeight: number = 600
  ): Promise<RectangleNode | null> {
    try {
      let uint8Array: Uint8Array;
      let width: number;
      let height: number;

      // 处理不同的数据格式
      if (imageData && typeof imageData === 'object' && 'data' in imageData) {
        // 新格式：包含尺寸信息的ImageInfo
        uint8Array = imageData.data;
        width = imageData.width;
        height = imageData.height;
      } else if (imageData instanceof Uint8Array) {
        // 旧格式：纯Uint8Array
        uint8Array = imageData;
        width = defaultWidth;
        height = defaultHeight;
      } else {
        console.warn(`图片数据格式错误: ${name}`);
        return null;
      }

      if (!uint8Array || uint8Array.length === 0) {
        console.warn(`图片数据为空: ${name}`);
        return null;
      }

      const image = await this.createImage(uint8Array);
      if (!image) {
        console.warn(`图片创建失败: ${name}`);
        return null;
      }

      // 直接创建图片节点
      const imageNode = figma.createRectangle();
      imageNode.name = name;
      
      // 使用真实尺寸
      imageNode.resize(width, height);
      
      // 应用图片填充
      imageNode.fills = [{
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FILL'
      }];

      return imageNode;
    } catch (error) {
      console.error(`图片插入失败: ${name}`, error);
      return null;
    }
  }

  // 为现有节点设置图片填充
  static async setImageFill(
    node: FrameNode | RectangleNode, 
    imageData: ImageInfo | Uint8Array | null, 
    scaleMode: 'FILL' | 'FIT' = 'FILL'
  ): Promise<void> {
    if (!imageData) return;

    const uint8Array = Utils.extractUint8Array(imageData);
    if (!uint8Array) return;

    try {
      const imageFill = await this.createImageFill(uint8Array, scaleMode);
      node.fills = [imageFill];
    } catch (error) {
      console.error('设置图片填充失败:', error);
    }
  }
}

// ==================== 模块创建器 ====================

// 头图模块创建器
async function createHeaderModule(
  headerImage: ImageInfo | null, 
  titleUpload: ImageInfo | null
): Promise<FrameNode> {
  // 固定尺寸为1080x1080px
  const frame = NodeUtils.createFrame("头图", 1080, 1080);
  frame.clipsContent = true; // 打开裁剪内容
  frame.fills = []; // 设置画板填充为透明
  
  // 手动定位
  frame.layoutMode = "NONE";

  let currentY = 0; // 用于垂直排列

  // 添加头图
  if (headerImage) {
    try {
      // 直接插入头图，不调整尺寸
      const headerNode = await ImageNodeBuilder.insertImage(headerImage, "头图图片");
      
      if (headerNode) {
        frame.appendChild(headerNode); // 先将图片添加到画板
        
        // 设置头图图片的对齐属性：水平居中、上对齐
        headerNode.constraints = { 
          horizontal: "CENTER",  // 水平居中
          vertical: "MIN"        // 上对齐（顶部对齐）
        };
        
        // 手动设置位置：水平居中、顶部对齐
        headerNode.x = (frame.width - headerNode.width) / 2;
        headerNode.y = currentY;
        
        currentY = headerNode.height; // 更新Y位置
      }
    } catch (error) {
      console.error('头图创建失败:', error);
    }
  }

  // 添加标题图片
  if (titleUpload) {
    try {
      // 直接插入标题图片，不调整尺寸
      const titleNode = await ImageNodeBuilder.insertImage(titleUpload, "标题图片");
      
      if (titleNode) {
        frame.appendChild(titleNode);
        
        // 设置约束条件
        titleNode.constraints = { 
          horizontal: "CENTER",  // 水平居中
          vertical: "MAX"        // 底部对齐
        };
        
        // 手动设置位置：水平居中，底部对齐
        titleNode.x = (frame.width - titleNode.width) / 2;
        titleNode.y = frame.height - titleNode.height; // 底部对齐
        
      }
    } catch (error) {
      console.error('标题图片创建失败:', error);
    }
  }

  return frame;
}

// ==================== 游戏信息模块创建器 ====================

// 创建游戏信息模块
async function createGameInfoModule(config: H5Config): Promise<FrameNode> {
  // 根据按钮版本调整框架高度
  let frameHeight = 210;
  if (config.buttonVersion === 'doubleButton') {
    frameHeight = 250; // 双按钮版需要更多空间
  }
  
  // 创建游戏信息框架
  const frame = NodeUtils.createFrame("游戏信息", CONSTANTS.H5_WIDTH, frameHeight);
  // 设置框架填充为透明
  frame.fills = [];

  // 创建游戏信息布局管理器
  const layout = new GameInfoLayoutManager(frame, config);
  // 构建游戏信息布局
  await layout.build();

  // 返回创建好的游戏信息模块框架
  return frame;
}

// 游戏信息布局管理器类
class GameInfoLayoutManager {
  // 存储游戏信息框架节点
  private frame: FrameNode;
  // 存储H5配置信息
  private config: H5Config;

  // 构造函数，初始化框架节点和配置信息
  constructor(frame: FrameNode, config: H5Config) {
    this.frame = frame;
    this.config = config;
  }

  async build(): Promise<void> {
    // 只有带icon版才显示游戏图标和游戏信息
    if (this.config.buttonVersion === 'imageButton') {
      // 添加游戏图标
      await this.addGameIcon();
      // 添加游戏信息（如游戏名称和描述）
      await this.addGameInfo();
    }
    
    // 无论是哪种版本，都需要添加按钮
    await this.addButtons();
  }

  // 添加游戏图标
  private async addGameIcon(): Promise<void> {
    // 如果没有配置游戏图标，则直接返回
    if (!this.config.gameIcon) return;

    // 插入游戏图标图片
    const iconImageNode = await ImageNodeBuilder.insertImage(
      this.config.gameIcon, 
      "游戏图标", 
      190, 
      190
    );
    
    // 如果图标插入失败，则直接返回
    if (!iconImageNode) return;

    // 设置图标尺寸
    iconImageNode.resize(190, 190);
    // 设置图标圆角
    iconImageNode.cornerRadius = 40;
    // 设置图标边框样式
    iconImageNode.strokes = [{
      type: 'SOLID',
      color: { r: 1, g: 1, b: 1 },
      opacity: 0.2
    }];
    // 设置边框宽度
    iconImageNode.strokeWeight = 1;
    // 设置图标水平位置
    iconImageNode.x = 70;
    // 设置图标垂直居中
    iconImageNode.y = (this.frame.height - 190) / 2;
    
    // 将图标添加到框架中
    this.frame.appendChild(iconImageNode);
  }

  // 添加游戏信息（游戏名称和描述）
  private async addGameInfo(): Promise<void> {
    // 设置文本颜色，如果配置中有指定则使用，否则默认为白色
    const textColor = this.config.gameTextColor 
      ? ColorUtils.hexToRgb(this.config.gameTextColor)
      : { r: 1, g: 1, b: 1 };

    // 添加游戏名称
    if (this.config.gameName) {
      // 创建游戏名称文本节点
      const nameText = await NodeUtils.createText(this.config.gameName, 48, 'Medium');
      // 设置文本位置
      nameText.x = 285;
      nameText.y = 49;
      // 设置文本左对齐
      nameText.textAlignHorizontal = "LEFT";
      // 设置文本颜色
      nameText.fills = [ColorUtils.createSolidFill(textColor)];
      // 将文本节点添加到框架中
      this.frame.appendChild(nameText);
    }

    // 添加游戏描述
    if (this.config.gameDesc) {
      // 创建游戏描述文本节点
      const descText = await NodeUtils.createText(this.config.gameDesc, 32, 'Regular');
      // 设置文本位置
      descText.x = 285;
      descText.y = 122;
      // 设置文本左对齐
      descText.textAlignHorizontal = "LEFT";
      // 设置文本颜色
      descText.fills = [ColorUtils.createSolidFill(textColor)];
      // 将文本节点添加到框架中
      this.frame.appendChild(descText);
    }
  }

  // 添加按钮
  private async addButtons(): Promise<void> {
    // 根据配置的按钮版本选择不同的按钮添加方法
    switch (this.config.buttonVersion) {
      case 'imageButton':
        // 添加图标按钮
        await this.addIconButton();
        break;
      case 'singleButton':
        // 添加单个按钮
        await this.addSingleButton();
        break;
      case 'doubleButton':
        // 添加双按钮
        await this.addDoubleButtons();
        break;
    }
  }

  // 添加图标按钮
  private async addIconButton(): Promise<void> {
    // 只有当有按钮底图时才创建按钮框架
    if (!this.config.iconButtonBg) {
      return;
    }

    // 创建按钮框架
    const buttonFrame = NodeUtils.createFrame("下载按钮", 344, 103);
    // 设置按钮位置：距离右边距70px
    buttonFrame.x = 666; // 距离右边距70px
    buttonFrame.y = (this.frame.height - 103) / 2; // 垂直居中

    // 设置按钮框架为透明背景
    buttonFrame.fills = [];

    // 添加按钮底图
    if (this.config.iconButtonBg) {
      try {
        const buttonBgImage = await ImageNodeBuilder.insertImage(
          this.config.iconButtonBg, 
          "按钮底图", 
          344, 
          103
        );
        if (buttonBgImage) {
          buttonBgImage.x = 0;
          buttonBgImage.y = 0;
          buttonFrame.appendChild(buttonBgImage);
        } else {
          // 如果图片插入失败，使用默认背景色
          buttonFrame.fills = [ColorUtils.createSolidFill({ r: 0, g: 0.44, b: 0.89 })];
          buttonFrame.cornerRadius = 30;
        }
      } catch (error) {
        console.error('按钮底图创建失败:', error);
        // 如果底图创建失败，设置默认背景色
        buttonFrame.fills = [ColorUtils.createSolidFill({ r: 0, g: 0.44, b: 0.89 })];
        buttonFrame.cornerRadius = 30;
      }
    } else {
      // 没有底图时使用默认背景色
      buttonFrame.fills = [ColorUtils.createSolidFill({ r: 0, g: 0.44, b: 0.89 })];
      buttonFrame.cornerRadius = 30;
    }

    // 添加按钮文本
    const buttonText = this.config.iconButtonText || "立即下载";
    if (buttonText) {
      // 设置文本颜色，如果配置中有指定则使用，否则默认为白色
      const textColor = this.config.iconButtonTextColor 
        ? ColorUtils.hexToRgb(this.config.iconButtonTextColor)
        : { r: 1, g: 1, b: 1 };

      // 创建文本节点
      const textNode = await NodeUtils.createText(buttonText, 36, 'Bold');
      // 设置文本颜色
      textNode.fills = [ColorUtils.createSolidFill(textColor)];
      // 调整文本大小以适应按钮
      textNode.resize(buttonFrame.width, textNode.height);
      // 设置文本水平居中
      textNode.textAlignHorizontal = "CENTER";
      // 设置文本垂直居中
      textNode.y = (buttonFrame.height - textNode.height) / 2;
      // 将文本添加到按钮框架中
      buttonFrame.appendChild(textNode);
    }

    // 将按钮框架添加到主框架中
    this.frame.appendChild(buttonFrame);
    
  }

  private async addSingleButton(): Promise<void> {
    // 只有当有按钮底图时才创建按钮框架
    if (!this.config.singleButtonBg) {
      return;
    }

    const buttonFrame = NodeUtils.createFrame("单按钮", 600, 80);
    buttonFrame.x = (CONSTANTS.H5_WIDTH - 600) / 2; // 水平居中
    buttonFrame.y = (this.frame.height - 80) / 2; // 垂直居中
    buttonFrame.cornerRadius = 40;

    // 使用上传的底图
    try {
      await ImageNodeBuilder.setImageFill(buttonFrame, this.config.singleButtonBg);
    } catch (error) {
      console.error('单按钮底图设置失败:', error);
      return;
    }

    // 添加按钮文本
    const buttonText = this.config.singleButtonText || "立即下载";
    if (buttonText) {
      const textColor = this.config.singleButtonTextColor 
        ? ColorUtils.hexToRgb(this.config.singleButtonTextColor)
        : { r: 1, g: 1, b: 1 };

      const textNode = await NodeUtils.createText(buttonText, 32, 'Bold');
      textNode.fills = [ColorUtils.createSolidFill(textColor)];
      textNode.resize(buttonFrame.width, textNode.height);
      textNode.textAlignHorizontal = "CENTER";
      textNode.y = (buttonFrame.height - textNode.height) / 2;
      buttonFrame.appendChild(textNode);
      
    }

    this.frame.appendChild(buttonFrame);
    
  }
  
  private async addDoubleButtons(): Promise<void> {
    // 检查是否至少有一个按钮有底图
    const hasLeftBg = this.config.leftButtonBg;
    const hasRightBg = this.config.rightButtonBg;
    
    if (!hasLeftBg && !hasRightBg) {
      return;
    }

    const spacing = this.config.buttonSpacing || 10;
    const totalButtonsWidth = 800; // 双按钮总宽度
    const buttonWidth = (totalButtonsWidth - spacing) / 2;
    const startX = (CONSTANTS.H5_WIDTH - totalButtonsWidth) / 2;
    const buttonY = (this.frame.height - 80) / 2; // 垂直居中

    // 左侧按钮 - 只有有底图时才创建
    if (hasLeftBg) {
      const leftButton = await this.createButton(
        "左侧按钮",
        this.config.leftButtonText || "左侧按钮",
        this.config.leftButtonTextColor,
        this.config.leftButtonBg,
        buttonWidth,
        80
      );
      if (leftButton) {
        leftButton.x = startX;
        leftButton.y = buttonY;
        this.frame.appendChild(leftButton);
      }
    }

    // 右侧按钮 - 只有有底图时才创建
    if (hasRightBg) {
      const rightButton = await this.createButton(
        "右侧按钮",
        this.config.rightButtonText || "右侧按钮",
        this.config.rightButtonTextColor,
        this.config.rightButtonBg,
        buttonWidth,
        80
      );
      if (rightButton) {
        rightButton.x = startX + buttonWidth + spacing;
        rightButton.y = buttonY;
        this.frame.appendChild(rightButton);
      }
    }
  }
  
  private async createButton(
    name: string,
    text: string,
    textColor: string,
    bgImage: ImageInfo | null,
    width: number,
    height: number
  ): Promise<FrameNode | null> {
    // 只有当有底图时才创建按钮
    if (!bgImage) {
      return null;
    }

    const buttonFrame = NodeUtils.createFrame(name, width, height);
    buttonFrame.cornerRadius = height / 2;

    // 使用上传的底图
    try {
      await ImageNodeBuilder.setImageFill(buttonFrame, bgImage);
    } catch (error) {
      console.error(`${name}底图设置失败:`, error);
      return null;
    }

    // 添加按钮文本
    if (text) {
      const color = textColor 
        ? ColorUtils.hexToRgb(textColor)
        : { r: 1, g: 1, b: 1 };

      const buttonText = await NodeUtils.createText(text, 24, 'Bold');
      buttonText.fills = [ColorUtils.createSolidFill(color)];
      buttonText.resize(width, buttonText.height);
      buttonText.textAlignHorizontal = "CENTER";
      buttonText.y = (height - buttonText.height) / 2;
      buttonFrame.appendChild(buttonText);
      
    }

    return buttonFrame;
  }
}

// ==================== 页面底部活动规则模块创建器 ====================
// 注意：此模块用于创建页面底部的活动规则，区别于上面的活动内容模块

// 页面底部活动规则模块创建器
async function createRulesModule(config: H5Config): Promise<FrameNode> {
  const frame = NodeUtils.createFrame("页面底部活动规则", CONSTANTS.MODULE_WIDTH, 150);
  frame.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];

  let yPos = CONSTANTS.DEFAULT_SPACING;

  // 添加规则标题
  if (config.rulesTitle) {
    const titleContainer = await createTitleContainer(
      config.rulesTitle, 
      Utils.extractUint8Array(config.rulesBgImage),
      CONSTANTS.MODULE_WIDTH,
      60,
      24, // 24px字体大小
      'Bold'
    );
    titleContainer.y = yPos;
    frame.appendChild(titleContainer);
    yPos += 80;
  }

  // 添加规则内容
  if (config.rulesContent) {
    const contentContainer = await createContentContainer(
      config.rulesContent,
      CONSTANTS.MODULE_WIDTH - 40,
      yPos
    );
    frame.appendChild(contentContainer);
    yPos += contentContainer.height + 30;
  } else {
    const defaultText = await NodeUtils.createText("暂无活动规则", 16);
    defaultText.x = CONSTANTS.DEFAULT_SPACING;
    defaultText.y = yPos;
    frame.appendChild(defaultText);
    yPos += defaultText.height + 30;
  }

  // 调整模块高度
  frame.resize(CONSTANTS.MODULE_WIDTH, Math.max(yPos, 150));
  return frame;
}

// 辅助函数：创建内容容器
async function createContentContainer(
  content: string,
  width: number,
  yPos: number
): Promise<FrameNode> {
  const container = NodeUtils.createFrame("规则内容", width, 0);
  container.x = CONSTANTS.DEFAULT_SPACING;
  container.y = yPos;
  container.fills = [];

  const contentText = await NodeUtils.createText(content, 16);
  contentText.lineHeight = { value: 24, unit: 'PIXELS' };
  contentText.resize(width, contentText.height);
  
  container.appendChild(contentText);
  container.resize(width, contentText.height);
  
  return container;
}

// ==================== 自定义模块创建器 ====================

// 创建自定义模块的异步函数
async function createCustomModule(module: Module): Promise<FrameNode> {
  try {
    // 创建ModuleFactory实例
    const factory = new ModuleFactory();
    // 使用工厂方法创建模块
    return await factory.createModule(module);
  } catch (error) {
    // 如果创建过程中出现错误，则创建并返回一个错误模块
    return createErrorModule(module, error);
  }
}

// 模块工厂类，用于创建不同类型的模块
class ModuleFactory {
  // 模块创建器映射，每种模块类型对应一个创建函数
  private readonly moduleCreators: Record<ModuleType, (content: ModuleContent) => Promise<FrameNode>> = {
    // 活动内容模块创建函数（区别于页面底部的活动规则模块）
    activityContent: (content) => createActivityContentModule(content as ActivityContentData),
    // 签到模块创建函数
    signIn: (content) => createSignInModule(content as SignInContent),
    // 集卡模块创建函数
    collectCards: (content) => createCollectCardsModule(content as CollectCardsContent),
    // 九宫格模块创建函数
    nineGrid: (content) => createNineGridModule(content as NineGridContent)
  };

  // 创建模块的异步方法
  async createModule(module: Module): Promise<FrameNode> {
    console.log(`创建模块: ${module.type}`, module);
    
    // 获取对应的模块创建器
    const creator = this.moduleCreators[module.type];
    if (!creator) {
      throw new Error(`不支持的模块类型: ${module.type}`);
    }

    // 对于九宫格模块和活动内容模块，直接返回创建的模块，不需要额外包装
    if (module.type === 'nineGrid' || module.type === 'activityContent') {
      return await creator(module.content);
    }

    // 其他模块使用原有的包装方式
    const frame = NodeUtils.createFrame(module.title || module.type, CONSTANTS.MODULE_WIDTH, 100);
    frame.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];

    // 使用创建器生成模块内容
    const moduleContent = await creator(module.content);
    frame.appendChild(moduleContent);
    // 调整框架大小以适应内容
    frame.resize(CONSTANTS.MODULE_WIDTH, moduleContent.height);

    return frame;
  }
}

// ==================== 错误模块创建器 ====================

// 创建错误模块的异步函数
async function createErrorModule(module: Module, error: unknown): Promise<FrameNode> {
  // 创建一个红色背景的框架来显示错误信息
  const frame = NodeUtils.createFrame("模块创建失败", CONSTANTS.MODULE_WIDTH, 100);
  frame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.9, b: 0.9 })];

  // 获取错误信息，如果error是Error实例则使用其message，否则使用默认文本
  const errorMessage = error instanceof Error ? error.message : '未知错误';
  // 创建错误文本节点
  const errorText = await NodeUtils.createText(`模块创建失败: ${errorMessage}`, 16);
  errorText.x = CONSTANTS.DEFAULT_SPACING;
  errorText.y = 40;
  // 设置错误文本颜色为深红色
  errorText.fills = [ColorUtils.createSolidFill({ r: 0.8, g: 0, b: 0 })];

  // 将错误文本添加到框架中
  frame.appendChild(errorText);
  return frame;
}

// ==================== 九宫格抽奖模块创建器 ====================

// 创建九宫格抽奖模块的异步函数
async function createNineGridModule(content: NineGridContent): Promise<FrameNode> {
  console.log('开始创建九宫格模块，内容：', content);
  
  // 创建整个九宫格模块容器：1080宽，背景透明，高度按实际创建成功来
  const frame = NodeUtils.createFrame("九宫格抽奖", 1080, 1000);
  frame.fills = []; // 背景填充为透明
  
  try {
    // 实例化九宫格模块构建器
    const builder = new NineGridModuleBuilder(frame, content);
    // 调用构建器的build方法来构建九宫格模块
    await builder.build();
    
    console.log('九宫格模块创建完成，最终高度：', frame.height);
    
    // 返回构建完成的框架
    return frame;
  } catch (error) {
    console.error('九宫格模块创建失败：', error);
    // 创建一个错误信息显示框
    const errorText = await NodeUtils.createText(`九宫格模块创建失败: ${error instanceof Error ? error.message : '未知错误'}`, 16);
    errorText.x = 20;
    errorText.y = 20;
    errorText.fills = [ColorUtils.createSolidFill({ r: 1, g: 0, b: 0 })];
    frame.appendChild(errorText);
    frame.resize(1080, 100);
    return frame;
  }
}

// 九宫格模块构建器类
class NineGridModuleBuilder {
  private frame: FrameNode; // 存储九宫格模块的框架节点
  private content: NineGridContent; // 存储九宫格模块的内容
  private readonly CELL_SIZE = 270; // 每个格子固定大小270x270px
  private readonly CELL_SPACING = 24; // 格子间距24px
  private currentY = 0; // 当前Y位置

  // 构造函数，初始化九宫格模块构建器
  constructor(frame: FrameNode, content: NineGridContent) {
    this.frame = frame; // 设置框架节点
    this.content = content; // 设置内容
  }

  // 构建九宫格模块的主要方法
  async build(): Promise<void> {
    console.log('开始构建九宫格模块');
    
    try {
      // 添加标题
      console.log('添加标题...');
      await this.addTitle();
      
      // 添加九宫格主体
      console.log('添加九宫格主体...');
      await this.addNineGrid();
      
      // 调整整个模块的高度
      console.log('调整模块高度...');
      this.adjustFrameHeight();
      
      console.log('九宫格模块构建完成');
    } catch (error) {
      console.error('九宫格模块构建过程中出错：', error);
      throw error;
    }
  }

  // 添加标题
  private async addTitle(): Promise<void> {
    // 如果没有主标题，直接返回
    if (!this.content.mainTitle) return;

    // 创建标题容器：1080宽，高度120
    const titleContainer = NodeUtils.createFrame("九宫格标题容器", 1080, 120);
    titleContainer.x = 0;
    titleContainer.y = this.currentY + 90;
    titleContainer.fills = []; // 透明背景

      // 添加标题背景图片节点（如果有）
      if (this.content.titleBgImage) {
        try {
          const titleBgImage = await ImageNodeBuilder.insertImage(
            this.content.titleBgImage,
            "标题背景图片",
            1080,
            120
          );
        
          if (titleBgImage) {
            titleBgImage.x = 0;
            titleBgImage.y = 0;
            titleContainer.appendChild(titleBgImage);
          }
        } catch (error) {
          console.error('标题背景图片创建失败:', error);
        }
      }

    // 添加标题文本节点
    const titleText = await NodeUtils.createText(this.content.mainTitle, 48, 'Bold');
    titleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    titleText.resize(1080, titleText.height);
    titleText.textAlignHorizontal = "CENTER";
    titleText.x = 0;
    titleText.y = (120 - titleText.height) / 2; // 垂直居中

    titleContainer.appendChild(titleText);
    this.frame.appendChild(titleContainer);
    this.currentY += 120;
  }

  // 添加九宫格主体
  private async addNineGrid(): Promise<void> {
    // 计算九宫格主体容器高度：3行格子 + 间距 + 上下边距
    const gridHeight = 3 * this.CELL_SIZE + 4 * this.CELL_SPACING + 180; // 上下各90px边距
    
    // 创建九宫格主体容器：1080宽，高度按创建成功后的高度来
    const gridContainer = NodeUtils.createFrame("九宫格主体容器", 1080, gridHeight);
    gridContainer.x = 0;
    gridContainer.y = this.currentY + 90;
    gridContainer.fills = []; // 填充为透明

    // 添加九宫格背景图片节点（930x930px，上下左右居中对齐）
    if (this.content.gridBgImage) {
      try {
        const backgroundNode = await ImageNodeBuilder.insertImage(
          this.content.gridBgImage,
          "九宫格背景",
          930,
          930
        );
        
        if (backgroundNode) {
          backgroundNode.x = (1080 - 930) / 2; // 水平居中
          backgroundNode.y = (gridHeight - 930) / 2; // 垂直居中
          gridContainer.appendChild(backgroundNode);
        }
      } catch (error) {
        console.error('九宫格背景图片创建失败:', error);
      }
    }

    // 创建九个格子容器
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col;
        const cell = await this.createGridCell(row, col, index);
        gridContainer.appendChild(cell);
      }
    }

    this.frame.appendChild(gridContainer);
    this.currentY += gridHeight;
  }

  private async createGridCell(row: number, col: number, index: number): Promise<FrameNode> {
    // 计算格子位置：三列，间距24px，加上90px上边距
    const startX = (1080 - (3 * this.CELL_SIZE + 2 * this.CELL_SPACING)) / 2; // 居中起始位置
    const x = startX + col * (this.CELL_SIZE + this.CELL_SPACING);
    const y = 90 + this.CELL_SPACING + row * (this.CELL_SIZE + this.CELL_SPACING); // 添加90px上边距

    // 中间位置创建抽奖按钮
    if (index === 4) {
      return this.createDrawButton(x, y);
    }

    // 其他位置创建奖品格子
    return this.createPrizeCell(x, y, index);
  }

  private async createDrawButton(x: number, y: number): Promise<FrameNode> {
    console.log('创建抽奖按钮，有按钮图片：', !!this.content.drawButtonImage);
    
    // 创建抽奖按钮容器（270x270px）
    const buttonFrame = NodeUtils.createFrame("抽奖按钮容器", this.CELL_SIZE, this.CELL_SIZE);
    buttonFrame.x = x;
    buttonFrame.y = y;
    buttonFrame.fills = []; // 容器填充为透明

    try {
      // 直接插入抽奖按钮图片节点
      if (this.content.drawButtonImage) {
        try {
          const buttonImage = await ImageNodeBuilder.insertImage(
            this.content.drawButtonImage,
            "抽奖按钮图片",
            this.CELL_SIZE,
            this.CELL_SIZE
          );
          
          if (buttonImage) {
            buttonImage.x = 0;
            buttonImage.y = 0;
            buttonFrame.appendChild(buttonImage);
          } else {
            console.warn('抽奖按钮图片插入失败，使用默认样式');
            await this.addDefaultButtonStyle(buttonFrame);
          }
        } catch (error) {
          console.error('抽奖按钮图片创建失败：', error);
          await this.addDefaultButtonStyle(buttonFrame);
        }
      } else {
        // 默认按钮样式
        await this.addDefaultButtonStyle(buttonFrame);
      }
    } catch (error) {
      console.error('创建抽奖按钮失败：', error);
      await this.addDefaultButtonStyle(buttonFrame);
    }

    return buttonFrame;
  }

  private async addDefaultButtonStyle(buttonFrame: FrameNode): Promise<void> {
    // 默认按钮样式
    buttonFrame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.3, b: 0.3 })];
    buttonFrame.cornerRadius = 10;

    const buttonText = await NodeUtils.createText("抽奖", 24, 'Bold');
    buttonText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    buttonText.resize(this.CELL_SIZE, buttonText.height);
    buttonText.textAlignHorizontal = "CENTER";
    buttonText.y = (this.CELL_SIZE - buttonText.height) / 2;
    buttonFrame.appendChild(buttonText);
  }

  private async createPrizeCell(x: number, y: number, index: number): Promise<FrameNode> {
    // 获取奖品索引（跳过中间的抽奖按钮）
    const prizeIndex = this.getPrizeIndex(Math.floor(index / 3), index % 3);
    const prize = this.content.prizes?.[prizeIndex];
    const prizeNumber = (prizeIndex + 1).toString();
    const paddedNumber = prizeNumber.length < 2 ? '0' + prizeNumber : prizeNumber;
    const prizeName = prize?.name || `奖品${paddedNumber}`;
    
    console.log(`创建奖品格子 ${prizeIndex}:`, { prizeName, hasImage: !!prize?.image, hasPrizeBg: !!this.content.prizeBgImage });
    
    // 创建奖品容器（270x270px）
    const prizeBox = NodeUtils.createFrame(prizeName, this.CELL_SIZE, this.CELL_SIZE);
    prizeBox.x = x;
    prizeBox.y = y;
    prizeBox.fills = []; // 容器填充为透明

    try {
      // 直接插入奖品背景图片节点（270x270px）
      if (this.content.prizeBgImage) {
        try {
          const prizeBgImage = await ImageNodeBuilder.insertImage(
            this.content.prizeBgImage,
            "奖品背景图片",
            this.CELL_SIZE,
            this.CELL_SIZE
          );
          
          if (prizeBgImage) {
            prizeBgImage.x = 0;
            prizeBgImage.y = 0;
            prizeBox.appendChild(prizeBgImage);
          }
        } catch (error) {
          console.error('奖品背景图片创建失败:', error);
        }
      }

      // 插入奖品图图片节点（180x180px，坐标为x45px，y11px）
      if (prize?.image) {
        try {
          const prizeImage = await ImageNodeBuilder.insertImage(
            prize.image,
            "奖品图片",
            180,
            180
          );
          
          if (prizeImage) {
            prizeImage.x = 45;
            prizeImage.y = 11;
            prizeBox.appendChild(prizeImage);
          }
        } catch (error) {
          console.error('奖品图片创建失败:', error);
          // 如果奖品图片创建失败，添加占位符
          const placeholder = NodeUtils.createFrame("占位符", 180, 180);
          placeholder.x = 45;
          placeholder.y = 11;
          placeholder.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
          placeholder.cornerRadius = 10;
          prizeBox.appendChild(placeholder);
        }
      } else {
        // 如果没有奖品图片，添加占位符
        const placeholder = NodeUtils.createFrame("占位符", 180, 180);
        placeholder.x = 45;
        placeholder.y = 11;
        placeholder.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
        placeholder.cornerRadius = 10;
        prizeBox.appendChild(placeholder);
      }

      // 插入文本节点（大小26，Medium，居中对齐，距离容器顶部190px）
      const displayName = prize?.name || prizeName;
      if (displayName) {
        const prizeText = await NodeUtils.createText(displayName, 26, 'Medium');
        prizeText.resize(this.CELL_SIZE, prizeText.height);
        prizeText.textAlignHorizontal = "CENTER";
        prizeText.x = 0;
        prizeText.y = 190;
        prizeText.fills = [ColorUtils.createSolidFill({ r: 0, g: 0, b: 0 })]; // 设置黑色文字
        prizeBox.appendChild(prizeText);
      }
    } catch (error) {
      console.error(`创建奖品格子失败 ${prizeIndex}:`, error);
    }

    return prizeBox;
  }

  // 获取奖品在九宫格中的索引（跳过中间的抽奖按钮）
  private getPrizeIndex(row: number, col: number): number {
    const cellIndex = row * 3 + col;
    if (cellIndex < 4) return cellIndex;
    return cellIndex - 1; // 跳过中间的抽奖按钮位置
  }

  // 调整整个模块的高度
  private adjustFrameHeight(): void {
    this.frame.resize(1080, this.currentY + 90 );
  }
}


// ==================== 签到模块创建器 ====================

async function createSignInModule(content: SignInContent): Promise<FrameNode> {
  const frame = NodeUtils.createFrame("每日签到", CONSTANTS.MODULE_WIDTH, 460);
  
  const builder = new SignInModuleBuilder(frame, content);
  await builder.build();
  
  return frame;
}

class SignInModuleBuilder {
  private frame: FrameNode;
  private content: SignInContent;

  constructor(frame: FrameNode, content: SignInContent) {
    this.frame = frame;
    this.content = content;
  }

  async build(): Promise<void> {
    await this.setupBackground();
    await this.addTitle();
    await this.addSignInDays();
    await this.addSignInButton();
  }

  private async setupBackground(): Promise<void> {
    if (this.content.bgImage) {
      await ImageNodeBuilder.setImageFill(this.frame, this.content.bgImage);
    } else {
      this.frame.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 1 })];
    }
  }

  private async addTitle(): Promise<void> {
    const titleFrame = NodeUtils.createFrame("签到标题", 500, 100);
    titleFrame.x = (CONSTANTS.MODULE_WIDTH - 500) / 2;
    titleFrame.y = CONSTANTS.DEFAULT_SPACING;

    if (this.content.titleImage) {
      await ImageNodeBuilder.setImageFill(titleFrame, this.content.titleImage, 'FIT');
    } else {
      await this.addDefaultTitle(titleFrame);
    }

    this.frame.appendChild(titleFrame);
  }

  private async addDefaultTitle(titleFrame: FrameNode): Promise<void> {
    titleFrame.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.5, b: 0.3 })];
    
    const titleText = await NodeUtils.createText("每日签到", 28, 'Bold');
    titleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    titleText.resize(500, titleText.height);
    titleText.textAlignHorizontal = "CENTER";
    titleText.y = (100 - titleText.height) / 2;
    
    titleFrame.appendChild(titleText);
  }

  private async addSignInDays(): Promise<void> {
    const daysContainer = NodeUtils.createFrame("签到日期容器", CONSTANTS.MODULE_WIDTH - 40, 240);
    daysContainer.x = CONSTANTS.DEFAULT_SPACING;
    daysContainer.y = 140;
    daysContainer.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 }, 0.8)];
    daysContainer.cornerRadius = 10;
    
    NodeUtils.setupAutoLayout(daysContainer, 'HORIZONTAL', 10, 10);

    const daysCount = this.content.daysCount || 7;
    
    for (let i = 0; i < daysCount; i++) {
      const dayItem = await this.createDayItem(i + 1);
      daysContainer.appendChild(dayItem);
    }

    this.frame.appendChild(daysContainer);
  }

  private async createDayItem(dayNumber: number): Promise<FrameNode> {
    const dayItem = NodeUtils.createFrame(`第${dayNumber}天`, 80, 220);
    dayItem.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 0.95 })];
    dayItem.cornerRadius = 5;
    
    NodeUtils.setupAutoLayout(dayItem, 'VERTICAL', 10, 10);

    // 添加日期图标
    const dayIconFrame = await this.createDayIcon();
    dayItem.appendChild(dayIconFrame);

    // 添加日期文本
    const dayText = await NodeUtils.createText(`第${dayNumber}天`, 16, 'Medium');
    dayText.resize(80, dayText.height);
    dayText.textAlignHorizontal = "CENTER";
    dayItem.appendChild(dayText);

    // 添加奖励描述
    const rewardText = await NodeUtils.createText("金币 x 100", 14);
    rewardText.fills = [ColorUtils.createSolidFill({ r: 0.5, g: 0.5, b: 0.5 })];
    rewardText.resize(80, rewardText.height);
    rewardText.textAlignHorizontal = "CENTER";
    dayItem.appendChild(rewardText);

    return dayItem;
  }

  private async createDayIcon(): Promise<FrameNode> {
    const dayIconFrame = NodeUtils.createFrame("日期图标", 60, 60);
    
    if (this.content.dayIcon) {
      await ImageNodeBuilder.setImageFill(dayIconFrame, this.content.dayIcon, 'FILL');
    } else {
      dayIconFrame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.8, b: 0.2 })];
      dayIconFrame.cornerRadius = 30;
    }

    return dayIconFrame;
  }

  private async addSignInButton(): Promise<void> {
    const buttonFrame = NodeUtils.createFrame("签到按钮", 200, 60);
    buttonFrame.x = (CONSTANTS.MODULE_WIDTH - 200) / 2;
    buttonFrame.y = 400;

    if (this.content.signButton) {
      await ImageNodeBuilder.setImageFill(buttonFrame, this.content.signButton, 'FIT');
    } else {
      await this.addDefaultButton(buttonFrame);
    }

    this.frame.appendChild(buttonFrame);
  }

  private async addDefaultButton(buttonFrame: FrameNode): Promise<void> {
    buttonFrame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.4, b: 0.3 })];
    buttonFrame.cornerRadius = 30;

    const buttonText = await NodeUtils.createText("立即签到", 18, 'Bold');
    buttonText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    buttonText.resize(200, buttonText.height);
    buttonText.textAlignHorizontal = "CENTER";
    buttonText.y = (60 - buttonText.height) / 2;

    buttonFrame.appendChild(buttonText);
  }
}

// ==================== 集卡模块创建器 ====================

async function createCollectCardsModule(content: CollectCardsContent): Promise<FrameNode> {
  const frame = NodeUtils.createFrame("集卡活动", CONSTANTS.MODULE_WIDTH, 400);
  
  // 设置背景
  if (content.bgImage) {
    await ImageNodeBuilder.setImageFill(frame, content.bgImage);
  } else {
    frame.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.9, b: 1 })];
  }

  let currentY = CONSTANTS.DEFAULT_SPACING;

  // 添加标题
  if (content.titleImage) {
    const titleFrame = NodeUtils.createFrame("集卡标题", 400, 80);
    titleFrame.x = (CONSTANTS.MODULE_WIDTH - 400) / 2;
    titleFrame.y = currentY;
    
    await ImageNodeBuilder.setImageFill(titleFrame, content.titleImage, 'FIT');
    
    frame.appendChild(titleFrame);
    currentY += 100;
  }

  // 创建卡片容器
  const cardsContainer = NodeUtils.createFrame("卡片容器", CONSTANTS.MODULE_WIDTH - 40, 200);
  cardsContainer.x = CONSTANTS.DEFAULT_SPACING;
  cardsContainer.y = currentY;
  cardsContainer.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 }, 0.9)];
  cardsContainer.cornerRadius = 10;
  
  NodeUtils.setupAutoLayout(cardsContainer, 'HORIZONTAL', 10, 10);

  // 添加卡片
  const cardsCount = content.cardsCount || 5;
  for (let i = 0; i < cardsCount; i++) {
    const cardFrame = await createCardItem(content, i + 1);
    cardsContainer.appendChild(cardFrame);
  }

  frame.appendChild(cardsContainer);
  currentY += 220;

  // 添加合成按钮
  if (content.combineButton) {
    const buttonFrame = NodeUtils.createFrame("合成按钮", 200, 60);
    buttonFrame.x = (CONSTANTS.MODULE_WIDTH - 200) / 2;
    buttonFrame.y = currentY;
    
    if (content.combineButton) {
      await ImageNodeBuilder.setImageFill(buttonFrame, content.combineButton, 'FIT');
    } else {
      buttonFrame.fills = [ColorUtils.createSolidFill({ r: 0.2, g: 0.6, b: 1 })];
      buttonFrame.cornerRadius = 30;
      
      const buttonText = await NodeUtils.createText("合成卡片", 18, 'Bold');
      buttonText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
      buttonText.resize(200, buttonText.height);
      buttonText.textAlignHorizontal = "CENTER";
      buttonText.y = (60 - buttonText.height) / 2;
      buttonFrame.appendChild(buttonText);
    }
    
    frame.appendChild(buttonFrame);
    currentY += 80;
  }

  // 调整frame高度
  frame.resize(CONSTANTS.MODULE_WIDTH, currentY);
  
  return frame;
}

// 创建单个卡片项
async function createCardItem(content: CollectCardsContent, cardNumber: number): Promise<FrameNode> {
  const cardSize = 100;
  const cardFrame = NodeUtils.createFrame(`卡片${cardNumber}`, cardSize, cardSize + 30);
  
  // 设置卡片背景
  if (content.cardBg) {
    await ImageNodeBuilder.setImageFill(cardFrame, content.cardBg, 'FILL');
  } else {
    cardFrame.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
  }

  // 根据卡片样式设置圆角
  switch (content.cardStyle) {
    case 'style1': // 方形
      cardFrame.cornerRadius = 0;
      break;
    case 'style2': // 圆角
      cardFrame.cornerRadius = 10;
      break;
    case 'style3': // 自定义（圆形）
      cardFrame.cornerRadius = cardSize / 2;
      break;
    default:
      cardFrame.cornerRadius = 5;
  }

  // 添加卡片编号
  const cardText = await NodeUtils.createText(`${cardNumber}`, 16, 'Bold');
  cardText.resize(cardSize, cardText.height);
  cardText.textAlignHorizontal = "CENTER";
  cardText.y = cardSize + 5;
  cardFrame.appendChild(cardText);

  return cardFrame;
}


// ==================== 活动内容模块创建器 ====================
// 注意：此模块用于创建活动详细内容，区别于页面底部的活动规则模块

async function createActivityContentModule(content: ActivityContentData): Promise<FrameNode> {
  console.log('开始创建活动内容模块（非页面底部规则），内容：', content);
  
  // 创建整个活动内容模块容器：1080宽，背景透明
  const frame = NodeUtils.createFrame("活动内容", 1080, 1000);
  frame.fills = []; // 背景填充为透明
  
  try {
    // 实例化活动内容模块构建器
    const builder = new ActivityContentBuilder(frame, content);
    // 调用构建器的build方法来构建活动内容模块
    await builder.build();
    
    console.log('活动内容模块（非页面底部规则）创建完成，最终高度：', frame.height);
    
    // 返回构建完成的框架
    return frame;
  } catch (error) {
    console.error('活动内容模块创建失败：', error);
    // 创建一个错误信息显示框
    const errorText = await NodeUtils.createText(`活动内容模块（非规则）创建失败: ${error instanceof Error ? error.message : '未知错误'}`, 16);
    errorText.x = 20;
    errorText.y = 20;
    errorText.fills = [ColorUtils.createSolidFill({ r: 1, g: 0, b: 0 })];
    frame.appendChild(errorText);
    frame.resize(1080, 100);
    return frame;
  }
}

class ActivityContentBuilder {
  private frame: FrameNode;
  private content: ActivityContentData;
  private currentY = 90; // 初始上边距90px

  constructor(frame: FrameNode, content: ActivityContentData) {
    this.frame = frame;
    this.content = content;
  }

  async build(): Promise<void> {
    console.log('开始构建活动内容模块（非页面底部规则模块）');
    
    try {
      // 设置自动布局
      this.setupAutoLayout();
      
      // 添加大标题
      await this.addMainTitle();
      
      // 添加小标题
      await this.addSubTitle();
      
      // 添加正文
      await this.addTextContent();
      
      // 添加插图
      await this.addImage();
      
      // 调整整个模块的高度
      this.adjustFrameHeight();
      
      console.log('活动内容模块（非规则）构建完成');
    } catch (error) {
      console.error('活动内容模块（非规则）构建过程中出错：', error);
      throw error;
    }
  }

  // 设置自动布局
  private setupAutoLayout(): void {
    NodeUtils.setupAutoLayout(this.frame, 'VERTICAL', 60, 90); // 垂直布局，间距60px，上下边距90px
  }

  // 添加大标题
  private async addMainTitle(): Promise<void> {
    // 如果没有大标题背景，则不创建大标题容器
    if (!this.content.mainTitleBg || !this.content.mainTitle) return;

    console.log('添加大标题...');

    // 创建大标题容器：1080宽，高度120
    const titleContainer = NodeUtils.createFrame("活动内容大标题容器", 1080, 120);
    titleContainer.fills = []; // 透明背景

    // 添加大标题背景图片节点
    try {
      const titleBgImage = await ImageNodeBuilder.insertImage(
        this.content.mainTitleBg,
        "大标题背景图片",
        1080,
        120
      );
    
      if (titleBgImage) {
        titleBgImage.x = 0;
        titleBgImage.y = 0;
        titleContainer.appendChild(titleBgImage);
      }
    } catch (error) {
      console.error('大标题背景图片创建失败:', error);
    }

    // 添加大标题文本节点
    const titleText = await NodeUtils.createText(this.content.mainTitle, 48, 'Bold');
    titleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    titleText.resize(1080, titleText.height);
    titleText.textAlignHorizontal = "CENTER";
    titleText.x = 0;
    titleText.y = (120 - titleText.height) / 2; // 垂直居中

    titleContainer.appendChild(titleText);
    this.frame.appendChild(titleContainer);
  }

  // 添加小标题
  private async addSubTitle(): Promise<void> {
    // 如果没有小标题背景，则不创建小标题容器
    if (!this.content.subTitleBg || !this.content.subTitle) return;

    console.log('添加小标题...');

    // 创建小标题容器：1080宽，高度100
    const subTitleContainer = NodeUtils.createFrame("活动内容小标题容器", 1080, 100);
    subTitleContainer.fills = []; // 透明背景

    // 添加小标题背景图片节点
    try {
      const subTitleBgImage = await ImageNodeBuilder.insertImage(
        this.content.subTitleBg,
        "小标题背景图片",
        1080,
        100
      );
    
      if (subTitleBgImage) {
        subTitleBgImage.x = 0;
        subTitleBgImage.y = 0;
        subTitleContainer.appendChild(subTitleBgImage);
      }
    } catch (error) {
      console.error('小标题背景图片创建失败:', error);
    }

    // 添加小标题文本节点 - 44大小，Medium
    const subTitleText = await NodeUtils.createText(this.content.subTitle, 44, 'Medium');
    subTitleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    subTitleText.resize(1080, subTitleText.height);
    subTitleText.textAlignHorizontal = "CENTER";
    subTitleText.x = 0;
    subTitleText.y = (100 - subTitleText.height) / 2; // 垂直居中

    subTitleContainer.appendChild(subTitleText);
    this.frame.appendChild(subTitleContainer);
  }

  // 添加正文
  private async addTextContent(): Promise<void> {
    // 如果没有输入内容，则不创建
    if (!this.content.text) return;

    console.log('添加正文...');

    // 直接插入正文文本节点，宽度为950，高度按实际输入内容
    const textNode = await NodeUtils.createText(this.content.text, 28, 'Regular');
    textNode.resize(950, textNode.height);
    textNode.textAlignHorizontal = "LEFT";
    textNode.lineHeight = { value: 40, unit: 'PIXELS' }; // 设置行高
    textNode.fills = [ColorUtils.createSolidFill({ r: 0, g: 0, b: 0 })]; // 黑色文字

    this.frame.appendChild(textNode);
  }

  // 添加插图
  private async addImage(): Promise<void> {
    // 如果没有上传图片，则不插入图片节点
    if (!this.content.image) return;

    console.log('添加插图...');

    try {
      // 直接插入插图图片节点至活动内容模块容器，宽度为950
      const imageNode = await ImageNodeBuilder.insertImage(
        this.content.image,
        "活动内容插图",
        950,
        600 // 默认高度，会根据实际图片调整
      );
      
      if (imageNode) {
        this.frame.appendChild(imageNode);
      }
    } catch (error) {
      console.error('插图创建失败:', error);
    }
  }

  // 调整整个模块的高度
  private adjustFrameHeight(): void {
    // 自动布局会自动调整高度，这里可以设置最小高度
    if (this.frame.height < 200) {
      this.frame.resize(1080, 200);
    }
  }
}

// ==================== 尾版模块创建器 ====================

async function createFooterModule(config: H5Config): Promise<FrameNode> {
  // 创建尾版框架
  const frame = NodeUtils.createFrame("尾版", CONSTANTS.H5_WIDTH, 480);
  
  // 创建FooterBuilder实例并构建尾版内容
  const builder = new FooterBuilder(frame, config);
  await builder.build();
  
  // 返回创建的尾版框架
  return frame;
}

// 尾版构建
class FooterBuilder {
  private frame: FrameNode;
  private config: H5Config;

  // 构造函数，初始化尾版框架和配置
  constructor(frame: FrameNode, config: H5Config) {
    this.frame = frame;
    this.config = config;
  }

  // 构建尾版内容
  async build(): Promise<void> {
    await this.setupBackground();
    await this.addContent();
  }

  // 设置尾版背景
  private async setupBackground(): Promise<void> {
    if (this.config.footerBg) {
      // 如果配置中有尾版背景图，则使用该图片
      await ImageNodeBuilder.setImageFill(this.frame, this.config.footerBg);
    } else {
      // 如果没有背景图，则使用透明背景
      this.frame.fills = [];
    }
  }

  // 添加尾版内容
  private async addContent(): Promise<void> {
    if (this.config.footerLogo) {
      await this.addLogo();
    }
  }

  // 添加Logo
  private async addLogo(): Promise<void> {
    // 检查是否有Logo图片数据
    if (!this.config.footerLogo) {
      console.log('跳过Logo创建：没有上传Logo图片');
      return;
    }

    console.log('开始创建Logo，使用ImageNodeBuilder');

    try {
      // 使用ImageNodeBuilder直接插入Logo图片节点
      const logoImage = await ImageNodeBuilder.insertImage(
        this.config.footerLogo, 
        "LOGO"
      );
      
      if (!logoImage) {
        console.log('Logo图片节点创建失败');
        return;
      }

      // 获取原始图片尺寸
      const originalWidth = logoImage.width;
      const originalHeight = logoImage.height;
      const aspectRatio = originalWidth / originalHeight;
      
      console.log(`Logo原始尺寸: ${originalWidth}x${originalHeight}, 宽高比: ${aspectRatio.toFixed(2)}`);
      
      let finalWidth: number;
      let finalHeight: number;
      
      // 按照要求计算最终尺寸
      // 1. 首先按宽度340px计算高度
      finalWidth = 340;
      finalHeight = finalWidth / aspectRatio;
      
      // 2. 如果高度超过250px，则改为按高度250px计算宽度
      if (finalHeight > 250) {
        finalHeight = 250;
        finalWidth = finalHeight * aspectRatio;
      }
      
      // 设置Logo图片尺寸
      logoImage.resize(finalWidth, finalHeight);
      
      // 设置位置：水平和垂直居中
      logoImage.x = (CONSTANTS.H5_WIDTH - finalWidth) / 2;
      logoImage.y = (this.frame.height - finalHeight) / 2;
      
      // 设置自动约束为缩放
      logoImage.constraints = {
        horizontal: "SCALE",
        vertical: "SCALE"
      };
      
      // 将Logo图片节点直接添加到尾版框架中
      this.frame.appendChild(logoImage);
      
      console.log(`Logo创建成功: 最终尺寸=${finalWidth.toFixed(1)}x${finalHeight.toFixed(1)}, 位置=(${logoImage.x.toFixed(1)}, ${logoImage.y.toFixed(1)})`);
      
    } catch (error) {
      console.error('Logo创建失败:', error);
    }
  }
}


