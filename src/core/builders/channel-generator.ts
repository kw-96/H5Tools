/// <reference types="@figma/plugin-typings" />

import { ChannelConfig, ChannelImageData, CONSTANTS } from '../types';
import { NodeUtils, ColorUtils } from './figma-utils';

// ==================== 渠道原型生成器 ====================

export class ChannelPrototypeGenerator {
  private channel: string;
  private sourcePrototype: FrameNode;
  private channelConfig: ChannelConfig;

  constructor(channel: string, sourcePrototype: FrameNode) {
    this.channel = channel;
    this.sourcePrototype = sourcePrototype;
    this.channelConfig = this.getChannelConfig(channel);
  }

  async generate(): Promise<void> {
    try {
      console.log(`开始生成 ${this.channel} 渠道版本`);
      
      // 1. 克隆原型
      const clonedPrototype = await this.clonePrototype();
      
      // 2. 应用渠道调整
      await this.applyChannelAdjustments(clonedPrototype);
      
      // 3. 定位渠道原型
      this.positionChannelPrototype(clonedPrototype);
      
      console.log(`${this.channel} 渠道版本生成完成`);
    } catch (error) {
      console.error(`生成 ${this.channel} 渠道版本失败:`, error);
      throw error;
    }
  }

  private async clonePrototype(): Promise<FrameNode> {
    const clonedNode = this.sourcePrototype.clone();
    
    if (clonedNode.type !== 'FRAME') {
      throw new Error('克隆的节点不是 FrameNode 类型');
    }
    
    const clonedPrototype = clonedNode as FrameNode;
    clonedPrototype.name = `H5原型-${this.channel}`;
    figma.currentPage.appendChild(clonedPrototype);
    
    return clonedPrototype;
  }

  private async applyChannelAdjustments(prototype: FrameNode): Promise<void> {
    const adaptiveModule = this.findAdaptiveModule(prototype);
    if (!adaptiveModule) {
      console.warn('未找到自适应模块容器');
      return;
    }

    await this.adjustAdaptiveModuleContent(adaptiveModule);
    this.resizeChannelPrototype(prototype, adaptiveModule);
    await this.applyChannelStyles(adaptiveModule);
    await this.applyChannelContent(adaptiveModule);
  }

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

  private async adjustAdaptiveModuleContent(adaptiveModule: FrameNode): Promise<void> {
    for (const child of adaptiveModule.children) {
      if (child.type === 'FRAME') {
        const moduleFrame = child as FrameNode;
        await this.adjustModuleStyles(moduleFrame);
        await this.adjustModuleContent(moduleFrame);
      }
    }
  }

  private resizeChannelPrototype(prototype: FrameNode, adaptiveModule: FrameNode): void {
    const targetWidth = Math.min(this.channelConfig.maxWidth, CONSTANTS.H5_WIDTH);
    const targetHeight = Math.min(this.channelConfig.maxHeight, adaptiveModule.height + 100);
    
    prototype.resize(targetWidth, targetHeight);
    adaptiveModule.resize(targetWidth, adaptiveModule.height);
  }

  private async applyChannelStyles(adaptiveModule: FrameNode): Promise<void> {
    switch (this.channel.toLowerCase()) {
      case 'oppo':
        await this.applyOppoStyles(adaptiveModule);
        break;
      case 'vivo':
        await this.applyVivoStyles(adaptiveModule);
        break;
      case 'xiaomi':
        await this.applyXiaomiStyles(adaptiveModule);
        break;
      default:
        console.log(`未定义 ${this.channel} 渠道的特殊样式`);
    }
  }

  private async applyChannelContent(adaptiveModule: FrameNode): Promise<void> {
    switch (this.channel.toLowerCase()) {
      case 'oppo':
        await this.applyOppoContent(adaptiveModule);
        break;
      case 'vivo':
        await this.applyVivoContent(adaptiveModule);
        break;
      case 'xiaomi':
        await this.applyXiaomiContent(adaptiveModule);
        break;
      default:
        console.log(`未定义 ${this.channel} 渠道的特殊内容`);
    }
  }

  private async adjustModuleStyles(moduleFrame: FrameNode): Promise<void> {
    if (moduleFrame.name.includes('九宫格')) {
      moduleFrame.cornerRadius = 8;
    }
    
    if (moduleFrame.name.includes('签到')) {
      moduleFrame.cornerRadius = 12;
    }
  }

  private async adjustModuleContent(moduleFrame: FrameNode): Promise<void> {
    const adjustText = (node: BaseNode): void => {
      if (node.type === 'TEXT') {
        const textNode = node as TextNode;
        if (this.channel.toLowerCase() === 'oppo') {
          textNode.fontSize = Math.max(14, (textNode.fontSize as number) * 0.9);
        }
      }
      
      if ('children' in node) {
        for (const child of node.children) {
          adjustText(child);
        }
      }
    };
    
    adjustText(moduleFrame);
  }

  private async applyOppoStyles(moduleFrame: FrameNode): Promise<void> {
    for (const child of moduleFrame.children) {
      if (child.type === 'FRAME') {
        const frame = child as FrameNode;
        
        if (frame.name.includes('头部')) {
          await this.adjustOppoHeaderModule(frame);
        } else if (frame.name.includes('九宫格')) {
          await this.adjustOppoNineGridModule(frame);
        } else if (frame.name.includes('底部')) {
          await this.adjustOppoFooterModule(frame);
        }
      }
    }
  }

  private async adjustOppoHeaderModule(headerFrame: FrameNode): Promise<void> {
    const maskRect = this.findMaskRectangle(headerFrame);
    if (maskRect) {
      const fills = maskRect.fills as Paint[];
      if (fills.length > 0 && fills[0].type === 'GRADIENT_LINEAR') {
        const gradient = fills[0] as GradientPaint;
        const newGradient: GradientPaint = {
          ...gradient,
          gradientStops: gradient.gradientStops.map(stop => ({
            ...stop,
            color: { ...stop.color, a: stop.color.a * 0.8 }
          }))
        };
        maskRect.fills = [newGradient];
      }
    }
  }

  private async adjustOppoNineGridModule(nineGridFrame: FrameNode): Promise<void> {
    const mainContainer = this.findNineGridMainContainer(nineGridFrame);
    if (!mainContainer) return;

    this.clearContainerContent(mainContainer);
    await this.insertEggBreakingImage(mainContainer, this.channel);
    const drawContainer = await this.createDrawContainer(mainContainer, nineGridFrame);
    const myPrizesContainer = await this.createMyPrizesContainer(mainContainer, drawContainer, nineGridFrame);
    await this.createRulesContainer(mainContainer, myPrizesContainer, nineGridFrame);
  }

  private async adjustOppoFooterModule(footerFrame: FrameNode): Promise<void> {
    this.clearFooterLogo(footerFrame);
    await this.insertFooterStyleImage(footerFrame, this.channel);
  }

  private findMaskRectangle(container: FrameNode): RectangleNode | null {
    const findMask = (node: BaseNode): RectangleNode | null => {
      if (node.type === 'RECTANGLE' && node.name.includes('羽化')) {
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

  private findNineGridMainContainer(nineGridFrame: FrameNode): FrameNode | null {
    const findContainer = (node: BaseNode): FrameNode | null => {
      if (node.type === 'FRAME' && node.name.includes('九宫格容器')) {
        return node as FrameNode;
      }
      
      if ('children' in node) {
        for (const child of node.children) {
          const result = findContainer(child);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    return findContainer(nineGridFrame);
  }

  private clearContainerContent(container: FrameNode): void {
    const childrenToRemove = [...container.children];
    for (const child of childrenToRemove) {
      try {
        child.remove();
      } catch (error) {
        console.warn('移除子元素失败:', error);
      }
    }
  }

  private async insertEggBreakingImage(container: FrameNode, channel: string): Promise<void> {
    try {
      const channelImages = await figma.clientStorage.getAsync('channelImages') || {};
      const imageData = channelImages[channel]?.eggBreaking;
      
      if (imageData) {
        const eggBreakingNode = await this.createImageFromData(imageData, '砸蛋图片');
        eggBreakingNode.resize(container.width, 400);
        eggBreakingNode.x = 0;
        eggBreakingNode.y = 0;
        
        NodeUtils.safeAppendChild(container, eggBreakingNode, '砸蛋图片添加');
      }
    } catch (error) {
      console.error('插入砸蛋图片失败:', error);
    }
  }

  private async createDrawContainer(mainContainer: FrameNode, nineGridFrame: FrameNode): Promise<FrameNode | null> {
    try {
      const drawContainer = NodeUtils.createFrame('抽奖容器', mainContainer.width - 40, 200);
      drawContainer.x = 20;
      drawContainer.y = 420;
      drawContainer.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 }, 0.9)];
      drawContainer.cornerRadius = 12;
      
      NodeUtils.setupAutoLayout(drawContainer, 'HORIZONTAL', 20, 20);

      const drawTimesText = await NodeUtils.createText('今日抽奖次数: 3/3', 16, 'Medium');
      drawTimesText.fills = [ColorUtils.createSolidFill({ r: 0.2, g: 0.2, b: 0.2 })];
      NodeUtils.safeAppendChild(drawContainer, drawTimesText, '抽奖次数文本添加');

      const buttonImage = await this.copyButtonImageFromGameInfo(nineGridFrame);
      if (buttonImage) {
        buttonImage.resize(120, 40);
        NodeUtils.safeAppendChild(drawContainer, buttonImage, '抽奖按钮添加');
      } else {
        const defaultButton = NodeUtils.createFrame('默认抽奖按钮', 120, 40);
        defaultButton.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.4, b: 0.3 })];
        defaultButton.cornerRadius = 20;
        
        const buttonText = await NodeUtils.createText('立即抽奖', 14, 'Bold');
        buttonText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
        buttonText.resize(120, buttonText.height);
        buttonText.textAlignHorizontal = "CENTER";
        buttonText.y = (40 - buttonText.height) / 2;
        
        NodeUtils.safeAppendChild(defaultButton, buttonText, '默认按钮文本添加');
        NodeUtils.safeAppendChild(drawContainer, defaultButton, '默认抽奖按钮添加');
      }

      NodeUtils.safeAppendChild(mainContainer, drawContainer, '抽奖容器添加');
      return drawContainer;
    } catch (error) {
      console.error('创建抽奖容器失败:', error);
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async createMyPrizesContainer(mainContainer: FrameNode, drawContainer: FrameNode | null, _nineGridFrame: FrameNode): Promise<FrameNode | null> {
    try {
      const yPosition = drawContainer ? drawContainer.y + drawContainer.height + 20 : 420;
      
      const myPrizesContainer = NodeUtils.createFrame('我的奖品容器', mainContainer.width - 40, 150);
      myPrizesContainer.x = 20;
      myPrizesContainer.y = yPosition;
      myPrizesContainer.fills = [ColorUtils.createSolidFill({ r: 0.98, g: 0.98, b: 1 }, 0.8)];
      myPrizesContainer.cornerRadius = 12;
      
      NodeUtils.setupAutoLayout(myPrizesContainer, 'VERTICAL', 15, 20);

      const titleText = await NodeUtils.createText('我的奖品', 18, 'Bold');
      titleText.fills = [ColorUtils.createSolidFill({ r: 0.2, g: 0.2, b: 0.2 })];
      NodeUtils.safeAppendChild(myPrizesContainer, titleText, '我的奖品标题添加');

      const prizesListContainer = NodeUtils.createFrame('奖品列表', myPrizesContainer.width - 40, 80);
      prizesListContainer.fills = [];
      NodeUtils.setupAutoLayout(prizesListContainer, 'HORIZONTAL', 10, 0);

      for (let i = 0; i < 4; i++) {
        const prizeItem = NodeUtils.createFrame(`奖品${i + 1}`, 60, 80);
        prizeItem.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 0.95 })];
        prizeItem.cornerRadius = 8;
        
        const prizeText = await NodeUtils.createText(`奖品${i + 1}`, 12, 'Regular');
        prizeText.resize(60, prizeText.height);
        prizeText.textAlignHorizontal = "CENTER";
        prizeText.y = (80 - prizeText.height) / 2;
        
        NodeUtils.safeAppendChild(prizeItem, prizeText, '奖品文本添加');
        NodeUtils.safeAppendChild(prizesListContainer, prizeItem, `奖品${i + 1}添加`);
      }

      NodeUtils.safeAppendChild(myPrizesContainer, prizesListContainer, '奖品列表容器添加');
      NodeUtils.safeAppendChild(mainContainer, myPrizesContainer, '我的奖品容器添加');
      
      return myPrizesContainer;
    } catch (error) {
      console.error('创建我的奖品容器失败:', error);
      return null;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async createRulesContainer(mainContainer: FrameNode, myPrizesContainer: FrameNode | null, _nineGridFrame: FrameNode): Promise<void> {
    try {
      const yPosition = myPrizesContainer ? myPrizesContainer.y + myPrizesContainer.height + 20 : 590;
      
      const rulesContainer = NodeUtils.createFrame('规则容器', mainContainer.width - 40, 120);
      rulesContainer.x = 20;
      rulesContainer.y = yPosition;
      rulesContainer.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.98, b: 0.95 }, 0.8)];
      rulesContainer.cornerRadius = 12;
      
      NodeUtils.setupAutoLayout(rulesContainer, 'VERTICAL', 10, 15);

      const titleText = await NodeUtils.createText('活动规则', 16, 'Bold');
      titleText.fills = [ColorUtils.createSolidFill({ r: 0.2, g: 0.2, b: 0.2 })];
      NodeUtils.safeAppendChild(rulesContainer, titleText, '规则标题添加');

      const rulesText = await NodeUtils.createText(
        '1. 每日可免费抽奖3次\n2. 中奖后请及时领取奖品\n3. 活动最终解释权归平台所有',
        14,
        'Regular'
      );
      rulesText.fills = [ColorUtils.createSolidFill({ r: 0.4, g: 0.4, b: 0.4 })];
      rulesText.resize(rulesContainer.width - 30, rulesText.height);
      rulesText.textAlignHorizontal = "LEFT";
      
      NodeUtils.safeAppendChild(rulesContainer, rulesText, '规则内容添加');
      NodeUtils.safeAppendChild(mainContainer, rulesContainer, '规则容器添加');
      
      const totalHeight = rulesContainer.y + rulesContainer.height + 20;
      mainContainer.resize(mainContainer.width, totalHeight);
    } catch (error) {
      console.error('创建规则容器失败:', error);
    }
  }

  private async copyButtonImageFromGameInfo(nineGridFrame: FrameNode): Promise<RectangleNode | null> {
    try {
      const findGameInfoModule = (node: BaseNode): FrameNode | null => {
        if (node.type === 'FRAME' && node.name.includes('游戏信息')) {
          return node as FrameNode;
        }
        
        if ('children' in node) {
          for (const child of node.children) {
            const result = findGameInfoModule(child);
            if (result) return result;
          }
        }
        
        return null;
      };

      const findAndCloneButtonImage = (node: BaseNode): RectangleNode | null => {
        if (node.type === 'RECTANGLE' && 
            (node.name.includes('按钮') || node.name.includes('下载'))) {
          const buttonImage = node as RectangleNode;
          return buttonImage.clone() as RectangleNode;
        }
        
        if ('children' in node) {
          for (const child of node.children) {
            const result = findAndCloneButtonImage(child);
            if (result) return result;
          }
        }
        
        return null;
      };

      let currentNode: BaseNode = nineGridFrame;
      while (currentNode.parent && currentNode.parent.type !== 'PAGE') {
        currentNode = currentNode.parent;
      }

      const gameInfoModule = findGameInfoModule(currentNode);
      if (gameInfoModule) {
        return findAndCloneButtonImage(gameInfoModule);
      }
      
      return null;
    } catch (error) {
      console.error('复制按钮图片失败:', error);
      return null;
    }
  }

  private clearFooterLogo(footerFrame: FrameNode): void {
    try {
      const logoNodesToRemove: BaseNode[] = [];
      
      const findLogo = (node: BaseNode): void => {
        if (node.name.includes('logo') || node.name.includes('Logo')) {
          logoNodesToRemove.push(node);
        }
        
        if ('children' in node) {
          for (const child of node.children) {
            findLogo(child);
          }
        }
      };
      
      findLogo(footerFrame);
      
      for (const logoNode of logoNodesToRemove) {
        logoNode.remove();
      }
    } catch (error) {
      console.error('清除底部logo失败:', error);
    }
  }

  private async insertFooterStyleImage(footerFrame: FrameNode, channel: string): Promise<void> {
    try {
      const channelImages = await figma.clientStorage.getAsync('channelImages') || {};
      const imageData = channelImages[channel]?.footerStyle;
      
      if (imageData) {
        const footerStyleNode = await this.createImageFromData(imageData, '底部样式图片');
        footerStyleNode.resize(footerFrame.width, footerFrame.height);
        footerStyleNode.x = 0;
        footerStyleNode.y = 0;
        
        NodeUtils.safeAppendChild(footerFrame, footerStyleNode, '底部样式图片添加');
      }
    } catch (error) {
      console.error('插入底部样式图片失败:', error);
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async applyOppoContent(_moduleFrame: FrameNode): Promise<void> {
    console.log('应用 OPPO 渠道内容');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async applyVivoStyles(_moduleFrame: FrameNode): Promise<void> {
    console.log('应用 VIVO 渠道样式');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async applyVivoContent(_moduleFrame: FrameNode): Promise<void> {
    console.log('应用 VIVO 渠道内容');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async applyXiaomiStyles(_moduleFrame: FrameNode): Promise<void> {
    console.log('应用小米渠道样式');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async applyXiaomiContent(_moduleFrame: FrameNode): Promise<void> {
    console.log('应用小米渠道内容');
  }

  private positionChannelPrototype(prototype: FrameNode): void {
    prototype.x = this.sourcePrototype.x + this.sourcePrototype.width + 100;
    prototype.y = this.sourcePrototype.y;
  }

  private getChannelConfig(channel: string): ChannelConfig {
    const configs: Record<string, ChannelConfig> = {
      oppo: {
        name: 'OPPO',
        maxWidth: 1080,
        maxHeight: 1920,
        aspectRatio: 9/16,
        supportedFormats: ['jpg', 'png'],
        maxFileSize: 2 * 1024 * 1024,
        requirements: {
          minWidth: 720,
          minHeight: 1280,
          preferredWidth: 1080,
          preferredHeight: 1920
        }
      },
      vivo: {
        name: 'VIVO',
        maxWidth: 1080,
        maxHeight: 1920,
        aspectRatio: 9/16,
        supportedFormats: ['jpg', 'png'],
        maxFileSize: 2 * 1024 * 1024,
        requirements: {
          minWidth: 720,
          minHeight: 1280,
          preferredWidth: 1080,
          preferredHeight: 1920
        }
      },
      xiaomi: {
        name: '小米',
        maxWidth: 1080,
        maxHeight: 1920,
        aspectRatio: 9/16,
        supportedFormats: ['jpg', 'png'],
        maxFileSize: 2 * 1024 * 1024,
        requirements: {
          minWidth: 720,
          minHeight: 1280,
          preferredWidth: 1080,
          preferredHeight: 1920
        }
      }
    };

    return configs[channel.toLowerCase()] || configs.oppo;
  }
}

// ==================== 工具函数 ====================

export async function generateChannelVersion(channel: string): Promise<void> {
  try {
    const selectedPrototype = getSelectedPrototype();
    if (!selectedPrototype) {
      figma.ui.postMessage({
        type: 'error',
        message: '请先选择一个H5原型'
      });
      return;
    }

    await loadFontsFromPrototype(selectedPrototype);

    const generator = new ChannelPrototypeGenerator(channel, selectedPrototype);
    await generator.generate();

    figma.ui.postMessage({
      type: 'success',
      message: `${channel} 渠道版本生成完成`
    });
  } catch (error) {
    console.error('生成渠道版本失败:', error);
    figma.ui.postMessage({
      type: 'error',
      message: `生成渠道版本失败: ${error}`
    });
  }
}

async function loadFontsFromPrototype(prototypeContainer: FrameNode): Promise<void> {
  const uniqueFonts = new Set<string>();

  const collectFonts = (node: BaseNode): void => {
    if (node.type === 'TEXT') {
      const textNode = node as TextNode;
      const fontName = textNode.fontName as FontName;
      
      if (typeof fontName === 'object' && fontName.family && fontName.style) {
        const fontKey = `${fontName.family}-${fontName.style}`;
        uniqueFonts.add(fontKey);
      }
    }
    
    if ('children' in node) {
      for (const child of node.children) {
        collectFonts(child);
      }
    }
  };

  collectFonts(prototypeContainer);

  const fontLoadPromises = Array.from(uniqueFonts).map(fontKey => {
    const [family, style] = fontKey.split('-');
    return figma.loadFontAsync({ family, style }).catch(error => {
      console.warn(`加载字体失败: ${family} ${style}`, error);
    });
  });

  await Promise.all(fontLoadPromises);
}

function getSelectedPrototype(): FrameNode | null {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    return null;
  }

  const selectedNode = selection[0];
  
  if (selectedNode.type === 'FRAME' && selectedNode.name.includes('H5原型')) {
    return selectedNode as FrameNode;
  }

  if ('children' in selectedNode) {
    for (const child of selectedNode.children) {
      if (child.type === 'FRAME' && child.name.includes('H5原型')) {
        return child as FrameNode;
      }
    }
  }

  return null;
} 