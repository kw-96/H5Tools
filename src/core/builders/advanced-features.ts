// 渠道美术-H5延展工具 - 高级功能模块

import { 
  ImageInfo, 
  H5Config, 
  NineGridConfig,
  BatchProcessConfig
} from '../types';
import { ValidationUtils } from '../utils';
import { NodeUtils, FontManager } from './figma-utils';
import { FeatherMaskUtils } from './feather-mask-utils';

// ==================== 高级功能类 ====================

export class AdvancedFeatures {
  
  /**
   * 创建九宫格布局
   * @param config 九宫格配置
   * @param parent 父容器
   * @returns 九宫格容器节点
   */
  static async createNineGrid(config: NineGridConfig, parent?: BaseNode & ChildrenMixin): Promise<FrameNode> {
    try {
      // 创建九宫格容器
      const gridContainer = figma.createFrame();
      gridContainer.name = config.name || '九宫格布局';
      gridContainer.resize(config.totalWidth, config.totalHeight);
      
      // 设置容器背景
      if (config.backgroundColor) {
        gridContainer.fills = [{
          type: 'SOLID',
          color: config.backgroundColor
        }];
      }
      
      // 计算单个格子尺寸
      const cellWidth = (config.totalWidth - config.gap * 2) / 3;
      const cellHeight = (config.totalHeight - config.gap * 2) / 3;
      
      // 创建9个格子
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const index = row * 3 + col;
          const cell = await this.createGridCell(
            index,
            cellWidth,
            cellHeight,
            col * (cellWidth + config.gap),
            row * (cellHeight + config.gap),
            config.images?.[index],
            config.cellConfig
          );
          
          gridContainer.appendChild(cell);
        }
      }
      
      // 添加到父容器
      if (parent) {
        NodeUtils.safeAppendChild(parent, gridContainer, '九宫格容器添加');
      }
      
      return gridContainer;
    } catch (error) {
      console.error('创建九宫格失败:', error);
      throw error;
    }
  }

  /**
   * 创建单个九宫格格子
   * @param index 格子索引
   * @param width 宽度
   * @param height 高度
   * @param x X坐标
   * @param y Y坐标
   * @param imageInfo 图片信息（可选）
   * @param cellConfig 格子配置（可选）
   * @returns 格子节点
   */
  private static async createGridCell(
    index: number,
    width: number,
    height: number,
    x: number,
    y: number,
    imageInfo?: ImageInfo,
    cellConfig?: Record<string, unknown>
  ): Promise<FrameNode> {
    const cell = figma.createFrame();
    cell.name = `格子_${index + 1}`;
    cell.resize(width, height);
    cell.x = x;
    cell.y = y;
    
    // 设置格子背景
    const bgColor = cellConfig?.backgroundColor as RGB || { r: 0.95, g: 0.95, b: 0.95 };
    cell.fills = [{
      type: 'SOLID',
      color: bgColor
    }];
    
    // 设置圆角
    const cornerRadius = cellConfig?.cornerRadius as number || 8;
    cell.cornerRadius = cornerRadius;
    
    // 添加图片（如果有）
    if (imageInfo) {
      try {
        const imageNode = figma.createRectangle();
        imageNode.name = `图片_${index + 1}`;
        imageNode.resize(width - 16, height - 16); // 留出边距
        imageNode.x = 8;
        imageNode.y = 8;
        imageNode.cornerRadius = cornerRadius - 4;
        
        // 这里应该设置图片填充，但需要实际的图片数据
        // 暂时使用占位符颜色
        imageNode.fills = [{
          type: 'SOLID',
          color: { r: 0.8, g: 0.8, b: 0.9 }
        }];
        
        cell.appendChild(imageNode);
        
        // 添加羽化遮罩（如果启用）
        if (cellConfig?.enableFeatherMask) {
          FeatherMaskUtils.addFeatherMaskToNodeSimple(imageNode);
        }
      } catch (error) {
        console.warn(`添加图片到格子${index + 1}失败:`, error);
      }
    }
    
    // 添加文本标签（如果有）
    if (cellConfig?.showLabel) {
      try {
        await FontManager.loadInterFonts();
        const label = figma.createText();
        label.name = `标签_${index + 1}`;
        label.characters = cellConfig.labelText as string || `${index + 1}`;
        label.fontSize = cellConfig.labelFontSize as number || 14;
        label.fontName = { family: 'Inter', style: 'Medium' };
        
        // 设置文本颜色
        const textColor = cellConfig?.labelColor as RGB || { r: 0.2, g: 0.2, b: 0.2 };
        label.fills = [{
          type: 'SOLID',
          color: textColor
        }];
        
        // 居中对齐
        label.textAlignHorizontal = 'CENTER';
        label.textAlignVertical = 'CENTER';
        
        // 定位到格子底部
        label.resize(width, 20);
        label.x = 0;
        label.y = height - 30;
        
        cell.appendChild(label);
      } catch (error) {
        console.warn(`添加标签到格子${index + 1}失败:`, error);
      }
    }
    
    return cell;
  }

  /**
   * 批量处理图片
   * @param config 批处理配置
   * @returns 处理结果
   */
  static async batchProcessImages(config: BatchProcessConfig): Promise<{
    success: number;
    failed: number;
    results: Array<{ index: number; success: boolean; error?: string }>;
  }> {
    const results: Array<{ index: number; success: boolean; error?: string }> = [];
    let success = 0;
    let failed = 0;

    for (let i = 0; i < config.images.length; i++) {
      try {
        const imageInfo = config.images[i];
        
        // 验证图片
        if (!ValidationUtils.isValidImageInfo(imageInfo)) {
          throw new Error('无效的图片信息');
        }
        
        // 应用处理操作
        await this.processImage(imageInfo, config.operations);
        
        results.push({ index: i, success: true });
        success++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        results.push({ index: i, success: false, error: errorMessage });
        failed++;
        console.error(`处理图片${i}失败:`, error);
      }
    }

    return { success, failed, results };
  }

  /**
   * 处理单个图片
   * @param imageInfo 图片信息
   * @param operations 操作列表
   */
  private static async processImage(
    imageInfo: ImageInfo, 
    operations: Array<{ type: string; params: Record<string, unknown> }>
  ): Promise<void> {
    for (const operation of operations) {
      switch (operation.type) {
        case 'resize':
          await this.resizeImage(imageInfo, operation.params);
          break;
        case 'compress':
          await this.compressImage(imageInfo, operation.params);
          break;
        case 'addWatermark':
          await this.addWatermark(imageInfo, operation.params);
          break;
        case 'adjustColors':
          await this.adjustColors(imageInfo, operation.params);
          break;
        default:
          console.warn(`未知的操作类型: ${operation.type}`);
      }
    }
  }

  /**
   * 调整图片尺寸
   * @param imageInfo 图片信息
   * @param params 参数
   */
  private static async resizeImage(
    imageInfo: ImageInfo, 
    params: Record<string, unknown>
  ): Promise<void> {
    const targetWidth = params.width as number;
    const targetHeight = params.height as number;
    const maintainAspectRatio = params.maintainAspectRatio as boolean || true;

    if (maintainAspectRatio) {
      const aspectRatio = imageInfo.width / imageInfo.height;
      if (targetWidth && !targetHeight) {
        imageInfo.height = Math.round(targetWidth / aspectRatio);
        imageInfo.width = targetWidth;
      } else if (targetHeight && !targetWidth) {
        imageInfo.width = Math.round(targetHeight * aspectRatio);
        imageInfo.height = targetHeight;
      } else if (targetWidth && targetHeight) {
        // 选择较小的缩放比例以保持宽高比
        const scaleX = targetWidth / imageInfo.width;
        const scaleY = targetHeight / imageInfo.height;
        const scale = Math.min(scaleX, scaleY);
        
        imageInfo.width = Math.round(imageInfo.width * scale);
        imageInfo.height = Math.round(imageInfo.height * scale);
      }
    } else {
      if (targetWidth) imageInfo.width = targetWidth;
      if (targetHeight) imageInfo.height = targetHeight;
    }
  }

  /**
   * 压缩图片
   * @param imageInfo 图片信息
   * @param params 参数
   */
  private static async compressImage(
    imageInfo: ImageInfo, 
    params: Record<string, unknown>
  ): Promise<void> {
    const quality = params.quality as number || 0.8;
    const maxFileSize = params.maxFileSize as number;

    // 模拟压缩效果（实际实现需要图片处理库）
    if (imageInfo.fileSize && maxFileSize && imageInfo.fileSize > maxFileSize) {
      const compressionRatio = maxFileSize / imageInfo.fileSize;
      imageInfo.fileSize = Math.round(imageInfo.fileSize * compressionRatio * quality);
    }
  }

  /**
   * 添加水印
   * @param imageInfo 图片信息
   * @param params 参数
   */
  private static async addWatermark(
    imageInfo: ImageInfo, 
    params: Record<string, unknown>
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const watermarkText = params.text as string || '水印';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const position = params.position as string || 'bottom-right';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const opacity = params.opacity as number || 0.5;

    // 这里应该实现实际的水印添加逻辑
    // 暂时使用日志记录，实际实现时应该调用图片处理API
    // console.log(`为图片 ${imageInfo.name} 添加水印: ${watermarkText}, 位置: ${position}, 透明度: ${opacity}`);
    
    // 占位符实现，避免未使用参数和变量警告
    void imageInfo;
    void watermarkText;
    void position;
    void opacity;
  }

  /**
   * 调整颜色
   * @param imageInfo 图片信息
   * @param params 参数
   */
  private static async adjustColors(
    imageInfo: ImageInfo, 
    params: Record<string, unknown>
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const brightness = params.brightness as number || 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const contrast = params.contrast as number || 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const saturation = params.saturation as number || 0;

    // 这里应该实现实际的颜色调整逻辑
    // 暂时使用日志记录，实际实现时应该调用图片处理API
    // console.log(`调整图片 ${imageInfo.name} 颜色: 亮度${brightness}, 对比度${contrast}, 饱和度${saturation}`);
    
    // 占位符实现，避免未使用参数和变量警告
    void imageInfo;
    void brightness;
    void contrast;
    void saturation;
  }

  /**
   * 创建复杂布局
   * @param config H5配置
   * @param layoutType 布局类型
   * @returns 布局容器
   */
  static async createComplexLayout(
    config: H5Config, 
    layoutType: 'magazine' | 'card' | 'timeline' | 'masonry'
  ): Promise<FrameNode> {
    const container = figma.createFrame();
    container.name = `${layoutType}布局`;
    container.resize(config.canvasWidth, config.canvasHeight);

    switch (layoutType) {
      case 'magazine':
        return await this.createMagazineLayout(container, config);
      case 'card':
        return await this.createCardLayout(container, config);
      case 'timeline':
        return await this.createTimelineLayout(container, config);
      case 'masonry':
        return await this.createMasonryLayout(container, config);
      default:
        throw new Error(`不支持的布局类型: ${layoutType}`);
    }
  }

  /**
   * 创建杂志风格布局
   * @param container 容器
   * @param config 配置
   * @returns 布局容器
   */
  private static async createMagazineLayout(container: FrameNode, config: H5Config): Promise<FrameNode> {
    // 杂志风格：大图+小图+文字的组合布局
    const sections = [
      { type: 'hero', height: config.canvasHeight * 0.4 },
      { type: 'content', height: config.canvasHeight * 0.4 },
      { type: 'footer', height: config.canvasHeight * 0.2 }
    ];

    let currentY = 0;
    for (const section of sections) {
      const sectionFrame = figma.createFrame();
      sectionFrame.name = `${section.type}区域`;
      sectionFrame.resize(config.canvasWidth, section.height);
      sectionFrame.y = currentY;
      
      // 根据区域类型添加内容
      if (section.type === 'hero') {
        await this.addHeroContent(sectionFrame, config);
      } else if (section.type === 'content') {
        await this.addContentGrid(sectionFrame, config);
      } else if (section.type === 'footer') {
        await this.addFooterContent(sectionFrame, config);
      }
      
      container.appendChild(sectionFrame);
      currentY += section.height;
    }

    return container;
  }

  /**
   * 创建卡片布局
   * @param container 容器
   * @param config 配置
   * @returns 布局容器
   */
  private static async createCardLayout(container: FrameNode, config: H5Config): Promise<FrameNode> {
    // 卡片布局：垂直排列的卡片
    const cardHeight = 200;
    const cardGap = 16;
    const cardsPerPage = Math.floor((config.canvasHeight - 40) / (cardHeight + cardGap));

    for (let i = 0; i < cardsPerPage; i++) {
      const card = figma.createFrame();
      card.name = `卡片_${i + 1}`;
      card.resize(config.canvasWidth - 32, cardHeight);
      card.x = 16;
      card.y = 20 + i * (cardHeight + cardGap);
      card.cornerRadius = 12;
      
      // 设置卡片背景
      card.fills = [{
        type: 'SOLID',
        color: { r: 1, g: 1, b: 1 }
      }];
      
      // 添加阴影
      card.effects = [{
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.1 },
        offset: { x: 0, y: 2 },
        radius: 8,
        visible: true,
        blendMode: 'NORMAL'
      }];
      
      container.appendChild(card);
    }

    return container;
  }

  /**
   * 创建时间线布局
   * @param container 容器
   * @param config 配置
   * @returns 布局容器
   */
  private static async createTimelineLayout(container: FrameNode, config: H5Config): Promise<FrameNode> {
    // 时间线布局：左右交替的内容块
    const itemHeight = 150;
    const itemGap = 20;
    const timelineWidth = 4;
    
    // 创建中央时间线
    const timeline = figma.createRectangle();
    timeline.name = '时间线';
    timeline.resize(timelineWidth, config.canvasHeight);
    timeline.x = config.canvasWidth / 2 - timelineWidth / 2;
    timeline.fills = [{
      type: 'SOLID',
      color: { r: 0.2, g: 0.4, b: 0.8 }
    }];
    container.appendChild(timeline);

    // 添加时间线项目
    const itemsCount = Math.floor(config.canvasHeight / (itemHeight + itemGap));
    for (let i = 0; i < itemsCount; i++) {
      const isLeft = i % 2 === 0;
      const item = figma.createFrame();
      item.name = `时间线项目_${i + 1}`;
      item.resize(config.canvasWidth / 2 - 40, itemHeight);
      item.x = isLeft ? 20 : config.canvasWidth / 2 + 20;
      item.y = 20 + i * (itemHeight + itemGap);
      item.cornerRadius = 8;
      
      item.fills = [{
        type: 'SOLID',
        color: { r: 0.95, g: 0.95, b: 0.95 }
      }];
      
      container.appendChild(item);
    }

    return container;
  }

  /**
   * 创建瀑布流布局
   * @param container 容器
   * @param config 配置
   * @returns 布局容器
   */
  private static async createMasonryLayout(container: FrameNode, config: H5Config): Promise<FrameNode> {
    // 瀑布流布局：不规则高度的网格
    const columns = 2;
    const columnWidth = (config.canvasWidth - 48) / columns; // 16px边距 + 16px间隙
    const columnHeights = new Array(columns).fill(20);

    for (let i = 0; i < 10; i++) { // 创建10个项目
      const randomHeight = 120 + Math.random() * 100; // 随机高度
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      
      const item = figma.createFrame();
      item.name = `瀑布流项目_${i + 1}`;
      item.resize(columnWidth, randomHeight);
      item.x = 16 + shortestColumn * (columnWidth + 16);
      item.y = columnHeights[shortestColumn];
      item.cornerRadius = 8;
      
      item.fills = [{
        type: 'SOLID',
        color: { 
          r: 0.8 + Math.random() * 0.2, 
          g: 0.8 + Math.random() * 0.2, 
          b: 0.8 + Math.random() * 0.2 
        }
      }];
      
      container.appendChild(item);
      columnHeights[shortestColumn] += randomHeight + 16;
    }

    return container;
  }

  /**
   * 添加英雄区域内容
   * @param container 容器
   * @param config 配置
   */
  private static async addHeroContent(container: FrameNode, config: H5Config): Promise<void> {
    // 添加大背景图
    const bgRect = figma.createRectangle();
    bgRect.name = '英雄背景';
    bgRect.resize(container.width, container.height);
    bgRect.fills = [{
      type: 'SOLID',
      color: { r: 0.1, g: 0.2, b: 0.4 }
    }];
    container.appendChild(bgRect);

    // 添加标题
    try {
      await FontManager.loadInterFonts();
      const title = figma.createText();
      title.name = '英雄标题';
      title.characters = config.title || '精彩内容';
      title.fontSize = 32;
      title.fontName = { family: 'Inter', style: 'Bold' };
      title.fills = [{
        type: 'SOLID',
        color: { r: 1, g: 1, b: 1 }
      }];
      title.textAlignHorizontal = 'CENTER';
      
      // 居中定位
      title.resize(container.width - 40, 40);
      title.x = 20;
      title.y = container.height / 2 - 20;
      
      container.appendChild(title);
    } catch (error) {
      console.warn('添加英雄标题失败:', error);
    }
  }

  /**
   * 添加内容网格
   * @param container 容器
   * @param _config 配置（未使用）
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async addContentGrid(container: FrameNode, _config: H5Config): Promise<void> {
    const gridCols = 2;
    const gridRows = 2;
    const cellWidth = (container.width - 48) / gridCols;
    const cellHeight = (container.height - 48) / gridRows;

    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const cell = figma.createFrame();
        cell.name = `内容格子_${row * gridCols + col + 1}`;
        cell.resize(cellWidth, cellHeight);
        cell.x = 16 + col * (cellWidth + 16);
        cell.y = 16 + row * (cellHeight + 16);
        cell.cornerRadius = 8;
        
        cell.fills = [{
          type: 'SOLID',
          color: { r: 0.9, g: 0.9, b: 0.9 }
        }];
        
        container.appendChild(cell);
      }
    }
  }

  /**
   * 添加底部内容
   * @param container 容器
   * @param _config 配置（未使用）
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private static async addFooterContent(container: FrameNode, _config: H5Config): Promise<void> {
    // 添加底部背景
    const bgRect = figma.createRectangle();
    bgRect.name = '底部背景';
    bgRect.resize(container.width, container.height);
    bgRect.fills = [{
      type: 'SOLID',
      color: { r: 0.95, g: 0.95, b: 0.95 }
    }];
    container.appendChild(bgRect);

    // 添加底部文字
    try {
      await FontManager.loadInterFonts();
      const footerText = figma.createText();
      footerText.name = '底部文字';
      footerText.characters = '© 2024 H5Tools. All rights reserved.';
      footerText.fontSize = 12;
      footerText.fontName = { family: 'Inter', style: 'Regular' };
      footerText.fills = [{
        type: 'SOLID',
        color: { r: 0.5, g: 0.5, b: 0.5 }
      }];
      footerText.textAlignHorizontal = 'CENTER';
      
      footerText.resize(container.width, 20);
      footerText.y = container.height / 2 - 10;
      
      container.appendChild(footerText);
    } catch (error) {
      console.warn('添加底部文字失败:', error);
    }
  }
} 