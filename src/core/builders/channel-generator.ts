/// <reference types="@figma/plugin-typings" />

import { ChannelImageData } from '../types';
import { NodeUtils, ColorUtils } from './figma-utils';

// ==================== 渠道原型生成器 ====================

// 全局渠道图片数据（从客户端存储中获取）
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// let channelImages: Record<string, {
//   eggBreaking?: ChannelImageData;
//   footerStyle?: ChannelImageData;
// }> = {};

// 初始化渠道图片数据
// async function initChannelImages(): Promise<void> {
//   try {
//     // 初始化为空对象，从各个渠道的客户端存储中加载
//     channelImages = {};
    
//     const channels = ['oppo', 'vivo', 'huawei', 'xiaomi'];
//     for (const channel of channels) {
//       const stored = await figma.clientStorage.getAsync(`channel-images-${channel}`);
//       if (stored) {
//         channelImages[channel] = JSON.parse(stored);
//         console.log(`已加载 ${channel} 渠道图片数据`);
//       }
//     }
//   } catch (error) {
//     console.warn('获取渠道图片数据失败:', error);
//     channelImages = {};
//   }
// }

/**
 * 渠道配置接口（原始版本，与code.ts保持一致）
 */


/**
 * 渠道原型生成器类
 * 负责根据不同渠道的规格要求生成对应的H5原型版本
 */
class ChannelPrototypeGenerator {
  private channel: string;
  private sourcePrototype: FrameNode;
  private images: { eggBreaking?: ChannelImageData; footerStyle?: ChannelImageData };

  
  constructor(channel: string, sourcePrototype: FrameNode, images: { eggBreaking?: ChannelImageData; footerStyle?: ChannelImageData }) {
    this.channel = channel.toLowerCase();
    this.sourcePrototype = sourcePrototype;
    this.images = images || {};
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
   * 
   * 调整内容包括：
   * 1. 调整自适应模块内容
   * 2. 调整原型尺寸以符合渠道要求
   * 3. 应用渠道特定样式
   * 4. 应用渠道特定内容
   */
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
   * 自适应模块是包含所有可调整模块的容器，是渠道适配的主要目标
   */
  private findAdaptiveModule(prototype: FrameNode): FrameNode | null {
    const findAdaptive = (node: BaseNode): FrameNode | null => {
      if (node.type === 'FRAME' && node.name === '自适应模块') {
        return node as FrameNode;
      }
      
      if ('children' in node) {
        for (const child of node.children) {
          const result = findAdaptive(child);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    return findAdaptive(prototype);
  }

  /**
   * 调整自适应模块内容
   * 遍历所有子模块，应用通用的样式和内容调整
   */
  private async adjustAdaptiveModuleContent(adaptiveModule: FrameNode): Promise<void> {
    for (const child of adaptiveModule.children) {
      if (child.type === 'FRAME') {
        const moduleFrame = child as FrameNode;
        await this.adjustModuleStyles(moduleFrame);   // 调整模块样式
        await this.adjustModuleContent(moduleFrame);  // 调整模块内容
      }
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
      console.log(`应用OPPO样式到模块: "${moduleFrame.name}"`);
      console.log(`模块名称长度: ${moduleFrame.name.length}`);
      console.log(`模块名称字符编码:`, Array.from(moduleFrame.name).map(char => char.charCodeAt(0)));
      
      switch (moduleFrame.name.trim()) {
        case '头图':
          await this.adjustOppoHeaderModule(moduleFrame);
          break;
        case '九宫格抽奖':
          console.log('匹配到九宫格抽奖模块，开始调整');
          await this.adjustOppoNineGridModule(moduleFrame);
          break;
        case '尾版':
          await this.adjustOppoFooterModule(moduleFrame);
          break;
        default:
          console.log(`模块 "${moduleFrame.name}" 无需OPPO特定样式调整`);
          console.log('可匹配的模块名称: 头图, 九宫格抽奖, 尾版');
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
      console.log('开始调整OPPO头图模块');
      
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
      
      console.log('OPPO头图模块调整完成');
    } catch (error) {
      console.error('调整OPPO头图模块失败:', error);
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
   * 调整OPPO九宫格模块
   */
  private async adjustOppoNineGridModule(nineGridFrame: FrameNode): Promise<void> {
    try {
      console.log('开始调整OPPO九宫格模块');

      // 检查是否有砸蛋样式图片
      // const channelData = channelImages[this.channel];
      // const eggBreakingData = channelData?.eggBreaking;

      const eggBreakingData = this.images.eggBreaking;
      
      if (!eggBreakingData) {
        console.log('未上传砸蛋样式图片，跳过九宫格模块调整');
        return;
      }
      
      // 查找九宫格主体容器
      const mainContainer = this.findNineGridMainContainer(nineGridFrame);
      if (!mainContainer) {
        console.warn('未找到九宫格主体容器');
        return;
      }
      
      // 清空九宫格主体容器的所有内容
      this.clearContainerContent(mainContainer);
      
      // 插入砸蛋样式图片
      await this.insertEggBreakingImage(mainContainer, this.channel);
      
      // 创建立即抽奖容器
      const drawContainer = await this.createDrawContainer(mainContainer, nineGridFrame);
      
      // 创建我的奖品容器
      const myPrizesContainer = await this.createMyPrizesContainer(mainContainer, drawContainer, nineGridFrame);
      
      // 创建活动规则容器
      await this.createRulesContainer(mainContainer, myPrizesContainer, nineGridFrame);
      
      console.log('OPPO九宫格模块调整完成');
    } catch (error) {
      console.error('调整OPPO九宫格模块失败:', error);
    }
  }

  /**
   * 调整OPPO尾版模块
   */
  private async adjustOppoFooterModule(footerFrame: FrameNode): Promise<void> {
    try {
      console.log('开始调整OPPO尾版模块');

      // 新增：如果没有上传尾版样式图片，直接跳过
      if (!this.images.footerStyle) {
        console.log('未上传尾版样式图片，跳过尾版模块调整');
        return;
      }

      // 调整尾版容器高度为807px
      footerFrame.resize(footerFrame.width, 807);
      
      // 清除尾版LOGO
      this.clearFooterLogo(footerFrame);
      
      // 插入尾版样式图片
      await this.insertFooterStyleImage(footerFrame, this.channel);
      
      console.log('OPPO尾版模块调整完成');
    } catch (error) {
      console.error('调整OPPO尾版模块失败:', error);
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
      // const channelData = channelImages[channel];
      // const eggBreakingData = channelData?.eggBreaking;

      const eggBreakingData = this.images.eggBreaking;
      
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
   * 创建活动规则按钮
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      
      NodeUtils.safeAppendChild(mainContainer, rulesContainer, '活动规则按钮添加');
      
    } catch (error) {
      console.error('创建活动规则按钮失败:', error);
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
   * 插入尾版样式图片
   */
  private async insertFooterStyleImage(footerFrame: FrameNode, channel: string): Promise<void> {
    try {
      // 获取上传的尾版样式图片
      // const channelData = channelImages[channel];
      // const footerStyleData = channelData?.footerStyle;

      const footerStyleData = this.images.footerStyle;
      
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

  private async createImageFromData(imageData: ChannelImageData, name: string): Promise<RectangleNode> {
    // 处理不同类型的图片数据
    let uint8Array: Uint8Array;
    if (typeof imageData.data === 'string') {
      // 如果是base64字符串，先解码
      const binaryString = atob(imageData.data);
      uint8Array = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
    } else {
      // 如果是number数组，直接转换
      uint8Array = new Uint8Array(imageData.data);
    }
    
    const imageNode = figma.createRectangle();
    imageNode.name = name;
    imageNode.resize(imageData.width, imageData.height);
    
    const imageHash = figma.createImage(uint8Array).hash;
    const imageFill: ImagePaint = {
      type: 'IMAGE',
      imageHash: imageHash,
      scaleMode: 'FILL'
    };
    
    imageNode.fills = [imageFill];
    
    return imageNode;
  }

  /**
   * VIVO渠道样式调整
   */
  private async applyVivoStyles(moduleFrame: FrameNode): Promise<void> {
    console.log(`VIVO样式调整: ${moduleFrame.name}`);
    // VIVO渠道特定样式调整将在后续版本实现
  }

  /**
   * VIVO渠道内容调整
   */
  private async applyVivoContent(moduleFrame: FrameNode): Promise<void> {
    console.log(`VIVO内容调整: ${moduleFrame.name}`);
    // VIVO渠道特定内容调整将在后续版本实现
  }

  /**
   * 小米渠道样式调整
   */
  private async applyXiaomiStyles(moduleFrame: FrameNode): Promise<void> {
    console.log(`小米样式调整: ${moduleFrame.name}`);
    // 小米渠道特定样式调整将在后续版本实现
  }

  /**
   * 小米渠道内容调整
   */
  private async applyXiaomiContent(moduleFrame: FrameNode): Promise<void> {
    console.log(`小米内容调整: ${moduleFrame.name}`);
    // 小米渠道特定内容调整将在后续版本实现
  }

  /**
   * OPPO渠道内容调整
   */
  private async applyOppoContent(moduleFrame: FrameNode): Promise<void> {
    console.log(`OPPO内容调整: ${moduleFrame.name}`);
    // OPPO渠道的内容调整主要在样式调整中完成
  }

  private positionChannelPrototype(prototype: FrameNode): void {
    prototype.x = this.sourcePrototype.x + this.sourcePrototype.width + 100;
    prototype.y = this.sourcePrototype.y;
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

}

// ==================== 工具函数 ====================

/**
 * 生成渠道特定版本的H5原型
 * @param channel 渠道名称 (oppo, vivo, xiaomi等)
 */
export async function generateChannelVersion(
  channel: string,
  images?: { eggBreaking?: ChannelImageData; footerStyle?: ChannelImageData }
): Promise<void> {
  try {
    console.log(`开始为${channel}渠道生成H5原型`);
    
    // 检查是否选中了H5原型容器
    const selectedPrototype = getSelectedPrototype();
    if (!selectedPrototype) {
      throw new Error('请先选中名为"H5原型"的容器');
    }
    
    // 初始化渠道图片数据
    // await initChannelImages();
    
    // 根据H5原型容器中的文本节点加载字体
    console.log('分析H5原型容器中的文本节点并加载字体...');
    await loadFontsFromPrototype(selectedPrototype);
    console.log('字体加载完成');
    
    // 创建渠道专用的H5原型生成器
    // const channelGenerator = new ChannelPrototypeGenerator(channel, selectedPrototype);

    // 创建渠道专用的H5原型生成器，传递图片数据
    const channelGenerator = new ChannelPrototypeGenerator(channel, selectedPrototype, images || {});
    
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