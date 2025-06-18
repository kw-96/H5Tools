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

/**
 * 渠道配置接口
 */
interface ChannelConfig {
  name: string;
  dimensions: {
    width: number;
    height: number;
  };
  brandColor: string;
  requirements: {
    maxFileSize: string;
    supportedFormats: string[];
    restrictions: string[];
  };
}

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
  channel?: string;             // 可选的渠道名称
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
    // 设置布局方向（水平或垂直）
    frame.layoutMode = direction;
    // 设置主轴尺寸模式为自动
    frame.primaryAxisSizingMode = "AUTO";
    // 设置交叉轴尺寸模式为固定
    frame.counterAxisSizingMode = "FIXED";
    // 设置子元素之间的间距
    frame.itemSpacing = spacing;
    // 设置上下左右内边距
    frame.paddingTop = padding;
    frame.paddingBottom = padding;
    frame.paddingLeft = padding;
    frame.paddingRight = padding;
    // 设置主轴对齐方式为起始
    frame.primaryAxisAlignItems = "MIN";
    // 设置交叉轴对齐方式为居中
    frame.counterAxisAlignItems = "CENTER";
  },


  /**
   * 安全地将子节点添加到父节点
   * @param parent 父节点
   * @param child 子节点
   * @param operationName 操作名称，用于日志记录
   * @returns 是否成功添加
   */
  safeAppendChild(
    parent: BaseNode & ChildrenMixin, 
    child: SceneNode, 
    operationName: string = '节点添加'
  ): boolean {
    try {
      // 检查父节点是否有效
      if (!parent) {
        console.warn(`${operationName}: 父节点无效`);
        return false;
      }

      // 检查子节点是否有效
      if (!child) {
        console.warn(`${operationName}: 子节点无效`);
        return false;
      }

      // 执行添加操作
      parent.appendChild(child);
      return true;

    } catch (error) {
      console.error(`${operationName}失败:`, error);
      return false;
    }
  },

  /**
   * 批量安全添加子节点
   * @param parent 父节点
   * @param children 子节点数组
   * @param operationName 操作名称
   * @returns 成功添加的节点数量
   */
  safeBatchAppendChildren(
    parent: BaseNode & ChildrenMixin,
    children: (SceneNode | null)[],
    operationName: string = '批量节点添加'
  ): number {
    let successCount = 0;
    
    children.forEach((child, index) => {
      if (child && this.safeAppendChild(parent, child, `${operationName}[${index}]`)) {
        successCount++;
      }
    });

    return successCount;
  },
  /**
   * 安全移除节点
   * @param node 要移除的节点
   * @param operationName 操作名称
   * @returns 是否成功移除
   */
  safeRemoveNode(node: SceneNode, operationName: string = '节点移除'): boolean {
    try {
      if (!node) {
        console.warn(`${operationName}: 节点无效`);
        return false;
      }

      if (!node.parent) {
        console.warn(`${operationName}: 节点没有父容器`);
        return false;
      }

      node.remove();
      return true;

    } catch (error) {
      console.error(`${operationName}失败:`, error);
      return false;
    }
  }
};

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

  // 创建大图片的兼容方法（当figma.createImage失败时使用）
  static async createLargeImage(
    bytes: Uint8Array, 
    width: number, 
    height: number, 
    name: string = "大图片"
  ): Promise<RectangleNode | null> {
    try {
      // 创建矩形节点
      const rect = figma.createRectangle();
      rect.name = name;
      rect.resize(width, height);
      
      // 尝试通过填充方式设置图片
      await this.fillTheSelection(rect, bytes);
      
      return rect;
    } catch (error) {
      console.error('大图片创建失败:', error);
      return null;
    }
  }

  // 填充选中节点的方法（适配原始代码逻辑）
  static async fillTheSelection(node: RectangleNode, bytes: Uint8Array): Promise<void> {
    try {
      // 尝试创建图片
      const image = await this.createImage(bytes);
      if (image) {
        node.fills = [{
          type: 'IMAGE',
          imageHash: image.hash,
          scaleMode: 'FILL'
        }];
      } else {
        // 如果创建图片失败，设置为灰色填充
        node.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
        console.warn('图片过大，使用默认填充');
      }
    } catch (error) {
      console.error('填充图片失败:', error);
      // 设置为灰色填充作为后备方案
      node.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
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
  ): Promise<RectangleNode | GroupNode | null> {
    try {
      let uint8Array: Uint8Array;
      let width: number;
      let height: number;

      // 处理不同的数据格式
      if (imageData && typeof imageData === 'object' && 'data' in imageData) {
        uint8Array = imageData.data;
        width = imageData.width;
        height = imageData.height;
      } else if (imageData instanceof Uint8Array) {
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

      // 检查是否超过Figma尺寸限制（4096x4096）
      const maxSize = 4096;
      const isOversized = width > maxSize || height > maxSize;
      
      if (isOversized) {
        return await this.handleOversizedImage(uint8Array, width, height, name);
      }

      // 尝试正常创建图片
      const image = await this.createImage(uint8Array);
      if (image) {
        const imageNode = figma.createRectangle();
        imageNode.name = name;
        imageNode.resize(width, height);
        imageNode.fills = [{
          type: 'IMAGE',
          imageHash: image.hash,
          scaleMode: 'FILL'
        }];
        return imageNode;
      } else {
        // 创建失败但尺寸不大，可能是其他原因
        console.warn(`图片创建失败: ${name}，创建占位矩形`);
        return this.createPlaceholderRect(width, height, name, '图片创建失败');
      }
    } catch (error) {
      console.error(`图片插入失败: ${name}`, error);
      return null;
    }
  }

  // 处理超大尺寸图片
  private static async handleOversizedImage(
    bytes: Uint8Array, 
    width: number, 
    height: number, 
    name: string
  ): Promise<GroupNode | RectangleNode | null> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn(`图片分割超时: ${name}`);
        resolve(this.createPlaceholderRect(width, height, name, '图片尺寸过大'));
      }, 15000); // 增加超时时间到15秒

      // 计算最优切割策略
      const maxSize = 4096;
      const sliceStrategy = this.calculateSliceStrategy(width, height, maxSize);
      
      // 向UI请求分割处理
      figma.ui.postMessage({
        type: 'slice-large-image',
        imageData: {
          bytes: Array.from(bytes),
          width,
          height,
          name,
          sliceStrategy
        }
      });

      // 监听分割结果
      const messageHandler = async (msg: any) => {
        if (msg.type === 'slice-image-response' && msg.imageName === name) {
          clearTimeout(timeout);

          if (msg.success && msg.slices && msg.slices.length > 0) {
            try {
              const group = await this.assembleSlicedImage(msg.slices, width, height, name, sliceStrategy);
              resolve(group);
            } catch (error) {
              console.error(`图片组装失败: ${name}`, error);
              resolve(this.createPlaceholderRect(width, height, name, '图片组装失败'));
            }
          } else {
            console.warn(`图片切片失败: ${name}`, msg.error || '未知错误');
            resolve(this.createPlaceholderRect(width, height, name, '图片切片失败'));
          }
          
          // 移除消息监听器
          figma.ui.off('message', messageHandler);
        }
      };

      figma.ui.on('message', messageHandler);
      
      // 清理监听器（防止内存泄漏）
      setTimeout(() => {
        figma.ui.off('message', messageHandler);
      }, 16000);
    });
  }

  // 计算切片策略
  private static calculateSliceStrategy(width: number, height: number, maxSize: number) {
    const strategy = {
      direction: 'none' as 'horizontal' | 'vertical' | 'both' | 'none',
      sliceWidth: width,
      sliceHeight: height,
      slicesCount: 1,
      description: ''
    };

    const widthExceeds = width > maxSize;
    const heightExceeds = height > maxSize;

    if (!widthExceeds && !heightExceeds) {
      // 不需要切割
      strategy.description = '图片尺寸正常，无需切割';
      return strategy;
    }

    if (widthExceeds && !heightExceeds) {
      // 只有宽度超限：垂直切割（保持高度）
      strategy.direction = 'vertical';
      strategy.sliceWidth = Math.floor(maxSize * 0.9); // 留10%安全边距
      strategy.sliceHeight = height;
      strategy.slicesCount = Math.ceil(width / strategy.sliceWidth);
      strategy.description = `宽度超限，垂直切割为${strategy.slicesCount}片，每片${strategy.sliceWidth}×${height}`;
    } else if (!widthExceeds && heightExceeds) {
      // 只有高度超限：水平切割（保持宽度）
      strategy.direction = 'horizontal';
      strategy.sliceWidth = width;
      strategy.sliceHeight = Math.floor(maxSize * 0.9); // 留10%安全边距
      strategy.slicesCount = Math.ceil(height / strategy.sliceHeight);
      strategy.description = `高度超限，水平切割为${strategy.slicesCount}片，每片${width}×${strategy.sliceHeight}`;
    } else {
      // 宽度和高度都超限：网格切割
      strategy.direction = 'both';
      strategy.sliceWidth = Math.floor(maxSize * 0.9);
      strategy.sliceHeight = Math.floor(maxSize * 0.9);
      const horizontalSlices = Math.ceil(width / strategy.sliceWidth);
      const verticalSlices = Math.ceil(height / strategy.sliceHeight);
      strategy.slicesCount = horizontalSlices * verticalSlices;
      strategy.description = `宽高都超限，网格切割为${horizontalSlices}×${verticalSlices}=${strategy.slicesCount}片`;
    }

    return strategy;
  }

  // 组装切片后的图片
  private static async assembleSlicedImage(
    slices: any[], 
    totalWidth: number, 
    totalHeight: number, 
    name: string,
    strategy: any
  ): Promise<GroupNode | null> {
    try {
      figma.notify(`正在组装图片: ${name} (${strategy.description})`, { timeout: 2000 });

      const sliceNodes: RectangleNode[] = [];
      
      // 创建每个图片切片
      for (let i = 0; i < slices.length; i++) {
        const slice = slices[i];
        const sliceBytes = new Uint8Array(slice.bytes);
        
        try {
          const image = await this.createImage(sliceBytes);
          
          if (image) {
            const sliceNode = figma.createRectangle();
            sliceNode.name = `${name}_slice_${i + 1}`;
            sliceNode.resize(slice.width, slice.height);
            // 设置相对位置（相对于组的原点）
            sliceNode.x = slice.x;
            sliceNode.y = slice.y;
            sliceNode.fills = [{
              type: 'IMAGE',
              imageHash: image.hash,
              scaleMode: 'FILL'
            }];
            
            // 不立即添加到页面，先收集所有节点
            sliceNodes.push(sliceNode);
            
          } else {
            console.warn(`切片 ${i + 1} 图片创建失败，跳过此切片`);
          }
        } catch (sliceError) {
          console.error(`切片 ${i + 1} 处理失败:`, sliceError);
        }
      }

      // 创建分组
      if (sliceNodes.length > 0) {
        try {
          // 先将所有切片批量添加到页面，然后立即分组
          const successCount = NodeUtils.safeBatchAppendChildren(
            figma.currentPage, 
            sliceNodes, 
            '图片切片批量添加到页面'
          );
          
          if (successCount !== sliceNodes.length) {
            console.warn(`部分切片添加失败，成功：${successCount}/${sliceNodes.length}`);
          }
          
          // 立即创建分组，避免节点被其他操作影响
          const group = figma.group(sliceNodes, figma.currentPage);
          group.name = name;
          
          // 重新定位组到原点
          group.x = 0;
          group.y = 0;
          
          figma.notify(`图片组装完成: ${name}`, { timeout: 1000 });
          
          return group;
          
        } catch (groupError) {
          console.error('创建分组失败:', groupError);
          // 清理已创建的节点
          sliceNodes.forEach((node, index) => {
            NodeUtils.safeRemoveNode(node, `清理图片切片${index + 1}`);
          });
          throw groupError;
        }
      } else {
        throw new Error('没有成功创建任何切片');
      }      
    } catch (error) {
      console.error('图片组装失败:', error);
      throw error;
    }
  }

  // 创建占位矩形
  private static createPlaceholderRect(width: number, height: number, name: string, reason: string = '未知原因'): RectangleNode {
    const rect = figma.createRectangle();
    rect.name = `${name} (占位)`;
    rect.resize(width, height);
    
    // 根据原因使用不同颜色
    const fillColor = reason.includes('尺寸过大') 
      ? { r: 1, g: 0.9, b: 0.8 } // 橙色
      : { r: 0.95, g: 0.95, b: 0.95 }; // 灰色
    
    rect.fills = [ColorUtils.createSolidFill(fillColor)];
    
    // 添加提示文本
    try {
      FontManager.loadSingle({ family: "Inter", style: "Regular" }).then(() => {
        const label = figma.createText();
        label.fontName = { family: "Inter", style: "Regular" };
        label.characters = `${name}\n${width}×${height}\n${reason}`;
        label.fontSize = Math.min(Math.max(12, width / 50), 20);
        label.fills = [ColorUtils.createSolidFill({ r: 0.4, g: 0.4, b: 0.4 })];
        label.textAlignHorizontal = "CENTER";
        label.textAlignVertical = "CENTER";
        
        if (rect.parent) {
          label.x = rect.x + (width - label.width) / 2;
          label.y = rect.y + (height - label.height) / 2;
          NodeUtils.safeAppendChild(rect.parent, label, '占位矩形文本添加');
        }
      }).catch(() => {
        console.warn('占位文本创建失败');
      });
    } catch (error) {
      console.warn('占位文本添加失败:', error);
    }
    
    return rect;
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
        // 背景图片完全填充容器
        backgroundNode.x = 0;
        backgroundNode.y = 0;
        backgroundNode.resize(width, height);
        NodeUtils.safeAppendChild(container, backgroundNode, '标题背景图片添加');
      }
    } catch (error) {
      console.error('标题背景图片创建失败:', error);
      // 如果图片创建失败，使用默认背景色
      container.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 0.95 })];
    }
  }

  // 添加标题文本（只有当标题不为空时才添加）
  if (title && title.trim() !== '') {
    const titleText = await NodeUtils.createText(title, fontSize, fontWeight);
    titleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })]; // 设置文字为白色
    titleText.resize(width, titleText.height);
    titleText.textAlignHorizontal = "CENTER";
    titleText.y = (height - titleText.height) / 2;
    
    NodeUtils.safeAppendChild(container, titleText, '标题文本添加');
  }
  return container;
}


// ==================== 羽化蒙版工具函数 ====================

/**
 * 羽化蒙版工具类
 * 用于创建羽化效果，解决模块之间的背景衔接问题
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class FeatherMaskUtils {
  
  /**
   * 为节点创建羽化蒙版
   * @param node 需要添加蒙版的节点
   * @param parent 蒙版的父容器（可选，默认为节点的父容器）
   * @returns 返回创建的羽化蒙版组
   */
  static createFeatherMask(
    node: FrameNode | RectangleNode, 
    parent?: BaseNode & ChildrenMixin
  ): GroupNode {
    try {
      const targetParent = parent || node.parent || figma.currentPage;
      
      // 1. 计算模糊参数
      const blurRadius = node.width * 0.1;
      
      // 2. 创建蒙版矩形
      const maskRect = figma.createRectangle();
      maskRect.name = "蒙版";
      maskRect.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
      
      // 3. 计算并设置矩形大小
      const rectWidth = node.width + blurRadius * 2 + 25;
      const rectHeight = node.height - blurRadius * 2;
      maskRect.resize(rectWidth, rectHeight);
      
      // 4. 将矩形添加到父容器并创建组
      NodeUtils.safeAppendChild(targetParent, maskRect, '羽化蒙版矩形添加');
      const featherGroup = figma.group([maskRect], targetParent);
      featherGroup.name = "羽化蒙版";
      
      // 5. 设置图层模糊效果
      try {
        featherGroup.effects = [{
          type: "LAYER_BLUR",
          radius: blurRadius,
          visible: true
        } as any];
      } catch (effectError) {
        console.warn('设置模糊效果失败，跳过此步骤:', effectError);
      }
      
      // 6. 调整蒙版矩形位置（相对于组内坐标）
      maskRect.x = -(rectWidth - node.width) / 2;
      maskRect.y = -(rectHeight - node.height) / 2;
      
      // 7. 设置为剪切蒙版
      featherGroup.isMask = true;
            
      return featherGroup;
      
    } catch (error) {
      console.error('创建羽化蒙版失败:', error);
      throw error;
    }
  }
  
  /**
   * 为节点添加羽化蒙版并重新组织结构
   * @param node 需要添加蒙版的节点
   * @returns 返回包含羽化效果的容器组
   */
  static addFeatherMaskToNode(node: FrameNode | RectangleNode): GroupNode | null {
    try {
      // 保存原始信息
      const originalParent = node.parent;
      const originalX = node.x;
      const originalY = node.y;
      const originalName = node.name;
      
      if (!originalParent) {
        console.warn('节点没有父容器，无法添加羽化蒙版');
        return null;
      }
      
      // 获取节点在父容器中的索引
      const nodeIndex = originalParent.children.indexOf(node);
      
      // 创建羽化蒙版（在当前页面临时创建）
      const featherMask = this.createFeatherMask(node, figma.currentPage);
      
      // 从原始父容器中移除节点
      node.remove();
      
      // 将节点和羽化蒙版添加到原始父容器
      originalParent.insertChild(nodeIndex, node);
      originalParent.insertChild(nodeIndex + 1, featherMask);
      
      // 创建容器组（羽化蒙版在前，被蒙版节点在后，确保正确的层级关系）
      const containerGroup = figma.group([featherMask, node], originalParent);
      containerGroup.name = originalName;
      containerGroup.x = originalX;
      containerGroup.y = originalY;
      
      // 重置组内元素的相对位置
      node.x = 0;
      node.y = 0;
      featherMask.x = 0;
      featherMask.y = 0;
            
      return containerGroup;
      
    } catch (error) {
      console.error('添加羽化蒙版到节点失败:', error);
      return null;
    }
  }
  
  /**
   * 创建自定义羽化蒙版
   * @param node 需要添加蒙版的节点
   * @param parent 蒙版的父容器
   * @param blurRadius 自定义模糊半径（可选）
   * @param maskHeight 自定义蒙版高度（可选）
   * @param offsetY 蒙版Y轴偏移量（可选）
   * @returns 返回创建的羽化蒙版组
   */
  static createCustomFeatherMask(
    node: FrameNode | RectangleNode,
    parent: BaseNode & ChildrenMixin,
    blurRadius?: number,
    maskHeight?: number,
    offsetY?: number
  ): GroupNode {
    try {
      // 使用自定义参数或默认计算
      const radius = blurRadius || node.width * 0.1;
      const rectWidth = node.width + radius * 2 + 25;
      const rectHeight = maskHeight || (node.height - radius * 2);
      
      // 创建蒙版矩形
      const maskRect = figma.createRectangle();
      maskRect.name = "蒙版";
      maskRect.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
      maskRect.resize(rectWidth, rectHeight);
      
      // 添加到父容器并创建组
      NodeUtils.safeAppendChild(parent, maskRect, '自定义羽化蒙版矩形添加');
      const featherGroup = figma.group([maskRect], parent);
      featherGroup.name = "羽化蒙版";
      
      // 设置模糊效果
      try {
        featherGroup.effects = [{
          type: "LAYER_BLUR",
          radius: radius,
          visible: true
        } as any];
      } catch (effectError) {
        console.warn('设置模糊效果失败:', effectError);
      }
      
      // 设置位置：1. 矩形要与头图图片节点水平居中
      maskRect.x = 0; // 水平居中，相对于组的中心位置
      maskRect.y = offsetY || (-(rectHeight - node.height) / 2);
      
      // 设置为剪切蒙版
      featherGroup.isMask = true;
            
      return featherGroup;
      
    } catch (error) {
      console.error('创建自定义羽化蒙版失败:', error);
      throw error;
    }
  }
  
  /**
   * 简化版本：为节点添加羽化蒙版（保持接口兼容性）
   * @param node 需要添加蒙版的节点
   */
  static addFeatherMaskToNodeSimple(node: FrameNode | RectangleNode): void {
    this.addFeatherMaskToNode(node);
  }
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

// ==================== 渠道图片存储 ====================

interface ChannelImageData {
  data: number[];
  width: number;
  height: number;
  name: string;
  type: string;
}

interface ChannelImages {
  [channel: string]: {
    eggBreaking?: ChannelImageData;
    footerStyle?: ChannelImageData;
  };
}

// 全局渠道图片存储
const channelImages: ChannelImages = {};

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
  },

  // 新增主题相关处理器  
  async handleGetTheme(): Promise<void> {
    try {
      const theme = await figma.clientStorage.getAsync('ui-theme') || 'light';
      figma.ui.postMessage({
        type: 'theme-loaded',
        theme: theme
      });
    } catch (error) {
      console.error('获取主题失败:', error);
      figma.ui.postMessage({
        type: 'theme-loaded',
        theme: 'light'
      });
    }
  },

  async handleSaveTheme(theme: string): Promise<void> {
    try {
      await figma.clientStorage.setAsync('ui-theme', theme);
      console.log('主题已保存:', theme);
    } catch (error) {
      console.error('保存主题失败:', error);
    }
  },

  async handleChannelImageUpload(data: { channel: string; imageType: string; imageData: ChannelImageData }): Promise<void> {
    try {
      const { channel, imageType, imageData } = data;
      
      // 初始化渠道对象（如果不存在）
      if (!channelImages[channel]) {
        channelImages[channel] = {};
      }
      
      // 存储图片数据
      channelImages[channel][imageType as keyof ChannelImages[string]] = imageData;
      
      // 保存到 Figma 客户端存储
      await figma.clientStorage.setAsync(`channel-images-${channel}`, JSON.stringify(channelImages[channel]));
      
      console.log(`${channel} 渠道 ${imageType} 图片已保存:`, {
        name: imageData.name,
        size: `${imageData.width}x${imageData.height}`,
        dataSize: imageData.data.length
      });
      
      figma.ui.postMessage({
        type: 'channel-image-saved',
        channel: channel,
        imageType: imageType,
        message: '图片已保存'
      });
      
    } catch (error) {
      console.error('保存渠道图片失败:', error);
      figma.ui.postMessage({
        type: 'channel-image-error',
        message: `保存图片失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  },

  async loadChannelImages(): Promise<void> {
    try {
      const channels = ['oppo', 'vivo', 'huawei', 'xiaomi'];
      
      for (const channel of channels) {
        const stored = await figma.clientStorage.getAsync(`channel-images-${channel}`);
        if (stored) {
          channelImages[channel] = JSON.parse(stored);
          console.log(`已加载 ${channel} 渠道图片数据`);
        }
      }
      
    } catch (error) {
      console.error('加载渠道图片失败:', error);
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
      
      case 'get-theme':
        await MessageHandlers.handleGetTheme();
        break;
      
      case 'save-theme':
        await MessageHandlers.handleSaveTheme((msg as any).theme);
        break;
      
      case 'close-plugin':
        figma.closePlugin();
        break;

      case 'reset-complete':
        // 发送确认消息回UI
        figma.ui.postMessage({
          type: 'reset-acknowledged',
          message: '插件已确认重置完成'
        });
        break;
        
      case 'ping':
        // 回复pong消息
        figma.ui.postMessage({
          type: 'pong',
          message: '插件连接正常'
        });
        break;
      
      case 'slice-image-response':
        // 图片切片响应会由 handleOversizedImage 中的监听器处理
        break;
      
      case 'generate':
        try {
          await MessageHandlers.handleCreatePrototype(msg.config!);
          figma.ui.postMessage({ type: 'generate-complete' });
        } catch (error) {
          console.error('生成失败:', error);
          figma.ui.postMessage({ 
            type: 'generate-error', 
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
        break;
      
      case 'generate-channel':
        try {
          const channel = msg.channel as string;
          await generateChannelVersion(channel);
          figma.ui.postMessage({ 
            type: 'channel-generate-complete',
            channel: channel
          });
        } catch (error) {
          const channel = msg.channel as string;
          console.error(`生成${channel}渠道版本失败:`, error);
          figma.ui.postMessage({ 
            type: 'channel-generate-error', 
            channel: channel,
            error: error instanceof Error ? error.message : '未知错误'
          });
        }
        break;
      
      case 'channel-image-uploaded':
        await MessageHandlers.handleChannelImageUpload(msg as any);
        break;
      
      default:
        console.warn('未知消息类型:', msg.type);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    
    // 发送错误消息到UI，确保UI能重置按钮状态
    figma.ui.postMessage({
      type: 'creation-error',
      message: errorMessage
    });
    
    figma.notify(errorMessage, { timeout: 5000 });
  }
};

// ==================== H5原型构建器 ====================

/**
 * H5原型构建器类
 * 负责创建和管理H5原型的整体结构
 */
class H5PrototypeBuilder {
  // H5配置对象
  private config: H5Config;
  // 外层画板，用于包含整个H5内容
  private outerFrame!: FrameNode;
  // H5主画板，用于放置所有H5模块
  private h5Frame!: FrameNode;

  /**
   * 构造函数
   * @param config H5配置对象
   */
  constructor(config: H5Config) {
    this.config = config;
  }

  /**
   * 构建H5原型
   * 这个方法执行整个H5原型的创建过程
   * @returns Promise<FrameNode> 返回创建完成的外层画板
   */
  async build(): Promise<FrameNode> {
    // 加载所有必要的字体
    await FontManager.loadAll();
    
    // 创建基础画板结构
    this.createBaseFrames();
    // 设置背景（可能是图片或颜色）
    await this.setupBackground();
    // 添加所有模块到H5画板中
    await this.addModules();
    // 完成布局的最终调整
    this.finalizeLayout();
    
    // 返回完成的外层画板
    return this.outerFrame;
  }

  private createBaseFrames(): void {
    // 1. H5原型容器不需要应用自动布局，只是一个画板，并设置内容裁剪
    this.outerFrame = NodeUtils.createFrame('H5原型', CONSTANTS.H5_WIDTH, 100);
    this.outerFrame.layoutMode = "NONE"; // 不使用自动布局
    this.outerFrame.clipsContent = true; // 设置内容裁剪
    
    // 2. 创建自适应模块容器，但先不添加到H5原型容器中
    this.h5Frame = NodeUtils.createFrame('自适应模块', CONSTANTS.H5_WIDTH, 100);
    this.h5Frame.fills = [];
    
    // 设置自适应模块容器的自动布局
    NodeUtils.setupAutoLayout(this.h5Frame, 'VERTICAL', 0, 0);
    this.h5Frame.clipsContent = true; // 设置内容裁剪
    this.h5Frame.layoutWrap = "NO_WRAP"; // 设置布局不换行，确保所有子元素在一列中垂直排列
  }

  /**
   * 设置背景
   * 根据配置设置页面背景，可以是图片或颜色
   */
  private async setupBackground(): Promise<void> {
    // 3. 设置背景时的判定逻辑
    const isDefaultWhite = this.config.pageBgColor === "#FFFFFF" || this.config.pageBgColor === "#ffffff";
    
    // 当pageBgColor不为白色时，设置H5原型容器填充颜色为pageBgColor，否则填充为透明
    if (!isDefaultWhite) {
      const colorFill = ColorUtils.createSolidFill(ColorUtils.hexToRgb(this.config.pageBgColor));
      this.outerFrame.fills = [colorFill];
    } else {
      // 白色时设置为透明
      this.outerFrame.fills = [];
    }
    
    // 当bgImageData存在时，兼容pageBgColor的设置判定
    if (this.config.pageBgImage) {
      const bgImageData = Utils.extractUint8Array(this.config.pageBgImage);
      if (bgImageData) {
        // 直接将bgImageData图片节点插入H5原型容器中
        const bgImageNode = await ImageNodeBuilder.insertImage(
          this.config.pageBgImage,
          "页面背景图片"
        );
        
        if (bgImageNode) {
          // 水平居中容器，顶部对齐容器顶部
          bgImageNode.x = (this.outerFrame.width - bgImageNode.width) / 2;
          bgImageNode.y = 0;
          
          // 设置约束：水平居中，顶部对齐
          // 类型检查：只有 RectangleNode 有 constraints 属性
          if ('constraints' in bgImageNode) {
            bgImageNode.constraints = {
              horizontal: "CENTER",
              vertical: "MIN"
            };
          }
          
          // 先插入背景图片节点
          NodeUtils.safeAppendChild(this.outerFrame, bgImageNode, '页面背景图片添加');
        }
      }
    }
    
    // 设置完背景之后，将自适应模块容器添加为H5原型容器的子元素
    NodeUtils.safeAppendChild(this.outerFrame, this.h5Frame, 'H5自适应模块容器添加');
  }

  

  /**
   * 添加模块
   * 创建所有模块并将它们添加到H5画板中
   */
  private async addModules(): Promise<void> {
    // 创建所有模块
    const modules = await this.createAllModules();
    
    // 批量安全添加模块到H5画板中
    NodeUtils.safeBatchAppendChildren(this.h5Frame, modules, 'H5模块批量添加');
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
      this.createFooterModuleIfNeeded()              // 创建底部模块
    ]);
  }

  private async createHeaderModuleIfNeeded(): Promise<FrameNode | null> {
    if (this.config.headerImage || this.config.titleUpload) {
      const module = await createHeaderModule(this.config.headerImage, this.config.titleUpload);
      if (module) {
        // 移除不支持的 layoutAlign 属性
        return module;
      }
    }
    return null;
  }

  private async createGameInfoModuleIfNeeded(): Promise<FrameNode | null> {
    if (this.config.gameName || this.config.gameDesc || this.config.gameIcon) {
      const module = await createGameInfoModule(this.config);
      // 移除不支持的 layoutAlign 属性
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
    // 检查是否有任何活动规则相关内容
    const hasRulesTitle = this.config.rulesTitle && this.config.rulesTitle.trim() !== '';
    const hasRulesBgImage = this.config.rulesBgImage !== null && this.config.rulesBgImage !== undefined;
    const hasRulesContent = this.config.rulesContent && this.config.rulesContent.trim() !== '';
    
    // 只有当标题文案、标题背景图或活动规则内容任一存在时才创建模块
    if (hasRulesTitle || hasRulesBgImage || hasRulesContent) {
      const module = await createRulesModule(this.config);
      // 移除不支持的 layoutAlign 属性
      return module;
    }
    
    return null;
  }

  /**
   * 创建底部模块（如果需要）
   * 如果配置中包含底部logo或背景，则创建底部模块
   * @returns Promise<FrameNode | null> 返回创建的底部模块或null
   */
  private async createFooterModuleIfNeeded(): Promise<FrameNode | null> {
    // 检查是否需要创建底部模块
    if (this.config.footerLogo || this.config.footerBg) {
      // 异步创建底部模块
      const module = await createFooterModule(this.config);
      if (module) {
        // 返回创建的模块
        return module;
      }
    }
    // 如果不需要创建底部模块，返回null
    return null;
  }

  private finalizeLayout(): void {
    // 2. 调整H5原型容器高度为自适应模块容器高度
    this.outerFrame.resize(CONSTANTS.H5_WIDTH, this.h5Frame.height);
    
    // 确保自适应模块容器在最上层显示（使用insertChild方法而不是remove+appendChild）
    try {
      if (this.h5Frame && this.h5Frame.parent === this.outerFrame) {
        // 获取当前子节点数量，将h5Frame移动到最后位置（最上层）
        const childrenCount = this.outerFrame.children.length;
        if (childrenCount > 1) {
          // 使用insertChild将节点移动到最后位置
          this.outerFrame.insertChild(childrenCount - 1, this.h5Frame);
        }
      }
    } catch (reorderError) {
      console.error('重新排列H5模块容器失败:', reorderError);
    }
    
    // 添加到当前页面并居中显示
    NodeUtils.safeAppendChild(figma.currentPage, this.outerFrame, 'H5原型添加到当前页面');
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


// ==================== 模块创建器 ====================

// 头图模块创建器
async function createHeaderModule(
  headerImage: ImageInfo | null, 
  titleUpload: ImageInfo | null
): Promise<FrameNode | null> {
  // 如果只有标题图片没有头图，则跳过头图模块的创建
  if (!headerImage && titleUpload) {
    return null;
  }

  // 如果既没有头图也没有标题图片，也跳过创建
  if (!headerImage && !titleUpload) {
    return null;
  }

  // 固定尺寸为1080x1080px
  const frame = NodeUtils.createFrame("头图", 1080, 1080);
  frame.clipsContent = true; // 打开裁剪内容
  frame.fills = []; // 设置画板填充为透明
  
  // 手动定位
  frame.layoutMode = "NONE";

  let currentY = 0; // 用于垂直排列
  let headerNode: RectangleNode | null = null;
  let titleNode: RectangleNode | null = null;

  // 添加头图
  if (headerImage) {
    try {
      // 直接插入头图，不调整尺寸
      const headerNodeResult = await ImageNodeBuilder.insertImage(headerImage, "头图图片");
      headerNode = headerNodeResult && 'strokeCap' in headerNodeResult ? headerNodeResult : null;
      
      if (headerNode) {
        NodeUtils.safeAppendChild(frame, headerNode, '头图图片添加到画板');
        
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

  // 调整头图容器高度
  adjustHeaderFrameHeight(frame, headerNode, titleNode);

  // 1. 在完成头图模块的创建后，对头图图片节点进行添加羽化蒙版
  if (headerNode) {
    try {
      await addFeatherMaskToHeaderImage(headerNode, frame);
    } catch (error) {
      console.error('头图图片添加羽化蒙版失败:', error);
    }
  }

  // 添加标题图片
  if (titleUpload) {
    try {
      // 直接插入标题图片，不调整尺寸
      const titleNodeResult = await ImageNodeBuilder.insertImage(titleUpload, "标题图片");
      titleNode = titleNodeResult && 'strokeCap' in titleNodeResult ? titleNodeResult : null;
      
      if (titleNode) {
        NodeUtils.safeAppendChild(frame, titleNode, '标题图片添加到画板');
        
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

// 调整头图容器高度的辅助函数
function adjustHeaderFrameHeight(
  frame: FrameNode, 
  headerNode: RectangleNode | null, 
  titleNode: RectangleNode | null
): void {
  // 如果只有头图，没有标题图片
  if (headerNode && !titleNode) {
    // 无论头图高度大于或小于1080px，都将容器高度调整为头图高度
    frame.resize(1080, headerNode.height);
  }
  // 如果既有头图又有标题图片
  else if (headerNode && titleNode) {
    // 先将容器高度调整为头图高度
    frame.resize(1080, headerNode.height);
    
    // 重新设置标题图片位置：底部对齐调整后的容器
    titleNode.y = headerNode.height - titleNode.height; // 底部对齐头图高度的容器
    titleNode.constraints = {
      horizontal: "CENTER",
      vertical: "MAX" // 保持底部对齐
    };
  }
  // 注意：不再处理只有标题图片没有头图的情况，因为这种情况下不会创建头图模块
}

// 为头图图片添加羽化蒙版的专用函数
async function addFeatherMaskToHeaderImage(
  headerNode: RectangleNode, 
  frame: FrameNode
): Promise<void> {
  try {
    
    // 检查节点是否仍然存在且有效
    if (!headerNode || !headerNode.parent) {
      console.warn('头图节点不存在或已被删除，跳过羽化蒙版处理');
      return;
    }
    
    // 保存原始信息
    const originalX = headerNode.x;
    const originalY = headerNode.y;
    const originalConstraints = headerNode.constraints;
    const originalWidth = headerNode.width;
    const originalHeight = headerNode.height;
    
    // 1. 复制头图图片节点
    const headerNodeCopy = headerNode.clone();
    headerNodeCopy.name = "头图图片";
    
    // 2. 计算羽化蒙版参数
    const blurRadius = originalWidth * 0.1;
    const rectHeight = originalHeight;
    const adjustedRectHeight = rectHeight - blurRadius;
    const rectWidth = originalWidth + blurRadius * 2 + 25;
    
    // 3. 创建蒙版矩形
    const maskRect = figma.createRectangle();
    maskRect.name = "蒙版";
    maskRect.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    maskRect.resize(rectWidth, adjustedRectHeight);
    
    // 4. 将蒙版矩形添加到frame
    NodeUtils.safeAppendChild(frame, maskRect, '羽化蒙版矩形添加到frame');
    
    // 等待一个微任务确保节点稳定
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // 5. 将蒙版矩形创建羽化蒙版组
    let featherMaskGroup: GroupNode;
    try {
      featherMaskGroup = figma.group([maskRect], frame);
      featherMaskGroup.name = "羽化蒙版";
    } catch (groupError) {
      console.error('创建羽化蒙版组失败:', groupError);
      return;
    }
    
    // 6. 设置模糊效果给羽化蒙版组
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blurEffect = {
        type: "LAYER_BLUR" as const,
        radius: blurRadius,
        visible: true as const
      } as any;
      if (featherMaskGroup.effects !== undefined) {
        featherMaskGroup.effects = [blurEffect];
      }
    } catch (effectError) {
      console.warn('设置模糊效果失败:', effectError);
    }
    
    // 7. 设置羽化蒙版组为剪切蒙版
    try {
      if ('isMask' in featherMaskGroup) {
        featherMaskGroup.isMask = true;
      }
    } catch (maskError) {
      console.warn('设置剪切蒙版失败:', maskError);
    }
    
    // 8. 创建包含羽化蒙版组和头图节点的组，命名为头图
    let headerGroup: GroupNode;
    try {
      headerGroup = figma.group([featherMaskGroup, headerNode], frame);
      headerGroup.name = "头图";
    } catch (groupError) {
      console.error('创建头图组失败:', groupError);
      return;
    }
    
    // 9. 调整位置：蒙版矩形，羽化蒙版组，头图节点，头图组
    
    // 蒙版矩形在羽化蒙版组内的位置
    maskRect.x = 0;
    maskRect.y = 0;
    
    // 羽化蒙版组在头图组内的位置
    featherMaskGroup.x = -(rectWidth - originalWidth) / 2; // 水平居中
    featherMaskGroup.y = -blurRadius; // 羽化效果不影响顶部
    
    // 头图节点在头图组内的位置（相对于组）
    headerNode.x = 0;
    headerNode.y = 0;
    headerNode.constraints = originalConstraints;
    
    // 头图组的位置
    headerGroup.x = originalX;
    headerGroup.y = originalY;
    
    // 10. 删除原来的头图图片节点，将复制的头图图片节点放入头图组中
    try {
      if (headerNode && headerNode.parent) {
        headerNode.remove();
      }
    } catch (removeError) {
      console.warn('删除原头图节点失败:', removeError);
    }
    
    // 将复制的头图图片节点放入头图组中
    try {
      NodeUtils.safeAppendChild(headerGroup, headerNodeCopy, '复制的头图图片节点添加到头图组');
      // 设置复制节点在组内的位置和约束
      headerNodeCopy.x = 0;
      headerNodeCopy.y = 0;
      headerNodeCopy.constraints = originalConstraints;
    } catch (addError) {
      console.error('将复制的头图图片节点添加到头图组失败:', addError);
    }
    
  } catch (error) {
    console.error('为头图图片添加羽化蒙版失败:', error);
    // 不再抛出错误，而是记录并继续执行
  }
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
    if ('cornerRadius' in iconImageNode) {
      iconImageNode.cornerRadius = 40;
    }
    // 设置图标边框样式
    if ('strokes' in iconImageNode) {
      iconImageNode.strokes = [{
        type: 'SOLID',
        color: { r: 1, g: 1, b: 1 },
        opacity: 0.2
      }];
    }
    // 设置边框宽度
    if ('strokeWeight' in iconImageNode) {
      iconImageNode.strokeWeight = 1;
    }
    // 设置图标水平位置
    iconImageNode.x = 70;
    // 设置图标垂直居中
    iconImageNode.y = (this.frame.height - 190) / 2;
    
    // 将图标添加到框架中
    NodeUtils.safeAppendChild(this.frame, iconImageNode, '游戏图标添加');
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
      NodeUtils.safeAppendChild(this.frame, nameText, '游戏名称文本添加');
    }

    // 添加游戏描述
    if (this.config.gameDesc) {
      // 创建游戏描述文本节点
      const descText = await NodeUtils.createText(this.config.gameDesc, 32, 'Regular');
      // 设置文本位置
      descText.x = 285;
      descText.y = 122;
      // 1. 游戏描述文本节点宽度为300px
      descText.resize(300, descText.height);
      // 2. 布局设为自动高度
      descText.textAutoResize = "HEIGHT";
      // 设置文本左对齐
      descText.textAlignHorizontal = "LEFT";
      // 设置文本颜色
      descText.fills = [ColorUtils.createSolidFill(textColor)];
      // 将文本节点添加到框架中
      NodeUtils.safeAppendChild(this.frame, descText, '游戏描述文本添加');
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
          NodeUtils.safeAppendChild(buttonFrame, buttonBgImage, '图标按钮底图添加');
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
      const textColor = this.config.iconButtonTextColor 
        ? ColorUtils.hexToRgb(this.config.iconButtonTextColor)
        : { r: 1, g: 1, b: 1 };

      try {
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
        NodeUtils.safeAppendChild(buttonFrame, textNode, '图标按钮文本添加');
      } catch (textError) {
        console.error('创建按钮文本失败:', textError);
      }
    }

    // 将按钮框架添加到主框架中
    NodeUtils.safeAppendChild(this.frame, buttonFrame, '图标按钮框架添加');
    
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

      try {
        const textNode = await NodeUtils.createText(buttonText, 32, 'Bold');
        textNode.fills = [ColorUtils.createSolidFill(textColor)];
        textNode.resize(buttonFrame.width, textNode.height);
        textNode.textAlignHorizontal = "CENTER";
        textNode.y = (buttonFrame.height - textNode.height) / 2;
        
        NodeUtils.safeAppendChild(buttonFrame, textNode, '单按钮文本添加');
      } catch (textError) {
        console.error('创建单按钮文本失败:', textError);
      }
    }

    NodeUtils.safeAppendChild(this.frame, buttonFrame, '单按钮框架添加');
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
      try {
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
          NodeUtils.safeAppendChild(this.frame, leftButton, '左侧按钮添加');
        }
      } catch (leftButtonError) {
        console.error('创建左侧按钮失败:', leftButtonError);
      }
    }

    // 右侧按钮 - 只有有底图时才创建
    if (hasRightBg) {
      try {
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
          NodeUtils.safeAppendChild(this.frame, rightButton, '右侧按钮添加');
        }
      } catch (rightButtonError) {
        console.error('创建右侧按钮失败:', rightButtonError);
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
      try {
        const color = textColor 
          ? ColorUtils.hexToRgb(textColor)
          : { r: 1, g: 1, b: 1 };

        const buttonText = await NodeUtils.createText(text, 24, 'Bold');
        buttonText.fills = [ColorUtils.createSolidFill(color)];
        buttonText.resize(width, buttonText.height);
        buttonText.textAlignHorizontal = "CENTER";
        buttonText.y = (height - buttonText.height) / 2;
        
        NodeUtils.safeAppendChild(buttonFrame, buttonText, `${name}按钮文本添加`);
      } catch (textError) {
        console.error(`创建${name}文本失败:`, textError);
      }
    }

    return buttonFrame;
  }
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
    NodeUtils.safeAppendChild(frame, moduleContent, `${module.type}模块内容添加`);
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
  NodeUtils.safeAppendChild(frame, errorText, '错误文本添加到错误模块');
  return frame;
}

// ==================== 九宫格抽奖模块创建器 ====================

// 创建九宫格抽奖模块的异步函数
async function createNineGridModule(content: NineGridContent): Promise<FrameNode> {
  
  // 创建整个九宫格模块容器：1080宽，背景透明，高度按实际创建成功来
  const frame = NodeUtils.createFrame("九宫格抽奖", 1080, 1000);
  frame.fills = []; // 背景填充为透明
  
  try {
    // 实例化九宫格模块构建器
    const builder = new NineGridModuleBuilder(frame, content);
    // 调用构建器的build方法来构建九宫格模块
    await builder.build();
        
    // 返回构建完成的框架
    return frame;
  } catch (error) {
    console.error('九宫格模块创建失败：', error);
    // 创建一个错误信息显示框
    const errorText = await NodeUtils.createText(`九宫格模块创建失败: ${error instanceof Error ? error.message : '未知错误'}`, 16);
    errorText.x = 20;
    errorText.y = 20;
    errorText.fills = [ColorUtils.createSolidFill({ r: 1, g: 0, b: 0 })];
    NodeUtils.safeAppendChild(frame, errorText, '九宫格错误文本添加');
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
    
    try {
      // 添加标题
      await this.addTitle();
      
      // 添加九宫格主体
      await this.addNineGrid();
      
      // 调整整个模块的高度
      this.adjustFrameHeight();
      
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
    const titleContainer = NodeUtils.createFrame("九宫格标题", 1080, 120);
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
            NodeUtils.safeAppendChild(titleContainer, titleBgImage, '标题背景图片添加');
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

    NodeUtils.safeAppendChild(titleContainer, titleText, '标题文本添加');
    NodeUtils.safeAppendChild(this.frame, titleContainer, '标题容器添加');
    this.currentY += 120;
  }

  // 添加九宫格主体
  private async addNineGrid(): Promise<void> {
    // 计算九宫格主体容器高度：3行格子 + 间距 + 上下边距
    const gridHeight = 3 * this.CELL_SIZE + 4 * this.CELL_SPACING + 180; // 上下各90px边距
    
    // 创建九宫格主体容器：1080宽，高度按创建成功后的高度来
    const gridContainer = NodeUtils.createFrame("九宫格主体", 1080, gridHeight);
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
          NodeUtils.safeAppendChild(gridContainer, backgroundNode, '九宫格背景图片添加');
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
        NodeUtils.safeAppendChild(gridContainer, cell, `九宫格单元格${index + 1}添加`);
      }
    }

    NodeUtils.safeAppendChild(this.frame, gridContainer, '九宫格容器添加');
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
            NodeUtils.safeAppendChild(buttonFrame, buttonImage, '抽奖按钮图片添加');
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
    NodeUtils.safeAppendChild(buttonFrame, buttonText, '抽奖按钮默认文本添加');
  }

  private async createPrizeCell(x: number, y: number, index: number): Promise<FrameNode> {
    // 获取奖品索引（跳过中间的抽奖按钮）
    const prizeIndex = this.getPrizeIndex(Math.floor(index / 3), index % 3);
    const prize = this.content.prizes?.[prizeIndex];
    const prizeNumber = (prizeIndex + 1).toString();
    const paddedNumber = prizeNumber.length < 2 ? '0' + prizeNumber : prizeNumber;
    const prizeName = prize?.name || `奖品${paddedNumber}`;
        
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
            NodeUtils.safeAppendChild(prizeBox, prizeBgImage, '奖品背景图片添加');
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
            NodeUtils.safeAppendChild(prizeBox, prizeImage, '奖品图片添加');
          }
        } catch (error) {
          console.error('奖品图片创建失败:', error);
          // 如果奖品图片创建失败，添加占位符
          const placeholder = NodeUtils.createFrame("占位符", 180, 180);
          placeholder.x = 45;
          placeholder.y = 11;
          placeholder.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
          placeholder.cornerRadius = 10;
          NodeUtils.safeAppendChild(prizeBox, placeholder, '奖品占位符添加');
        }
      } else {
        // 如果没有奖品图片，添加占位符
        const placeholder = NodeUtils.createFrame("占位符", 180, 180);
        placeholder.x = 45;
        placeholder.y = 11;
        placeholder.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
        placeholder.cornerRadius = 10;
        NodeUtils.safeAppendChild(prizeBox, placeholder, '奖品默认占位符添加');
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
        NodeUtils.safeAppendChild(prizeBox, prizeText, '奖品名称文本添加');
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

/**
 * 签到模块构建器类
 */
class SignInModuleBuilder {
  /** 签到模块的框架节点 */
  private frame: FrameNode;
  /** 签到模块的内容配置 */
  private content: SignInContent;

  /**
   * 构造函数
   * @param frame 签到模块的框架节点
   * @param content 签到模块的内容配置
   */
  constructor(frame: FrameNode, content: SignInContent) {
    this.frame = frame;
    this.content = content;
  }

  /**
   * 构建签到模块的主要方法
   * 按顺序执行以下步骤：
   * 1. 设置背景
   * 2. 添加标题
   * 3. 添加签到日期
   * 4. 添加签到按钮
   */
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

    NodeUtils.safeAppendChild(this.frame, titleFrame, '签到标题添加');
  }

  private async addDefaultTitle(titleFrame: FrameNode): Promise<void> {
    titleFrame.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.5, b: 0.3 })];
    
    const titleText = await NodeUtils.createText("每日签到", 28, 'Bold');
    titleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    titleText.resize(500, titleText.height);
    titleText.textAlignHorizontal = "CENTER";
    titleText.y = (100 - titleText.height) / 2;
    
    NodeUtils.safeAppendChild(titleFrame, titleText, '签到默认标题文本添加');
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
      NodeUtils.safeAppendChild(daysContainer, dayItem, `签到第${i + 1}天添加`);
    }

    NodeUtils.safeAppendChild(this.frame, daysContainer, '签到日期容器添加');
  }

  private async createDayItem(dayNumber: number): Promise<FrameNode> {
    const dayItem = NodeUtils.createFrame(`第${dayNumber}天`, 80, 220);
    dayItem.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 0.95 })];
    dayItem.cornerRadius = 5;
    
    NodeUtils.setupAutoLayout(dayItem, 'VERTICAL', 10, 10);

    // 添加日期图标
    const dayIconFrame = await this.createDayIcon();
    NodeUtils.safeAppendChild(dayItem, dayIconFrame, '签到日期图标添加');

    // 添加日期文本
    const dayText = await NodeUtils.createText(`第${dayNumber}天`, 16, 'Medium');
    dayText.resize(80, dayText.height);
    dayText.textAlignHorizontal = "CENTER";
    NodeUtils.safeAppendChild(dayItem, dayText, '签到日期文本添加');

    // 添加奖励描述
    const rewardText = await NodeUtils.createText("金币 x 100", 14);
    rewardText.fills = [ColorUtils.createSolidFill({ r: 0.5, g: 0.5, b: 0.5 })];
    rewardText.resize(80, rewardText.height);
    rewardText.textAlignHorizontal = "CENTER";
    NodeUtils.safeAppendChild(dayItem, rewardText, '签到奖励描述添加');

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

    try {
      if (buttonFrame.parent === null) {
        NodeUtils.safeAppendChild(this.frame, buttonFrame, '签到按钮框架添加');
      } else {
        console.warn('签到按钮框架已有父容器，跳过添加');
      }
    } catch (frameError) {
      console.error('添加签到按钮框架失败:', frameError);
    }
  }

  private async addDefaultButton(buttonFrame: FrameNode): Promise<void> {
    buttonFrame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.4, b: 0.3 })];
    buttonFrame.cornerRadius = 30;

    const buttonText = await NodeUtils.createText("立即签到", 18, 'Bold');
    buttonText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    buttonText.resize(200, buttonText.height);
    buttonText.textAlignHorizontal = "CENTER";
    buttonText.y = (60 - buttonText.height) / 2;

    NodeUtils.safeAppendChild(buttonFrame, buttonText, '签到默认按钮文本添加');
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
    
    NodeUtils.safeAppendChild(frame, titleFrame, '集卡标题添加');
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
    NodeUtils.safeAppendChild(cardsContainer, cardFrame, `签到卡片${i + 1}添加`);
  }

  NodeUtils.safeAppendChild(frame, cardsContainer, '签到卡片容器添加');
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
      NodeUtils.safeAppendChild(buttonFrame, buttonText, '合成按钮文本添加');
    }
    
    // 将合成按钮添加到主框架中
    NodeUtils.safeAppendChild(frame, buttonFrame, '合成按钮添加');
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
  NodeUtils.safeAppendChild(cardFrame, cardText, '签到卡片编号添加');

  return cardFrame;
}


// ==================== 活动内容模块创建器 ====================
// 注意：此模块用于创建活动详细内容，区别于页面底部的活动规则模块

async function createActivityContentModule(content: ActivityContentData): Promise<FrameNode> {
  
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
    NodeUtils.safeAppendChild(frame, errorText, '活动内容模块错误文本添加');
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
        NodeUtils.safeAppendChild(titleContainer, titleBgImage, '活动内容标题背景图片添加');
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

    NodeUtils.safeAppendChild(titleContainer, titleText, '活动内容标题文本添加');
    NodeUtils.safeAppendChild(this.frame, titleContainer, '活动内容标题容器添加');
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
        NodeUtils.safeAppendChild(subTitleContainer, subTitleBgImage, '小标题背景图片添加');
      }
    } catch (error) {
      console.error('小标题背景图片创建失败:', error);
    }

    // 添加小标题文本节点 - 44大小，Medium
    const subTitleText = await NodeUtils.createText(this.content.subTitle, 44, 'Medium');
    subTitleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    subTitleText.resize(1080, subTitleText.height);
    subTitleText.textAlignHorizontal = "CENTER"; // 设置小标题文本水平居中对齐
    subTitleText.x = 0;
    subTitleText.y = (100 - subTitleText.height) / 2; // 垂直居中

    NodeUtils.safeAppendChild(subTitleContainer, subTitleText, '小标题文本添加');
    NodeUtils.safeAppendChild(this.frame, subTitleContainer, '小标题容器添加');
  }

  // 添加正文
  private async addTextContent(): Promise<void> {
    // 如果没有输入内容，则不创建
    if (!this.content.text) return;

    console.log('添加正文...');

    // 直接插入正文文本节点，宽度为950，高度按实际输入内容
    const textNode = await NodeUtils.createText(this.content.text, 40, 'Regular');
    textNode.resize(950, textNode.height);
    textNode.textAlignHorizontal = "CENTER"; // 设置文本水平居中对齐
    textNode.lineHeight = { unit: 'AUTO' }; // 自动行高
    textNode.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })]; // 设置文字颜色为白色

    // 将文本节点安全地添加到框架中
    NodeUtils.safeAppendChild(this.frame, textNode, '活动内容正文添加');
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
        NodeUtils.safeAppendChild(this.frame, imageNode, '活动内容插图添加');
      }
    } catch (error) {
      console.error('插图创建失败:', error);
    }
  }

  // 调整整个模块的高度
  private adjustFrameHeight(): void {
    // 自动布局会自动调整高度，无需手动设置
    // 框架会根据内容自动调整到合适的高度
  }
}

// ==================== 页面底部活动规则模块创建器 ====================
// 注意：此模块用于创建页面底部的活动规则，区别于上面的活动内容模块

// 活动规则内容接口
interface ActivityRulesContent {
  rulesTitle: string;               // 规则标题
  rulesBgImage: ImageInfo | null;   // 规则标题背景图片
  rulesContent: string;             // 规则内容文本
}

// 页面底部活动规则模块创建器
async function createRulesModule(config: H5Config): Promise<FrameNode> {
  console.log('开始创建活动规则模块，内容：', {
    rulesTitle: config.rulesTitle,
    rulesBgImage: !!config.rulesBgImage,
    rulesContent: config.rulesContent
  });

  // 创建活动规则模块容器：1080宽，背景透明，高度按实际创建内容来调整
  const frame = NodeUtils.createFrame("活动规则", 1080, 1000);
  frame.fills = []; // 背景填充为透明

  try {
    // 构建活动规则内容数据
    const rulesData: ActivityRulesContent = {
      rulesTitle: config.rulesTitle || '',
      rulesBgImage: config.rulesBgImage,
      rulesContent: config.rulesContent || ''
    };

    // 实例化活动规则模块构建器
    const builder = new ActivityRulesModuleBuilder(frame, rulesData);
    // 调用构建器的build方法来构建活动规则模块
    await builder.build();

    console.log('活动规则模块创建完成，最终高度：', frame.height);

    // 返回构建完成的框架
    return frame;
  } catch (error) {
    console.error('活动规则模块创建失败：', error);
    // 创建一个错误信息显示框
    const errorText = await NodeUtils.createText(`活动规则模块创建失败: ${error instanceof Error ? error.message : '未知错误'}`, 16);
    errorText.x = 20;
    errorText.y = 20;
    errorText.fills = [ColorUtils.createSolidFill({ r: 1, g: 0, b: 0 })];
    NodeUtils.safeAppendChild(frame, errorText, '活动规则模块错误文本添加');
    frame.resize(1080, 100);
    return frame;
  }
}

// 活动规则模块构建器类
class ActivityRulesModuleBuilder {
  private frame: FrameNode; // 存储活动规则模块的框架节点
  private content: ActivityRulesContent; // 存储活动规则模块的内容
  private currentY = 0; // 当前Y位置

  // 构造函数，初始化活动规则模块构建器
  constructor(frame: FrameNode, content: ActivityRulesContent) {
    this.frame = frame; // 设置框架节点
    this.content = content; // 设置内容
  }

  // 构建活动规则模块的主要方法
  async build(): Promise<void> {
    console.log('开始构建活动规则模块');

    try {
      // 检查是否有任何内容需要构建
      const hasRulesTitle = this.content.rulesTitle && this.content.rulesTitle.trim() !== '';
      const hasRulesBgImage = this.content.rulesBgImage !== null && this.content.rulesBgImage !== undefined;
      const hasRulesContent = this.content.rulesContent && this.content.rulesContent.trim() !== '';

      // 如果没有任何内容，直接返回
      if (!hasRulesTitle && !hasRulesBgImage && !hasRulesContent) {
        console.log('活动规则模块：没有任何内容需要构建，跳过');
        this.frame.resize(1080, 0); // 设置高度为0
        return;
      }

      // 添加标题（如果有标题文案或标题背景）
      if (hasRulesTitle || hasRulesBgImage) {
        console.log('添加活动规则标题...');
        await this.addTitle();
      }

      // 添加规则内容（如果有）
      if (hasRulesContent) {
        console.log('添加活动规则内容...');
        await this.addRulesContent();
      }

      // 调整整个模块的高度
      console.log('调整模块高度...');
      this.adjustFrameHeight();

      console.log('活动规则模块构建完成');
    } catch (error) {
      console.error('活动规则模块构建过程中出错：', error);
      throw error;
    }
  }

  // 添加标题
  private async addTitle(): Promise<void> {
    const hasRulesTitle = this.content.rulesTitle && this.content.rulesTitle.trim() !== '';
    const hasRulesBgImage = this.content.rulesBgImage !== null && this.content.rulesBgImage !== undefined;
    
    // 如果既没有标题文案也没有标题背景，直接返回
    if (!hasRulesTitle && !hasRulesBgImage) return;

    // 添加上边距
    this.currentY += 90;

    // 使用统一的标题容器创建函数
    // 如果没有标题文案，使用空字符串，但仍然可以显示背景图片
    const titleText = hasRulesTitle ? this.content.rulesTitle : '';
    
    const titleContainer = await createTitleContainer(
      titleText,
      this.content.rulesBgImage,
      1080,
      120,
      48, // 48px字体大小
      'Bold'
    );
    
    titleContainer.x = 0;
    titleContainer.y = this.currentY;
    
    NodeUtils.safeAppendChild(this.frame, titleContainer, '活动规则标题容器添加');
    this.currentY += 120;
  }

  // 添加规则内容
  private async addRulesContent(): Promise<void> {
    // 如果没有规则内容，直接返回
    if (!this.content.rulesContent) return;

    console.log('添加规则内容...');

    // 添加上边距
    this.currentY += 90;

    // 创建规则内容文本节点，直接插入到活动规则容器中（与活动详情模块的正文文本节点实现方式一致）
    const contentText = await NodeUtils.createText(this.content.rulesContent, 28, 'Regular');
    
    // 设置文本样式（与活动详情模块的正文文本完全一致）
    contentText.fills = [ColorUtils.createSolidFill({ r: 0, g: 0, b: 0 })]; // 黑色文字
    contentText.lineHeight = { value: 40, unit: 'PIXELS' }; // 设置行高40px（与活动详情模块一致）
    contentText.resize(950, contentText.height); // 设置宽度为950px（与活动详情模块一致）
    contentText.textAlignHorizontal = "LEFT"; // 左对齐（与活动详情模块一致）
    
    // 设置文本位置：水平居中，垂直按当前Y位置放置
    contentText.x = (1080 - 950) / 2; // 水平居中（左右各留65px边距）
    contentText.y = this.currentY;

    // 直接将文本节点添加到活动规则容器中
    NodeUtils.safeAppendChild(this.frame, contentText, '活动规则内容文本添加');
    
    // 更新当前Y位置
    this.currentY += contentText.height;
  }

  // 调整整个模块的高度
  private adjustFrameHeight(): void {
    // 添加下边距
    this.currentY += 90;
    // 调整框架高度
    this.frame.resize(1080, this.currentY);
  }
}

// ==================== 尾版模块创建器 ====================

async function createFooterModule(config: H5Config): Promise<FrameNode | null> {
  // 当同时没有LOGO图片和尾版背景图片时，直接跳过创建尾版模块
  if (!config.footerLogo && !config.footerBg) {
    console.log('跳过尾版模块创建：没有LOGO图片和尾版背景图片');
    return null;
  }

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
      if ('constraints' in logoImage) {
        logoImage.constraints = {
          horizontal: "SCALE",
          vertical: "SCALE"
        };
      }
      
      // 将Logo图片节点直接添加到尾版框架中
      NodeUtils.safeAppendChild(this.frame, logoImage, '尾版Logo图片添加');
      
      console.log(`Logo创建成功: 最终尺寸=${finalWidth.toFixed(1)}x${finalHeight.toFixed(1)}, 位置=(${logoImage.x.toFixed(1)}, ${logoImage.y.toFixed(1)})`);
      
    } catch (error) {
      console.error('Logo创建失败:', error);
    }
  }
}


/**
 * 生成渠道特定版本的H5原型
 * @param channel 渠道名称 (oppo, vivo, xiaomi等)
 */
async function generateChannelVersion(channel: string): Promise<void> {
  try {
    console.log(`开始为${channel}渠道生成H5原型`);
    
    // 检查是否选中了H5原型容器
    const selectedPrototype = getSelectedPrototype();
    if (!selectedPrototype) {
      throw new Error('请先选中名为"H5原型"的容器');
    }
    
    // 根据H5原型容器中的文本节点加载字体
    console.log('分析H5原型容器中的文本节点并加载字体...');
    await loadFontsFromPrototype(selectedPrototype);
    console.log('字体加载完成');
    
    // 创建渠道专用的H5原型生成器
    const channelGenerator = new ChannelPrototypeGenerator(channel, selectedPrototype);
    
    // 生成渠道版本
    await channelGenerator.generate();
    
    console.log(`${channel}渠道版本生成完成`);
    
  } catch (error) {
    console.error(`生成${channel}渠道版本失败:`, error);
    throw error;
  }
}

/**
 * 从H5原型容器中提取所有文本节点使用的字体并加载
 */
async function loadFontsFromPrototype(prototypeContainer: FrameNode): Promise<void> {
  try {
    console.log('开始分析H5原型容器中的文本节点...');
    
    // 收集所有文本节点使用的字体
    const fontsToLoad = new Set<string>();
    
    // 递归遍历所有节点，收集文本节点的字体信息
    const collectFonts = (node: BaseNode): void => {
      if (node.type === 'TEXT') {
        const textNode = node as TextNode;
        
        // 处理混合字体样式
        if (typeof textNode.fontName === 'object' && 'family' in textNode.fontName) {
          // 单一字体
          const fontKey = `${textNode.fontName.family}|${textNode.fontName.style}`;
          fontsToLoad.add(fontKey);
          console.log(`发现文本节点 "${textNode.name}" 使用字体: ${textNode.fontName.family} ${textNode.fontName.style}`);
        } else if (textNode.fontName === figma.mixed) {
          // 混合字体 - 需要遍历每个字符的字体
          const len = textNode.characters.length;
          for (let i = 0; i < len; i++) {
            const font = textNode.getRangeFontName(i, i + 1) as FontName;
            const fontKey = `${font.family}|${font.style}`;
            fontsToLoad.add(fontKey);
          }
          console.log(`发现文本节点 "${textNode.name}" 使用混合字体`);
        }
      }
      
      // 递归处理子节点
      if ('children' in node) {
        for (const child of node.children) {
          collectFonts(child);
        }
      }
    };
    
    // 开始收集字体
    collectFonts(prototypeContainer);
    
    console.log(`共发现 ${fontsToLoad.size} 种字体需要加载`);
    
    // 加载所有发现的字体
    const loadPromises = Array.from(fontsToLoad).map(async (fontKey) => {
      const [family, style] = fontKey.split('|');
      try {
        await figma.loadFontAsync({ family, style });
        console.log(`✓ 字体加载成功: ${family} ${style}`);
      } catch (error) {
        console.warn(`✗ 字体加载失败: ${family} ${style}`, error);
        // 字体加载失败不阻断流程
      }
    });
    
    await Promise.all(loadPromises);
    console.log('所有字体加载完成');
    
  } catch (error) {
    console.error('从原型容器加载字体时发生错误:', error);
    // 不抛出错误，让后续流程继续执行
  }
}

/**
 * 获取当前选中的H5原型容器
 */
function getSelectedPrototype(): FrameNode | null {
  try {
    const selection = figma.currentPage.selection;
    
    // 检查是否有选中的节点
    if (selection.length === 0) {
      console.warn('未选中任何节点');
      return null;
    }
    
    // 检查选中的第一个节点是否为Frame类型且名称为"H5原型"
    const selectedNode = selection[0];
    if (selectedNode.type === 'FRAME' && selectedNode.name === 'H5原型') {
      console.log('找到选中的H5原型容器');
      return selectedNode as FrameNode;
    }
    
    console.warn(`选中的节点不是H5原型容器，当前选中: ${selectedNode.name} (类型: ${selectedNode.type})`);
    return null;
    
  } catch (error) {
    console.error('获取选中的原型容器失败:', error);
    return null;
  }
}

/**
 * 渠道原型生成器类
 * 负责根据不同渠道的规格要求生成对应的H5原型版本
 */
class ChannelPrototypeGenerator {
  private channel: string;
  private sourcePrototype: FrameNode;
  private channelConfig: ChannelConfig;
  
  constructor(channel: string, sourcePrototype: FrameNode) {
    this.channel = channel.toLowerCase();
    this.sourcePrototype = sourcePrototype;
    this.channelConfig = this.getChannelConfig(this.channel);
  }
  
  /**
   * 生成渠道版本的主方法
   */
  async generate(): Promise<void> {
    try {
      console.log(`开始生成${this.channel}渠道版本`);
      
      // 1. 复制原始原型
      const channelPrototype = await this.clonePrototype();
      
      // 2. 应用渠道特定的调整
      await this.applyChannelAdjustments(channelPrototype);
      
      // 3. 定位新原型位置
      this.positionChannelPrototype(channelPrototype);
      
      console.log(`${this.channel}渠道版本创建完成`);
      
    } catch (error) {
      console.error(`生成${this.channel}渠道版本失败:`, error);
      throw error;
    }
  }
  
  /**
   * 复制原始原型
   */
  private async clonePrototype(): Promise<FrameNode> {
    try {
      // 1. 复制H5原型容器
      const clonedPrototype = this.sourcePrototype.clone();
      
      // 2. 修改命名为对应渠道
      clonedPrototype.name = `${this.channel.toUpperCase()}-H5`;
      
      // 3. 设置位置：放置在原H5原型容器的右侧1080px处
      clonedPrototype.x = this.sourcePrototype.x + 1080;
      clonedPrototype.y = this.sourcePrototype.y;
      
      // 4. 添加到当前页面
      NodeUtils.safeAppendChild(figma.currentPage, clonedPrototype, `${this.channel}渠道原型添加`);
      
      console.log(`${this.channel}渠道原型复制完成，位置: (${clonedPrototype.x}, ${clonedPrototype.y})`);
      
      return clonedPrototype;
    } catch (error) {
      console.error('复制原型失败:', error);
      throw new Error(`复制${this.channel}原型失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }
  
  /**
   * 应用渠道特定的调整
   */
  private async applyChannelAdjustments(prototype: FrameNode): Promise<void> {
    try {
      console.log(`应用${this.channel}渠道的特定调整`);
      
      // 1. 查找自适应模块容器
      const adaptiveModule = this.findAdaptiveModule(prototype);
      if (!adaptiveModule) {
        throw new Error('未找到自适应模块容器');
      }
      
      // 2. 对自适应模块容器内的内容进行调整
      await this.adjustAdaptiveModuleContent(adaptiveModule);
      
      // 3. 调整渠道H5容器的尺寸与自适应模块保持一致
      this.resizeChannelPrototype(prototype, adaptiveModule);
      
    } catch (error) {
      console.error(`应用${this.channel}渠道调整失败:`, error);
      throw error;
    }
  }
  
  /**
   * 查找自适应模块容器
   */
  private findAdaptiveModule(prototype: FrameNode): FrameNode | null {
    try {
      // 在渠道H5容器中查找名为"自适应模块"的Frame节点
      const adaptiveModule = prototype.findOne(node => 
        node.type === 'FRAME' && node.name === '自适应模块'
      ) as FrameNode;
      
      if (adaptiveModule) {
        console.log(`找到自适应模块容器: ${adaptiveModule.name}`);
        return adaptiveModule;
      } else {
        console.warn('未找到自适应模块容器');
        return null;
      }
    } catch (error) {
      console.error('查找自适应模块容器失败:', error);
      return null;
    }
  }
  
  /**
   * 调整自适应模块容器内的内容
   */
  private async adjustAdaptiveModuleContent(adaptiveModule: FrameNode): Promise<void> {
    try {
      console.log(`开始调整${this.channel}渠道的自适应模块内容`);
      
      // 应用渠道特定的样式调整
      await this.applyChannelStyles(adaptiveModule);
      
      // 应用渠道特定的内容调整
      await this.applyChannelContent(adaptiveModule);
      
      console.log(`${this.channel}渠道自适应模块内容调整完成`);
      
    } catch (error) {
      console.error(`调整自适应模块内容失败:`, error);
      throw error;
    }
  }
  
  /**
   * 调整渠道H5容器尺寸与自适应模块保持一致
   */
  private resizeChannelPrototype(prototype: FrameNode, adaptiveModule: FrameNode): void {
    try {
      // 获取自适应模块的尺寸
      const moduleWidth = adaptiveModule.width;
      const moduleHeight = adaptiveModule.height;
      
      // 调整渠道H5容器的尺寸
      prototype.resize(moduleWidth, moduleHeight);
      
      console.log(`${this.channel}渠道H5容器尺寸已调整为: ${moduleWidth}x${moduleHeight}`);
      
    } catch (error) {
      console.error('调整渠道H5容器尺寸失败:', error);
    }
  }
  
  /**
   * 应用渠道特定的样式调整
   */
  private async applyChannelStyles(adaptiveModule: FrameNode): Promise<void> {
    try {
      console.log(`应用${this.channel}渠道样式调整`);
      
      // 遍历自适应模块的所有子节点，进行样式调整
      for (const child of adaptiveModule.children) {
        if (child.type === 'FRAME') {
          await this.adjustModuleStyles(child as FrameNode);
        }
      }
      
    } catch (error) {
      console.error(`应用${this.channel}渠道样式调整失败:`, error);
    }
  }
  
  /**
   * 应用渠道特定的内容调整  
   */
  private async applyChannelContent(adaptiveModule: FrameNode): Promise<void> {
    try {
      console.log(`应用${this.channel}渠道内容调整`);
      
      // 遍历自适应模块的所有子节点，进行内容调整
      for (const child of adaptiveModule.children) {
        if (child.type === 'FRAME') {
          await this.adjustModuleContent(child as FrameNode);
        }
      }
      
    } catch (error) {
      console.error(`应用${this.channel}渠道内容调整失败:`, error);
    }
  }
  
  /**
   * 调整特定模块的样式（尺寸、间距等）
   */
  private async adjustModuleStyles(moduleFrame: FrameNode): Promise<void> {
    try {
      // 根据渠道配置调整模块样式
      switch (this.channel) {
        case 'oppo':
          await this.applyOppoStyles(moduleFrame);
          break;
        case 'vivo':
          await this.applyVivoStyles(moduleFrame);
          break;
        case 'xiaomi':
          await this.applyXiaomiStyles(moduleFrame);
          break;
        default:
          console.log(`${this.channel}渠道暂无特定样式调整`);
      }
    } catch (error) {
      console.error(`调整模块样式失败:`, error);
    }
  }
  
  /**
   * 调整特定模块的内容（文本、图片等）
   */
  private async adjustModuleContent(moduleFrame: FrameNode): Promise<void> {
    try {
      // 根据渠道配置调整模块内容
      switch (this.channel) {
        case 'oppo':
          await this.applyOppoContent(moduleFrame);
          break;
        case 'vivo':
          await this.applyVivoContent(moduleFrame);
          break;
        case 'xiaomi':
          await this.applyXiaomiContent(moduleFrame);
          break;
        default:
          console.log(`${this.channel}渠道暂无特定内容调整`);
      }
    } catch (error) {
      console.error(`调整模块内容失败:`, error);
    }
  }
  
  /**
   * OPPO渠道样式调整
   */
  private async applyOppoStyles(moduleFrame: FrameNode): Promise<void> {
    try {
      console.log(`应用OPPO样式到模块: ${moduleFrame.name}`);
      
      switch (moduleFrame.name) {
        case '头图':
          await this.adjustOppoHeaderModule(moduleFrame);
          break;
        case '九宫格抽奖':
          await this.adjustOppoNineGridModule(moduleFrame);
          break;
        case '尾版':
          await this.adjustOppoFooterModule(moduleFrame);
          break;
        default:
          console.log(`模块 ${moduleFrame.name} 无需OPPO特定样式调整`);
      }
    } catch (error) {
      console.error(`OPPO样式调整失败:`, error);
    }
  }
  
  /**
   * 调整OPPO头图模块
   */
  private async adjustOppoHeaderModule(headerFrame: FrameNode): Promise<void> {
    try {
      // 1. 调整头图容器高度为1300px
      headerFrame.resize(headerFrame.width, 1300);
      
      // 2. 查找并调整蒙版矩形节点
      const maskRect = this.findMaskRectangle(headerFrame);
      if (maskRect) {
        // 高度-100px
        const newHeight = maskRect.height - 100;
        maskRect.resize(maskRect.width, newHeight);
        
        // 下移150px
        maskRect.y = maskRect.y + 150;
      }
      
      // 3. 查找并调整头图图片节点
      const headerImageNode = this.findHeaderImageNode(headerFrame);
      if (headerImageNode) {
        // 头图图片节点下移100px
        headerImageNode.y = headerImageNode.y + 100;
      }
      
    } catch (error) {
      console.error('调整OPPO头图模块失败:', error);
    }
  }
  
  /**
   * 调整OPPO九宫格模块
   */
  private async adjustOppoNineGridModule(nineGridFrame: FrameNode): Promise<void> {
    try {
      // 查找九宫格主体容器
      const mainContainer = this.findNineGridMainContainer(nineGridFrame);
      if (!mainContainer) {
        return;
      }
      
      // 2. 清除九宫格主体容器的所有内容，保留容器本身
      this.clearContainerContent(mainContainer);
      
      // 3. 插入砸蛋样式图片节点（864*512）
      await this.insertEggBreakingImage(mainContainer, this.channel);

      // 4. 创建立即抽奖容器（512*133）
      const drawContainer = await this.createDrawContainer(mainContainer, nineGridFrame);
      
      // 5. 创建我的奖品容器（398*112）
      const myPrizesContainer = await this.createMyPrizesContainer(mainContainer, drawContainer, nineGridFrame);
      
      // 6. 创建活动规则容器（398*112）
      await this.createRulesContainer(mainContainer, myPrizesContainer, nineGridFrame);
      
    } catch (error) {
      console.error('调整OPPO九宫格模块失败:', error);
    }
  }
  
  /**
   * 调整OPPO尾版模块
   */
  private async adjustOppoFooterModule(footerFrame: FrameNode): Promise<void> {
    try {      
      // 7. 调整尾版容器高度为807px
      footerFrame.resize(footerFrame.width, 807);
      
      // 清除LOGO图片节点
      this.clearFooterLogo(footerFrame);
      
      // 插入尾版样式图片节点（1080*289）
      await this.insertFooterStyleImage(footerFrame, this.channel);      
      
    } catch (error) {
      console.error('调整OPPO尾版模块失败:', error);
    }
  }
  
  /**
   * 查找蒙版矩形节点
   */
  private findMaskRectangle(container: FrameNode): RectangleNode | null {
    // 递归查找蒙版矩形
    const findMask = (node: BaseNode): RectangleNode | null => {
      if (node.type === 'RECTANGLE' && node.name === '蒙版') {
        return node as RectangleNode;
      }
      if ('children' in node) {
        for (const child of node.children) {
          const result = findMask(child);
          if (result) return result;
        }
      }
      return null;
    };
    
    return findMask(container);
  }

  /**
   * 查找头图图片节点
   */
  private findHeaderImageNode(container: FrameNode): SceneNode | null {    
    // 递归查找头图图片节点
    const findHeaderImage = (node: BaseNode): SceneNode | null => {
      // 仅查找名称为"头图图片"的节点
      if (node.name === '头图图片') {
        return node as SceneNode;
      }
      
      // 递归查找子节点
      if ('children' in node) {
        for (const child of node.children) {
          const result = findHeaderImage(child);
          if (result) return result;
        }
      }
      return null;
    };
    
    return findHeaderImage(container);
  }
  
  /**
   * 查找九宫格主体容器
   */
  private findNineGridMainContainer(nineGridFrame: FrameNode): FrameNode | null {
    const mainContainer = nineGridFrame.findOne(node => 
      node.type === 'FRAME' && node.name === '九宫格主体'
    ) as FrameNode;
    
    return mainContainer || null;
  }
  
  /**
   * 清除容器内容
   */
  private clearContainerContent(container: FrameNode): void {
    try {
      // 删除所有子节点
      const children = [...container.children]; // 创建副本避免遍历时修改
      children.forEach(child => {
        NodeUtils.safeRemoveNode(child as SceneNode, `清除${container.name}子节点`);
      });
      console.log(`已清除${container.name}的所有内容`);
    } catch (error) {
      console.error(`清除容器内容失败:`, error);
    }
  }
  
  /**
   * 插入砸蛋样式图片
   */
  private async insertEggBreakingImage(container: FrameNode, channel: string): Promise<void> {
    try {
      // 获取上传的砸蛋样式图片
      const channelData = channelImages[channel];
      const eggBreakingData = channelData?.eggBreaking;
      
      if (eggBreakingData) {
        // 使用上传的图片
        const imageNode = await this.createImageFromData(eggBreakingData, '砸蛋样式');
        imageNode.resize(864, 512);
        imageNode.x = 108; // 距离左边108px
        imageNode.y = 150; // 距离上边150px
        
        NodeUtils.safeAppendChild(container, imageNode, '砸蛋样式图片添加');
        console.log('砸蛋样式图片已插入:', eggBreakingData.name);
      } else {
        // 创建占位矩形
        const eggImage = figma.createRectangle();
        eggImage.name = '砸蛋样式（占位）';
        eggImage.resize(864, 512);
        eggImage.x = 108;
        eggImage.y = 150;
        eggImage.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.8, b: 0.7 })];
        
        NodeUtils.safeAppendChild(container, eggImage, '砸蛋样式占位图片添加');
        console.log('砸蛋样式占位图片已插入');
      }
    } catch (error) {
      console.error('插入砸蛋样式图片失败:', error);
    }
  }
  
  /**
   * 创建立即抽奖容器
   */
  private async createDrawContainer(mainContainer: FrameNode, nineGridFrame: FrameNode): Promise<FrameNode | null> {
    try {
      const drawContainer = NodeUtils.createFrame('立即抽奖', 512, 133);
      drawContainer.x = 284; // 距离左右284px
      drawContainer.y = 648; // 距离上648px
      drawContainer.fills = [];
      
      // 复制游戏信息容器中的按钮底图片
      const buttonImage = await this.copyButtonImageFromGameInfo(nineGridFrame);
      if (buttonImage) {
        // 调整图片大小和位置
        const aspectRatio = buttonImage.height / buttonImage.width;
        buttonImage.resize(512, 512 * aspectRatio);
        
        // 居中对齐
        buttonImage.x = (drawContainer.width - buttonImage.width) / 2;
        buttonImage.y = (drawContainer.height - buttonImage.height) / 2;
        
        NodeUtils.safeAppendChild(drawContainer, buttonImage, '立即抽奖按钮图片添加');
      }
      
      // 获取下载按钮的文本样式
      const buttonTextStyle = this.getDownloadButtonTextStyle(nineGridFrame);
      
      // 添加文本
      try {
        const drawText = figma.createText();
        drawText.name = '立即抽奖文本';
        drawText.characters = '立即抽奖';
        
        // 应用从下载按钮获取的样式
        if (buttonTextStyle) {
          drawText.fontName = buttonTextStyle.fontName;
          drawText.fills = buttonTextStyle.fills;
        } else {
          // 如果无法获取样式，使用默认样式
          drawText.fontName = { family: "Inter", style: "Bold" };
          drawText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
        }
        
        drawText.fontSize = 58;
        drawText.textAlignHorizontal = 'CENTER';
        drawText.textAlignVertical = 'CENTER';
        
        // 居中对齐
        drawText.x = (drawContainer.width - drawText.width) / 2;
        drawText.y = (drawContainer.height - drawText.height) / 2;
        
        NodeUtils.safeAppendChild(drawContainer, drawText, '立即抽奖文本添加');
      } catch (textError) {
        console.error('创建文本节点失败:', textError);
        // 即使文本创建失败，也继续执行后续代码
      }
      
      NodeUtils.safeAppendChild(mainContainer, drawContainer, '立即抽奖容器添加');
      
      return drawContainer;
    } catch (error) {
      console.error('创建立即抽奖容器失败:', error);
      return null;
    }
  }
  
  /**
   * 创建我的奖品容器
   */
  private async createMyPrizesContainer(mainContainer: FrameNode, drawContainer: FrameNode | null, nineGridFrame: FrameNode): Promise<FrameNode | null> {
    try {
      const myPrizesContainer = NodeUtils.createFrame('我的奖品', 398, 112);
      myPrizesContainer.x = 102; // 距离左102px
      myPrizesContainer.y = 851; // 距离上851px
      myPrizesContainer.fills = [];
      
      // 复制立即抽奖容器中的按钮底图片
      if (drawContainer) {
        const buttonImage = this.copyButtonImageFromContainer(drawContainer);
        if (buttonImage) {
          // 调整图片大小
          const aspectRatio = buttonImage.height / buttonImage.width;
          buttonImage.resize(398, 398 * aspectRatio);
          
          // 居中对齐
          buttonImage.x = (myPrizesContainer.width - buttonImage.width) / 2;
          buttonImage.y = (myPrizesContainer.height - buttonImage.height) / 2;
          
          NodeUtils.safeAppendChild(myPrizesContainer, buttonImage, '我的奖品按钮图片添加');
        }
      }
      
      // 获取下载按钮的文本样式
      const buttonTextStyle = this.getDownloadButtonTextStyle(nineGridFrame);
      
      // 添加文本
      try {
        const prizesText = figma.createText();
        prizesText.name = '我的奖品文本';
        prizesText.characters = '我的奖品';
        
        // 应用从下载按钮获取的样式
        if (buttonTextStyle) {
          prizesText.fontName = buttonTextStyle.fontName;
          prizesText.fills = buttonTextStyle.fills;
        } else {
          // 如果无法获取样式，使用默认样式
          prizesText.fontName = { family: "Inter", style: "Bold" };
          prizesText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
        }
        
        prizesText.fontSize = 50;
        prizesText.textAlignHorizontal = 'CENTER';
        prizesText.textAlignVertical = 'CENTER';
        
        // 居中对齐
        prizesText.x = (myPrizesContainer.width - prizesText.width) / 2;
        prizesText.y = (myPrizesContainer.height - prizesText.height) / 2;
        
        NodeUtils.safeAppendChild(myPrizesContainer, prizesText, '我的奖品文本添加');
      } catch (textError) {
        console.error('创建我的奖品文本失败:', textError);
      }
      
      NodeUtils.safeAppendChild(mainContainer, myPrizesContainer, '我的奖品容器添加');
      
      return myPrizesContainer;
    } catch (error) {
      console.error('创建我的奖品容器失败:', error);
      return null;
    }
  }
  
  /**
   * 创建活动规则容器
   */
  private async createRulesContainer(mainContainer: FrameNode, myPrizesContainer: FrameNode | null, nineGridFrame: FrameNode): Promise<void> {
    try {
      const rulesContainer = NodeUtils.createFrame('活动规则', 398, 112);
      rulesContainer.x = 580; // 距离左580px
      rulesContainer.y = 851; // 距离上851px
      rulesContainer.fills = [];
      
      // 复制我的奖品容器中的按钮底图片
      if (myPrizesContainer) {
        const buttonImage = this.copyButtonImageFromContainer(myPrizesContainer);
        if (buttonImage) {
          // 居中对齐（尺寸已经是398px宽度）
          buttonImage.x = (rulesContainer.width - buttonImage.width) / 2;
          buttonImage.y = (rulesContainer.height - buttonImage.height) / 2;
          
          NodeUtils.safeAppendChild(rulesContainer, buttonImage, '活动规则按钮图片添加');
        }
      }
      
      // 获取下载按钮的文本样式
      const buttonTextStyle = this.getDownloadButtonTextStyle(nineGridFrame);
      
      // 添加文本
      try {
        const rulesText = figma.createText();
        rulesText.name = '活动规则文本';
        rulesText.characters = '活动规则';
        
        // 应用从下载按钮获取的样式
        if (buttonTextStyle) {
          rulesText.fontName = buttonTextStyle.fontName;
          rulesText.fills = buttonTextStyle.fills;
        } else {
          // 如果无法获取样式，使用默认样式
          rulesText.fontName = { family: "Inter", style: "Bold" };
          rulesText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
        }
        
        rulesText.fontSize = 50;
        rulesText.textAlignHorizontal = 'CENTER';
        rulesText.textAlignVertical = 'CENTER';
        
        // 居中对齐
        rulesText.x = (rulesContainer.width - rulesText.width) / 2;
        rulesText.y = (rulesContainer.height - rulesText.height) / 2;
        
        NodeUtils.safeAppendChild(rulesContainer, rulesText, '活动规则文本添加');
      } catch (textError) {
        console.error('创建活动规则文本失败:', textError);
      }
      
      NodeUtils.safeAppendChild(mainContainer, rulesContainer, '活动规则容器添加');
      
    } catch (error) {
      console.error('创建活动规则容器失败:', error);
    }
  }
  
  /**
   * 从游戏信息容器复制按钮底图图片
   */
  private async copyButtonImageFromGameInfo(nineGridFrame: FrameNode): Promise<RectangleNode | null> {
    try {
      // 在自适应模块中查找游戏信息容器
      const adaptiveModule = nineGridFrame.parent;
      if (!adaptiveModule || adaptiveModule.type !== 'FRAME') {
        return null;
      }
      
      const gameInfoFrame = (adaptiveModule as FrameNode).findOne(node => 
        node.type === 'FRAME' && node.name === '游戏信息'
      ) as FrameNode;
      
      if (!gameInfoFrame) {
        return null;
      }
      
      // 递归查找按钮底图节点并复制
      const findAndCloneButtonImage = (node: BaseNode): RectangleNode | null => {
        // 查找名称为"按钮底图"的节点
        if (node.name === '按钮底图') {
          // 确保节点是可克隆的SceneNode类型
          if ('clone' in node) {
            const clonedNode = (node as SceneNode).clone() as RectangleNode;
            return clonedNode;
          } else {
            return null;
          }
        }
        
        if ('children' in node) {
          for (const child of node.children) {
            const result = findAndCloneButtonImage(child);
            if (result) return result;
          }
        }
        return null;
      };
      
      return findAndCloneButtonImage(gameInfoFrame);
      
    } catch (error) {
      console.error('从游戏信息复制按钮底图失败:', error);
      return null;
    }
  }

  /**
   * 从游戏信息容器获取下载按钮的文本样式
   */
  private getDownloadButtonTextStyle(nineGridFrame: FrameNode): { fontName: FontName, fills: Paint[] } | null {
    try {
      // 在自适应模块中查找游戏信息容器
      const adaptiveModule = nineGridFrame.parent;
      if (!adaptiveModule || adaptiveModule.type !== 'FRAME') {
        return null;
      }
      
      const gameInfoFrame = (adaptiveModule as FrameNode).findOne(node => 
        node.type === 'FRAME' && node.name === '游戏信息'
      ) as FrameNode;
      
      if (!gameInfoFrame) {
        return null;
      }
      
      // 递归查找下载按钮容器中的文本节点
      const findDownloadButtonText = (node: BaseNode): TextNode | null => {
        if (node.type === 'TEXT' && node.parent && 'name' in node.parent && node.parent.name === '下载按钮') {
          return node as TextNode;
        }
        
        if ('children' in node) {
          for (const child of node.children) {
            const result = findDownloadButtonText(child);
            if (result) return result;
          }
        }
        return null;
      };
      
      const textNode = findDownloadButtonText(gameInfoFrame);
      if (textNode) {
        return {
          fontName: textNode.fontName as FontName,
          fills: textNode.fills as Paint[]
        };
      }
      
      return null;
    } catch (error) {
      console.error('获取下载按钮文本样式失败:', error);
      return null;
    }
  }
  
  /**
   * 从容器复制按钮图片
   */
  private copyButtonImageFromContainer(container: FrameNode): RectangleNode | null {
    try {
      // 查找容器中的图片节点（通常是第一个RectangleNode）
      const imageNode = container.findOne(node => 
        node.type === 'RECTANGLE'
      ) as RectangleNode;
      
      if (imageNode) {
        return imageNode.clone() as RectangleNode;
      }
      
      return null;
    } catch (error) {
      console.error('从容器复制按钮图片失败:', error);
      return null;
    }
  }
  
  /**
   * 清除尾版LOGO
   */
  private clearFooterLogo(footerFrame: FrameNode): void {
    try {
      // 查找并删除LOGO图片节点
      const logoNode = footerFrame.findOne(node => 
        node.name.toLowerCase().includes('logo')
      );
      
      if (logoNode) {
        NodeUtils.safeRemoveNode(logoNode as SceneNode, '清除尾版LOGO');
        console.log('尾版LOGO已清除');
      }
    } catch (error) {
      console.error('清除尾版LOGO失败:', error);
    }
  }
  
  /**
   * 插入尾版样式图片
   */
  private async insertFooterStyleImage(footerFrame: FrameNode, channel: string): Promise<void> {
    try {
      // 获取上传的尾版样式图片
      const channelData = channelImages[channel];
      const footerStyleData = channelData?.footerStyle;
      
      if (footerStyleData) {
        // 使用上传的图片
        const imageNode = await this.createImageFromData(footerStyleData, '尾版样式');
        imageNode.resize(1080, 289);
        imageNode.x = (footerFrame.width - 1080) / 2; // 左右居中
        imageNode.y = 122; // 距离上122px
        
        NodeUtils.safeAppendChild(footerFrame, imageNode, '尾版样式图片添加');
        console.log('尾版样式图片已插入:', footerStyleData.name);
      } else {
        // 创建占位矩形
        const footerStyleImage = figma.createRectangle();
        footerStyleImage.name = '尾版样式（占位）';
        footerStyleImage.resize(1080, 289);
        footerStyleImage.x = (footerFrame.width - 1080) / 2;
        footerStyleImage.y = 122;
        footerStyleImage.fills = [ColorUtils.createSolidFill({ r: 0.8, g: 0.9, b: 0.8 })];
        
        NodeUtils.safeAppendChild(footerFrame, footerStyleImage, '尾版样式占位图片添加');
        console.log('尾版样式占位图片已插入');
      }
    } catch (error) {
      console.error('插入尾版样式图片失败:', error);
    }
  }

  /**
   * 从图片数据创建图片节点
   */
  private async createImageFromData(imageData: ChannelImageData, name: string): Promise<RectangleNode> {
    try {
      const uint8Array = new Uint8Array(imageData.data);
      const imageHash = figma.createImage(uint8Array).hash;
      
      const imageNode = figma.createRectangle();
      imageNode.name = name;
      imageNode.fills = [{
        type: 'IMAGE',
        imageHash: imageHash,
        scaleMode: 'FILL'
      }];
      
      return imageNode;
    } catch (error) {
      console.error(`创建图片节点失败: ${name}`, error);
      throw error;
    }
  }
  
  /**
   * OPPO渠道内容调整
   */
  private async applyOppoContent(moduleFrame: FrameNode): Promise<void> {
    // TODO: 实现OPPO特定的内容调整
    console.log(`应用OPPO内容调整到模块: ${moduleFrame.name}`);
  }
  
  /**
   * VIVO渠道样式调整
   */
  private async applyVivoStyles(moduleFrame: FrameNode): Promise<void> {
    // TODO: 实现VIVO特定的样式调整
    console.log(`应用VIVO样式到模块: ${moduleFrame.name}`);
  }
  
  /**
   * VIVO渠道内容调整
   */
  private async applyVivoContent(moduleFrame: FrameNode): Promise<void> {
    // TODO: 实现VIVO特定的内容调整
    console.log(`应用VIVO内容调整到模块: ${moduleFrame.name}`);
  }
  
  /**
   * 小米渠道样式调整
   */
  private async applyXiaomiStyles(moduleFrame: FrameNode): Promise<void> {
    // TODO: 实现小米特定的样式调整
    console.log(`应用小米样式到模块: ${moduleFrame.name}`);
  }
  
  /**
   * 小米渠道内容调整
   */
  private async applyXiaomiContent(moduleFrame: FrameNode): Promise<void> {
    // TODO: 实现小米特定的内容调整
    console.log(`应用小米内容调整到模块: ${moduleFrame.name}`);
  }
  
  /**
   * 定位渠道原型的位置（此方法在clonePrototype中已处理，这里保留用于后续调整）
   */
  private positionChannelPrototype(prototype: FrameNode): void {
    // 位置已在clonePrototype中设置，这里可以进行额外的位置调整
    console.log(`${this.channel}渠道原型最终位置: (${prototype.x}, ${prototype.y})`);
  }
  
  /**
   * 获取渠道配置
   */
  private getChannelConfig(channel: string): ChannelConfig {
    const configs: Record<string, ChannelConfig> = {
      oppo: {
        name: 'OPPO',
        dimensions: { width: 1080, height: 0 }, // 高度保持自适应
        brandColor: '#1DB584',
        requirements: {
          maxFileSize: '2MB',
          supportedFormats: ['jpg', 'png', 'gif'],
          restrictions: ['no-video', 'limited-animation']
        }
      },
      vivo: {
        name: 'VIVO', 
        dimensions: { width: 1080, height: 0 },
        brandColor: '#4285F4',
        requirements: {
          maxFileSize: '1.5MB',
          supportedFormats: ['jpg', 'png'],
          restrictions: ['no-video', 'no-animation']
        }
      },
      xiaomi: {
        name: '小米',
        dimensions: { width: 1080, height: 0 },
        brandColor: '#FF6900',
        requirements: {
          maxFileSize: '3MB',
          supportedFormats: ['jpg', 'png', 'gif', 'webp'],
          restrictions: []
        }
      }
    };
    
    return configs[channel] || configs.oppo; // 默认使用OPPO配置
  }
}



