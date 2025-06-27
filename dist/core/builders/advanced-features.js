// 渠道美术-H5延展工具 - 高级功能模块
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ValidationUtils } from '../utils';
import { FontManager } from './figma-utils';
// ==================== 高级功能类 ====================
export class AdvancedFeatures {
    /**
     * 批量处理图片
     * @param config 批处理配置
     * @returns 处理结果
     */
    static batchProcessImages(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const results = [];
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
                    yield this.processImage(imageInfo, config.operations);
                    results.push({ index: i, success: true });
                    success++;
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : '未知错误';
                    results.push({ index: i, success: false, error: errorMessage });
                    failed++;
                    console.error(`处理图片${i}失败:`, error);
                }
            }
            return { success, failed, results };
        });
    }
    /**
     * 处理单个图片
     * @param imageInfo 图片信息
     * @param operations 操作列表
     */
    static processImage(imageInfo, operations) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const operation of operations) {
                switch (operation.type) {
                    case 'resize':
                        yield this.resizeImage(imageInfo, operation.params);
                        break;
                    case 'compress':
                        yield this.compressImage(imageInfo, operation.params);
                        break;
                    case 'addWatermark':
                        yield this.addWatermark(imageInfo, operation.params);
                        break;
                    case 'adjustColors':
                        yield this.adjustColors(imageInfo, operation.params);
                        break;
                    default:
                        console.warn(`未知的操作类型: ${operation.type}`);
                }
            }
        });
    }
    /**
     * 调整图片尺寸
     * @param imageInfo 图片信息
     * @param params 参数
     */
    static resizeImage(imageInfo, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const targetWidth = params.width;
            const targetHeight = params.height;
            const maintainAspectRatio = params.maintainAspectRatio || true;
            if (maintainAspectRatio) {
                const aspectRatio = imageInfo.width / imageInfo.height;
                if (targetWidth && !targetHeight) {
                    imageInfo.height = Math.round(targetWidth / aspectRatio);
                    imageInfo.width = targetWidth;
                }
                else if (targetHeight && !targetWidth) {
                    imageInfo.width = Math.round(targetHeight * aspectRatio);
                    imageInfo.height = targetHeight;
                }
                else if (targetWidth && targetHeight) {
                    // 选择较小的缩放比例以保持宽高比
                    const scaleX = targetWidth / imageInfo.width;
                    const scaleY = targetHeight / imageInfo.height;
                    const scale = Math.min(scaleX, scaleY);
                    imageInfo.width = Math.round(imageInfo.width * scale);
                    imageInfo.height = Math.round(imageInfo.height * scale);
                }
            }
            else {
                if (targetWidth)
                    imageInfo.width = targetWidth;
                if (targetHeight)
                    imageInfo.height = targetHeight;
            }
        });
    }
    /**
     * 压缩图片
     * @param imageInfo 图片信息
     * @param params 参数
     */
    static compressImage(imageInfo, params) {
        return __awaiter(this, void 0, void 0, function* () {
            const quality = params.quality || 0.8;
            const maxFileSize = params.maxFileSize;
            // 模拟压缩效果（实际实现需要图片处理库）
            if (imageInfo.fileSize && maxFileSize && imageInfo.fileSize > maxFileSize) {
                const compressionRatio = maxFileSize / imageInfo.fileSize;
                imageInfo.fileSize = Math.round(imageInfo.fileSize * compressionRatio * quality);
            }
        });
    }
    /**
     * 添加水印
     * @param imageInfo 图片信息
     * @param params 参数
     */
    static addWatermark(imageInfo, params) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const watermarkText = params.text || '水印';
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const position = params.position || 'bottom-right';
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const opacity = params.opacity || 0.5;
            // 这里应该实现实际的水印添加逻辑
            // 暂时使用日志记录，实际实现时应该调用图片处理API
            // console.log(`为图片 ${imageInfo.name} 添加水印: ${watermarkText}, 位置: ${position}, 透明度: ${opacity}`);
            // 占位符实现，避免未使用参数和变量警告
            void imageInfo;
            void watermarkText;
            void position;
            void opacity;
        });
    }
    /**
     * 调整颜色
     * @param imageInfo 图片信息
     * @param params 参数
     */
    static adjustColors(imageInfo, params) {
        return __awaiter(this, void 0, void 0, function* () {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const brightness = params.brightness || 0;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const contrast = params.contrast || 0;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const saturation = params.saturation || 0;
            // 这里应该实现实际的颜色调整逻辑
            // 暂时使用日志记录，实际实现时应该调用图片处理API
            // console.log(`调整图片 ${imageInfo.name} 颜色: 亮度${brightness}, 对比度${contrast}, 饱和度${saturation}`);
            // 占位符实现，避免未使用参数和变量警告
            void imageInfo;
            void brightness;
            void contrast;
            void saturation;
        });
    }
    /**
     * 创建复杂布局
     * @param config H5配置
     * @param layoutType 布局类型
     * @returns 布局容器
     */
    static createComplexLayout(config, layoutType) {
        return __awaiter(this, void 0, void 0, function* () {
            const container = figma.createFrame();
            container.name = `${layoutType}布局`;
            container.resize(config.canvasWidth, config.canvasHeight);
            switch (layoutType) {
                case 'magazine':
                    return yield this.createMagazineLayout(container, config);
                case 'card':
                    return yield this.createCardLayout(container, config);
                case 'timeline':
                    return yield this.createTimelineLayout(container, config);
                case 'masonry':
                    return yield this.createMasonryLayout(container, config);
                default:
                    throw new Error(`不支持的布局类型: ${layoutType}`);
            }
        });
    }
    /**
     * 创建杂志风格布局
     * @param container 容器
     * @param config 配置
     * @returns 布局容器
     */
    static createMagazineLayout(container, config) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    yield this.addHeroContent(sectionFrame, config);
                }
                else if (section.type === 'content') {
                    yield this.addContentGrid(sectionFrame, config);
                }
                else if (section.type === 'footer') {
                    yield this.addFooterContent(sectionFrame, config);
                }
                container.appendChild(sectionFrame);
                currentY += section.height;
            }
            return container;
        });
    }
    /**
     * 创建卡片布局
     * @param container 容器
     * @param config 配置
     * @returns 布局容器
     */
    static createCardLayout(container, config) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    /**
     * 创建时间线布局
     * @param container 容器
     * @param config 配置
     * @returns 布局容器
     */
    static createTimelineLayout(container, config) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    /**
     * 创建瀑布流布局
     * @param container 容器
     * @param config 配置
     * @returns 布局容器
     */
    static createMasonryLayout(container, config) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    /**
     * 添加英雄区域内容
     * @param container 容器
     * @param config 配置
     */
    static addHeroContent(container, config) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield FontManager.loadInterFonts();
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
            }
            catch (error) {
                console.warn('添加英雄标题失败:', error);
            }
        });
    }
    /**
     * 添加内容网格
     * @param container 容器
     * @param _config 配置（未使用）
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static addContentGrid(container, _config) {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    /**
     * 添加底部内容
     * @param container 容器
     * @param _config 配置（未使用）
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static addFooterContent(container, _config) {
        return __awaiter(this, void 0, void 0, function* () {
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
                yield FontManager.loadInterFonts();
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
            }
            catch (error) {
                console.warn('添加底部文字失败:', error);
            }
        });
    }
}
//# sourceMappingURL=advanced-features.js.map