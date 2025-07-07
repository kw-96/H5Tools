// Figma相关工具类
// 这些工具类专门用于Figma API操作
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Utils, ImageUtils } from '../utils';
// ==================== 字体管理器 ====================
export class FontManager {
    static loadAll() {
        return __awaiter(this, void 0, void 0, function* () {
            const loadPromises = this.fonts.map((font) => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield figma.loadFontAsync(font);
                    return { success: true, font };
                }
                catch (error) {
                    return { success: false, font, error };
                }
            }));
            const results = yield Promise.all(loadPromises);
            const failedFonts = results
                .filter(result => !result.success)
                .map(result => result.font);
            if (failedFonts.length > 0) {
                console.warn('部分字体加载失败:', failedFonts);
            }
        });
    }
    static loadSingle(fontName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield figma.loadFontAsync(fontName);
            }
            catch (error) {
                console.warn(`字体加载失败: ${fontName.family} ${fontName.style}`, error);
            }
        });
    }
    /**
     * 加载Inter字体系列（别名方法）
     * @returns Promise<void>
     */
    static loadInterFonts() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.loadAll();
        });
    }
}
FontManager.fonts = [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" },
    { family: "Inter", style: "Bold" }
];
// ==================== 颜色工具 ====================
export class ColorUtils {
    static hexToRgb(hex) {
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
    static createSolidFill(color, opacity = 1) {
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
    static createFrame(name, width, height) {
        const frame = figma.createFrame();
        frame.name = name;
        frame.resize(width, height);
        return frame;
    }
    // 创建一个新的Text节点并设置其属性
    static createText(text_1, fontSize_1) {
        return __awaiter(this, arguments, void 0, function* (text, fontSize, fontWeight = 'Regular') {
            const textNode = figma.createText();
            const fontName = { family: "Inter", style: fontWeight };
            // 加载所需的字体
            yield FontManager.loadSingle(fontName);
            // 设置文本节点的属性
            textNode.characters = text;
            textNode.fontSize = fontSize;
            textNode.fontName = fontName;
            return textNode;
        });
    }
    // 为Frame节点设置自动布局属性
    static setupAutoLayout(frame, direction = 'VERTICAL', spacing = 0, padding = 0) {
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
    static safeAppendChild(parent, child, operationName = '节点添加') {
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
        }
        catch (error) {
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
    static safeBatchAppendChildren(parent, children, operationName = '批量节点添加') {
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
    static safeRemoveNode(node, operationName = '节点移除') {
        try {
            if (!node) {
                console.warn(`${operationName}: 节点无效`);
                return false;
            }
            if (node.parent) {
                node.remove();
                return true;
            }
            else {
                console.warn(`${operationName}: 节点没有父节点`);
                return false;
            }
        }
        catch (error) {
            console.error(`${operationName}失败:`, error);
            return false;
        }
    }
}
// ==================== 图片节点构建器 ====================
export class ImageNodeBuilder {
    // 创建图片对象
    static createImage(bytes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return figma.createImage(bytes);
            }
            catch (error) {
                console.error('图片创建失败:', error);
                return null;
            }
        });
    }
    // 创建大图片的兼容方法（当figma.createImage失败时使用）
    static createLargeImage(bytes_1, width_1, height_1) {
        return __awaiter(this, arguments, void 0, function* (bytes, width, height, name = "大图片") {
            try {
                // 创建矩形节点
                const rect = figma.createRectangle();
                rect.name = name;
                rect.resize(width, height);
                // 尝试通过填充方式设置图片
                yield this.fillTheSelection(rect, bytes);
                return rect;
            }
            catch (error) {
                console.error('大图片创建失败:', error);
                return null;
            }
        });
    }
    // 填充选中节点的方法（适配原始代码逻辑）
    static fillTheSelection(node, bytes) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 尝试创建图片
                const image = yield this.createImage(bytes);
                if (image) {
                    node.fills = [{
                            type: 'IMAGE',
                            imageHash: image.hash,
                            scaleMode: 'FILL'
                        }];
                }
                else {
                    // 如果创建图片失败，设置为灰色填充
                    node.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
                    console.warn('图片过大，使用默认填充');
                }
            }
            catch (error) {
                console.error('填充图片失败:', error);
                // 设置为灰色填充作为后备方案
                node.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
            }
        });
    }
    // 创建图片填充
    static createImageFill(bytes_1) {
        return __awaiter(this, arguments, void 0, function* (bytes, scaleMode = 'FILL') {
            const image = yield this.createImage(bytes);
            if (image) {
                return {
                    type: 'IMAGE',
                    imageHash: image.hash,
                    scaleMode: scaleMode
                };
            }
            // 失败时返回灰色填充
            return ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 });
        });
    }
    // 直接插入图片节点，使用前端获取的真实尺寸
    static insertImage(imageData_1, name_1) {
        return __awaiter(this, arguments, void 0, function* (imageData, name, defaultWidth = 800, defaultHeight = 600) {
            try {
                let uint8Array;
                let width;
                let height;
                // 处理不同的数据格式
                if (imageData && typeof imageData === 'object' && 'data' in imageData) {
                    uint8Array = imageData.data;
                    width = imageData.width;
                    height = imageData.height;
                }
                else if (imageData instanceof Uint8Array) {
                    uint8Array = imageData;
                    width = defaultWidth;
                    height = defaultHeight;
                }
                else {
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
                    return yield this.handleOversizedImage(uint8Array, width, height, name);
                }
                // 尝试正常创建图片
                const image = yield this.createImage(uint8Array);
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
                }
                else {
                    // 创建失败但尺寸不大，可能是其他原因
                    console.warn(`图片创建失败: ${name}，创建占位矩形`);
                    return this.createPlaceholderRect(width, height, name, '图片创建失败');
                }
            }
            catch (error) {
                console.error(`图片插入失败: ${name}`, error);
                return null;
            }
        });
    }
    // 处理超大尺寸图片
    static handleOversizedImage(bytes, width, height, name) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.warn(`图片分割超时: ${name}`);
                    resolve(this.createPlaceholderRect(width, height, name, '图片尺寸过大'));
                }, 15000); // 增加超时时间到15秒
                // 计算最优切割策略
                const maxSize = 4096;
                const sliceInfo = ImageUtils.calculateSliceStrategy(width, height, maxSize);
                // 构建符合SliceStrategy接口的对象
                const sliceStrategy = {
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
                        type: 'image/png' // 默认类型
                    },
                    sliceWidth: sliceStrategy.sliceWidth,
                    sliceHeight: sliceStrategy.sliceHeight,
                    sliceStrategy
                });
                // 监听分割结果
                const messageHandler = (msg) => __awaiter(this, void 0, void 0, function* () {
                    if (msg.type === 'slice-image-response' && msg.imageName === name) {
                        clearTimeout(timeout);
                        if (msg.success && msg.slices && msg.slices.length > 0) {
                            try {
                                // 完整的切片组装实现
                                const result = yield this.assembleSlicedImage(msg.slices, width, height, name, sliceStrategy);
                                resolve(result);
                            }
                            catch (error) {
                                console.error(`图片组装失败: ${name}`, error);
                                resolve(this.createPlaceholderRect(width, height, name, '图片组装失败'));
                            }
                        }
                        else {
                            console.warn(`图片切片失败: ${name}`, msg.error || '未知错误');
                            resolve(this.createPlaceholderRect(width, height, name, '图片切片失败'));
                        }
                        // 移除消息监听器
                        figma.ui.off('message', messageHandler);
                    }
                });
                figma.ui.on('message', messageHandler);
                // 清理监听器（防止内存泄漏）
                setTimeout(() => {
                    figma.ui.off('message', messageHandler);
                }, 16000);
            });
        });
    }
    // 组装切片后的图片
    static assembleSlicedImage(slices, _totalWidth, _totalHeight, name, strategy) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                figma.notify(`正在组装图片: ${name} (${strategy.description})`, { timeout: 2000 });
                const sliceNodes = [];
                // 创建每个图片切片
                for (let i = 0; i < slices.length; i++) {
                    const slice = slices[i];
                    const sliceBytes = new Uint8Array(slice.bytes);
                    try {
                        const image = yield this.createImage(sliceBytes);
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
                        }
                        else {
                            console.warn(`切片 ${i + 1} 图片创建失败，跳过此切片`);
                        }
                    }
                    catch (sliceError) {
                        console.error(`切片 ${i + 1} 处理失败:`, sliceError);
                    }
                }
                // 创建分组
                if (sliceNodes.length > 0) {
                    try {
                        // 先将所有切片批量添加到页面，然后立即分组
                        const successCount = NodeUtils.safeBatchAppendChildren(figma.currentPage, sliceNodes, '图片切片批量添加到页面');
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
                    }
                    catch (groupError) {
                        console.error('创建分组失败:', groupError);
                        // 清理已创建的节点
                        sliceNodes.forEach((node, index) => {
                            NodeUtils.safeRemoveNode(node, `清理图片切片${index + 1}`);
                        });
                        throw groupError;
                    }
                }
                else {
                    throw new Error('没有成功创建任何切片');
                }
            }
            catch (error) {
                console.error('图片组装失败:', error);
                throw error;
            }
        });
    }
    // 创建占位矩形
    static createPlaceholderRect(width, height, name, reason = '未知原因') {
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
        }
        catch (error) {
            console.warn('占位文本添加失败:', error);
        }
        return rect;
    }
    // 设置图片填充
    static setImageFill(node_1, imageData_1) {
        return __awaiter(this, arguments, void 0, function* (node, imageData, scaleMode = 'FILL') {
            if (!imageData)
                return;
            const bytes = Utils.extractUint8Array(imageData);
            if (!bytes)
                return;
            try {
                const imageFill = yield this.createImageFill(bytes, scaleMode);
                node.fills = [imageFill];
            }
            catch (error) {
                console.error('设置图片填充失败:', error);
            }
        });
    }
}
// ==================== 标题容器创建函数 ====================
export function createTitleContainer(title, titleBackground, width, height, currentY, options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if ((!title || title.trim() === '') && !titleBackground) {
            return null;
        }
        const fontSize = (_a = options === null || options === void 0 ? void 0 : options.fontSize) !== null && _a !== void 0 ? _a : 48;
        const fontWeight = (_b = options === null || options === void 0 ? void 0 : options.fontWeight) !== null && _b !== void 0 ? _b : 'Bold';
        const textColor = (_c = options === null || options === void 0 ? void 0 : options.textColor) !== null && _c !== void 0 ? _c : { r: 1, g: 1, b: 1 };
        const frameName = (_d = options === null || options === void 0 ? void 0 : options.frameName) !== null && _d !== void 0 ? _d : '标题容器';
        // 创建Frame
        const titleContainer = NodeUtils.createFrame(frameName, width, height);
        titleContainer.fills = [];
        // 背景图片
        if (titleBackground) {
            try {
                const titleBgImage = yield ImageNodeBuilder.insertImage(titleBackground, "标题背景图片", width, height);
                if (titleBgImage) {
                    titleBgImage.x = 0;
                    titleBgImage.y = 0;
                    NodeUtils.safeAppendChild(titleContainer, titleBgImage, '标题背景图片添加');
                }
            }
            catch (error) {
                console.error('标题背景图片创建失败:', error);
            }
        }
        // 标题文本
        if (title && title.trim() !== '') {
            const titleText = yield NodeUtils.createText(title, fontSize, fontWeight);
            titleText.fills = [ColorUtils.createSolidFill(textColor)];
            titleText.resize(width, titleText.height);
            titleText.textAlignHorizontal = "CENTER";
            titleText.x = 0;
            titleText.y = (height - titleText.height) / 2;
            NodeUtils.safeAppendChild(titleContainer, titleText, '标题文本添加');
        }
        // 设置Y坐标并返回新Y
        titleContainer.x = 0;
        titleContainer.y = currentY + 90;
        return { container: titleContainer, newY: currentY + height };
    });
}
// ==================== 除游戏信息容器外其他按钮容器创建函数 ====================
/**
 * 递归查找"游戏信息"Frame下的"按钮底图"节点并克隆
 * @param nineGridFrame 九宫格Frame节点（其parent应为自适应模块Frame）
 * @returns 克隆的按钮底图RectangleNode，找不到则返回null
 */
export function findAndCloneButtonImageFromGameInfo(nineGridFrame) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // 在自适应模块中查找游戏信息容器
            const adaptiveModule = nineGridFrame.parent;
            if (!adaptiveModule || adaptiveModule.type !== 'FRAME') {
                return null;
            }
            const gameInfoFrame = adaptiveModule.findOne(node => node.type === 'FRAME' && node.name === '游戏信息');
            if (!gameInfoFrame) {
                return null;
            }
            // 递归查找按钮底图节点并复制
            const findAndCloneButtonImage = (node) => {
                if (node.name === '按钮底图') {
                    if ('clone' in node) {
                        const clonedNode = node.clone();
                        return clonedNode;
                    }
                    else {
                        return null;
                    }
                }
                if ('children' in node) {
                    for (const child of node.children) {
                        const result = findAndCloneButtonImage(child);
                        if (result)
                            return result;
                    }
                }
                return null;
            };
            return findAndCloneButtonImage(gameInfoFrame);
        }
        catch (error) {
            console.error('findAndCloneButtonImageFromGameInfo失败:', error);
            return null;
        }
    });
}
/**
 * 从游戏信息容器获取下载按钮的文本样式
 * @param nineGridFrame 九宫格Frame节点（其parent应为自适应模块Frame）
 * @returns 包含fontName和fills的样式对象，找不到则返回null
 */
export function getDownloadButtonTextStyle(nineGridFrame) {
    try {
        const adaptiveModule = nineGridFrame.parent;
        if (!adaptiveModule || adaptiveModule.type !== 'FRAME') {
            return null;
        }
        const gameInfoFrame = adaptiveModule.findOne(node => node.type === 'FRAME' && node.name === '游戏信息');
        if (!gameInfoFrame) {
            return null;
        }
        const findDownloadButtonText = (node) => {
            if (node.type === 'TEXT' && node.parent && 'name' in node.parent && node.parent.name === '下载按钮') {
                return node;
            }
            if ('children' in node) {
                for (const child of node.children) {
                    const result = findDownloadButtonText(child);
                    if (result)
                        return result;
                }
            }
            return null;
        };
        const textNode = findDownloadButtonText(gameInfoFrame);
        if (textNode) {
            return {
                fontName: textNode.fontName,
                // fills: textNode.fills as Paint[]
                fills: JSON.parse(JSON.stringify(textNode.fills))
            };
        }
        return null;
    }
    catch (error) {
        console.error('获取下载按钮文本样式失败:', error);
        return null;
    }
}
/**
 * 通用按钮容器创建函数
 * @param mainContainer 主容器
 * @param nineGridFrame 九宫格Frame（用于递归查找按钮底图和样式）
 * @param options  { name, text, x, y, width, height, textFontSize }
 * @returns 创建的按钮容器FrameNode
 */
export function createButtonContainer(mainContainer, nineGridFrame, options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const container = NodeUtils.createFrame(options.name, options.width, options.height);
        container.x = options.x;
        container.y = options.y;
        container.fills = [];
        // 统一用游戏信息中的按钮底图
        const buttonImage = yield findAndCloneButtonImageFromGameInfo(nineGridFrame);
        if (buttonImage) {
            buttonImage.resize(options.width, options.height);
            buttonImage.x = (container.width - buttonImage.width) / 2;
            buttonImage.y = (container.height - buttonImage.height) / 2;
            NodeUtils.safeAppendChild(container, buttonImage, `${options.text}按钮图片添加`);
        }
        // 获取文本样式
        const buttonTextStyle = getDownloadButtonTextStyle(nineGridFrame);
        // 添加文本
        const textNode = figma.createText();
        textNode.name = `${options.text}文本`;
        textNode.characters = options.text;
        if (buttonTextStyle) {
            textNode.fontName = buttonTextStyle.fontName;
            textNode.fills = buttonTextStyle.fills;
        }
        else {
            textNode.fontName = { family: "Inter", style: "Bold" };
            textNode.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
        }
        textNode.fontSize = (_a = options.textFontSize) !== null && _a !== void 0 ? _a : 50;
        textNode.textAlignHorizontal = 'CENTER';
        textNode.textAlignVertical = 'CENTER';
        textNode.x = (container.width - textNode.width) / 2;
        textNode.y = (container.height - textNode.height) / 2;
        NodeUtils.safeAppendChild(container, textNode, `${options.text}文本添加`);
        NodeUtils.safeAppendChild(mainContainer, container, `${options.text}容器添加`);
        return container;
    });
}
//# sourceMappingURL=figma-utils.js.map