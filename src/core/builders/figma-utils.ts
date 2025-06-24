// Figma相关工具类
// 这些工具类专门用于Figma API操作

/// <reference types="@figma/plugin-typings" />

import { ImageInfo, SliceData, SliceStrategy } from '../types';
import { Utils, ImageUtils } from '../utils';

// ==================== 字体管理器 ====================

export class FontManager {
  private static readonly fonts = [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" }, 
    { family: "Inter", style: "Bold" }
  ] as const;

  static async loadAll(): Promise<void> {
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
  }

  static async loadSingle(fontName: FontName): Promise<void> {
    try {
      await figma.loadFontAsync(fontName);
    } catch (error) {
      console.warn(`字体加载失败: ${fontName.family} ${fontName.style}`, error);
    }
  }

  /**
   * 加载Inter字体系列（别名方法）
   * @returns Promise<void>
   */
  static async loadInterFonts(): Promise<void> {
    return this.loadAll();
  }
}

// ==================== 颜色工具 ====================

export class ColorUtils {
  static hexToRgb(hex: string): RGB {
    // 处理无效输入，返回默认颜色（白色）
    if (!hex || typeof hex !== 'string' || hex.trim() === '') {
      console.warn('ColorUtils.hexToRgb: 无效的颜色值，使用默认白色', hex);
      return { r: 1, g: 1, b: 1 }; // 白色
    }
    
    // 处理缩写形式 (#fff -> #ffffff)
    const fullHex = hex.length === 4 
      ? '#' + hex.slice(1).split('').map(c => c + c).join('')
      : hex;
    
    const cleanHex = fullHex.replace('#', '');
    
    // 验证十六进制颜色格式
    if (!/^[0-9A-Fa-f]{6}$/.test(cleanHex)) {
      console.warn('ColorUtils.hexToRgb: 无效的十六进制颜色格式，使用默认白色', hex);
      return { r: 1, g: 1, b: 1 }; // 白色
    }
    
    return {
      r: parseInt(cleanHex.substring(0, 2), 16) / 255,
      g: parseInt(cleanHex.substring(2, 4), 16) / 255,
      b: parseInt(cleanHex.substring(4, 6), 16) / 255
    };
  }

  static createSolidFill(color: RGB, opacity = 1): SolidPaint {
    return {
      type: 'SOLID',
      color,
      opacity
    };
  }
}

// ==================== 节点工具 ====================

export class NodeUtils {
  // 创建一个新的Frame节点
  static createFrame(name: string, width: number, height: number): FrameNode {
    const frame = figma.createFrame();
    frame.name = name;
    frame.resize(width, height);
    return frame;
  }

  // 创建一个新的Text节点并设置其属性
  static async createText(text: string, fontSize: number, fontWeight: 'Regular' | 'Medium' | 'Bold' = 'Regular'): Promise<TextNode> {
    const textNode = figma.createText();
    const fontName = { family: "Inter", style: fontWeight };
    
    // 加载所需的字体
    await FontManager.loadSingle(fontName);
    
    // 设置文本节点的属性
    textNode.characters = text;
    textNode.fontSize = fontSize;
    textNode.fontName = fontName;
    
    return textNode;
  }

  // 为Frame节点设置自动布局属性
  static setupAutoLayout(
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
  }

  /**
   * 安全地将子节点添加到父节点
   * @param parent 父节点
   * @param child 子节点
   * @param operationName 操作名称，用于日志记录
   * @returns 是否成功添加
   */
  static safeAppendChild(
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
  }

  /**
   * 批量安全添加子节点
   * @param parent 父节点
   * @param children 子节点数组
   * @param operationName 操作名称
   * @returns 成功添加的节点数量
   */
  static safeBatchAppendChildren(
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
  }

  /**
   * 安全地移除节点
   * @param node 要移除的节点
   * @param operationName 操作名称
   * @returns 是否成功移除
   */
  static safeRemoveNode(node: SceneNode, operationName: string = '节点移除'): boolean {
    try {
      if (!node) {
        console.warn(`${operationName}: 节点无效`);
        return false;
      }

      if (node.parent) {
        node.remove();
        return true;
      } else {
        console.warn(`${operationName}: 节点没有父节点`);
        return false;
      }
    } catch (error) {
      console.error(`${operationName}失败:`, error);
      return false;
    }
  }
}

// ==================== 图片节点构建器 ====================

export class ImageNodeBuilder {
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
      const isOversized = ImageUtils.isOversized(width, height, maxSize);
      
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
      const sliceInfo = ImageUtils.calculateSliceStrategy(width, height, maxSize);
      
      // 构建符合SliceStrategy接口的对象
      const sliceStrategy: SliceStrategy = {
        direction: sliceInfo.direction,
        sliceWidth: sliceInfo.sliceWidth,
        sliceHeight: sliceInfo.sliceHeight,
        slicesCount: sliceInfo.slicesCount,
        description: sliceInfo.description
      };
      
      // 向UI请求分割处理
      figma.ui.postMessage({
        type: 'slice-large-image',
        imageData: {
          bytes: Array.from(bytes),
          width,
          height,
          name,
          type: 'image/png'  // 默认类型
        },
        sliceWidth: sliceStrategy.sliceWidth,
        sliceHeight: sliceStrategy.sliceHeight,
          sliceStrategy
      });

      // 监听分割结果
      const messageHandler = async (msg: { type: string; imageName?: string; success?: boolean; slices?: SliceData[]; error?: string }) => {
        if (msg.type === 'slice-image-response' && msg.imageName === name) {
          clearTimeout(timeout);

          if (msg.success && msg.slices && msg.slices.length > 0) {
            try {
              // 完整的切片组装实现
              const result = await this.assembleSlicedImage(msg.slices, width, height, name, sliceStrategy);
              resolve(result);
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

  // 组装切片后的图片
  private static async assembleSlicedImage(
    slices: SliceData[], 
    _totalWidth: number, 
    _totalHeight: number, 
    name: string,
    strategy: SliceStrategy
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

  // 设置图片填充
  static async setImageFill(
    node: FrameNode | RectangleNode, 
    imageData: ImageInfo | Uint8Array | null, 
    scaleMode: 'FILL' | 'FIT' = 'FILL'
  ): Promise<void> {
    if (!imageData) return;
    
    const bytes = Utils.extractUint8Array(imageData);
    if (!bytes) return;
    
    try {
      const imageFill = await this.createImageFill(bytes, scaleMode);
      node.fills = [imageFill];
    } catch (error) {
      console.error('设置图片填充失败:', error);
    }
  }
}

// ==================== 标题容器创建函数 ====================

export async function createTitleContainer(
  title: string, 
  bgImage: Uint8Array | ImageInfo | null,
  width: number,
  height: number,
  fontSize: number = 24,
  fontWeight: 'Regular' | 'Medium' | 'Bold' = 'Bold'
): Promise<FrameNode> {
  // 创建容器框架
  const container = NodeUtils.createFrame('标题容器', width, height);
  
  // 如果有背景图片，设置背景
  if (bgImage) {
    await ImageNodeBuilder.setImageFill(container, bgImage);
  } else {
    // 默认背景色
    container.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 0.95 })];
  }
  
  // 创建标题文本
  if (title) {
    const titleText = await NodeUtils.createText(title, fontSize, fontWeight);
    titleText.fills = [ColorUtils.createSolidFill({ r: 0, g: 0, b: 0 })];
    titleText.textAlignHorizontal = 'CENTER';
    titleText.textAlignVertical = 'CENTER';
    
    // 居中定位
    titleText.x = (width - titleText.width) / 2;
    titleText.y = (height - titleText.height) / 2;
    
    container.appendChild(titleText);
  }
  
  return container;
} 