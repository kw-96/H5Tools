(function () {
    'use strict';

    // 渠道美术-H5延展工具 - 核心类型定义
    // 这个文件包含所有的接口和类型定义，将作为独立库发布到GitHub
    // ==================== 常量定义 ====================
    const CONSTANTS = {
        H5_WIDTH: 1080, // H5画板宽度
        MODULE_WIDTH: 950, // 模块宽度
        PADDING: 0, // 内边距
        GRID_SIZE: 3, // 九宫格行列数
        DEFAULT_SPACING: 20 // 默认间距
    };
    // 模块类型枚举
    var ModuleType;
    (function (ModuleType) {
        ModuleType["HEADER"] = "header";
        ModuleType["GAME_INFO"] = "gameInfo";
        ModuleType["FOOTER"] = "footer";
        ModuleType["ACTIVITY_CONTENT"] = "activityContent";
        ModuleType["SIGN_IN"] = "signIn";
        ModuleType["COLLECT_CARDS"] = "collectCards";
        ModuleType["NINE_GRID"] = "nineGrid";
        ModuleType["CAROUSEL"] = "carousel";
        ModuleType["RULES"] = "rules";
        ModuleType["CUSTOM"] = "custom";
    })(ModuleType || (ModuleType = {}));
    // 渠道类型枚举
    var ChannelType;
    (function (ChannelType) {
        ChannelType["OPPO"] = "oppo";
        ChannelType["VIVO"] = "vivo";
        ChannelType["HUAWEI"] = "huawei";
        ChannelType["XIAOMI"] = "xiaomi";
    })(ChannelType || (ChannelType = {}));

    // 渠道美术-H5延展工具 - 核心工具函数
    // 这个文件包含所有的工具函数，将作为独立库发布到GitHub
    // ==================== 基础工具类 ====================
    class Utils {
        // 延迟函数，返回一个Promise，在指定的毫秒数后resolve
        static async delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
        // 从ImageInfo或Uint8Array中提取Uint8Array数据
        static extractUint8Array(imageData) {
            if (!imageData)
                return null;
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
        // 十六进制颜色转RGB
        static hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16) / 255,
                g: parseInt(result[2], 16) / 255,
                b: parseInt(result[3], 16) / 255
            } : { r: 0, g: 0, b: 0 };
        }
        // 计算图片切片策略
        static calculateSliceStrategy(width, height, maxSize) {
            const totalPixels = width * height;
            const maxPixels = maxSize * maxSize;
            if (totalPixels <= maxPixels) {
                return { needsSlicing: false, slices: [] };
            }
            // 计算需要的切片数量
            const ratio = Math.ceil(Math.sqrt(totalPixels / maxPixels));
            const sliceWidth = Math.ceil(width / ratio);
            const sliceHeight = Math.ceil(height / ratio);
            const slices = [];
            for (let row = 0; row < ratio; row++) {
                for (let col = 0; col < ratio; col++) {
                    const x = col * sliceWidth;
                    const y = row * sliceHeight;
                    const w = Math.min(sliceWidth, width - x);
                    const h = Math.min(sliceHeight, height - y);
                    if (w > 0 && h > 0) {
                        slices.push({ x, y, width: w, height: h, row, col });
                    }
                }
            }
            return {
                needsSlicing: true,
                slices,
                totalWidth: width,
                totalHeight: height,
                sliceWidth,
                sliceHeight,
                rows: ratio,
                cols: ratio
            };
        }
        // 获取奖品位置（九宫格）
        static getPrizePosition(index) {
            // 九宫格位置映射：0-7对应外围8个位置，中心位置(1,1)是抽奖按钮
            const positions = [
                { row: 0, col: 0 }, // 左上
                { row: 0, col: 1 }, // 上中
                { row: 0, col: 2 }, // 右上
                { row: 1, col: 2 }, // 右中
                { row: 2, col: 2 }, // 右下
                { row: 2, col: 1 }, // 下中
                { row: 2, col: 0 }, // 左下
                { row: 1, col: 0 } // 左中
            ];
            return positions[index] || { row: 0, col: 0 };
        }
        // 安全的数值转换
        static safeNumber(value, defaultValue = 0) {
            const num = Number(value);
            return isNaN(num) ? defaultValue : num;
        }
        // 安全的字符串转换
        static safeString(value, defaultValue = '') {
            return value != null ? String(value) : defaultValue;
        }
        // 生成唯一ID
        static generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }
        // 深拷贝对象
        static deepClone(obj) {
            if (obj === null || typeof obj !== 'object')
                return obj;
            if (obj instanceof Date)
                return new Date(obj.getTime());
            if (obj instanceof Array)
                return obj.map(item => Utils.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        clonedObj[key] = Utils.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
            return obj;
        }
    }
    // ==================== 图片处理工具 ====================
    class ImageUtils {
        // 验证图片格式
        static isValidImageType(type) {
            const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
            return validTypes.indexOf(type.toLowerCase()) !== -1;
        }
        // 获取图片文件扩展名
        static getImageExtension(type) {
            const extensions = {
                'image/png': 'png',
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/gif': 'gif',
                'image/webp': 'webp'
            };
            return extensions[type.toLowerCase()] || 'png';
        }
        // 计算图片缩放比例
        static calculateScale(originalWidth, originalHeight, targetWidth, targetHeight, scaleMode = 'fit') {
            const scaleX = targetWidth / originalWidth;
            const scaleY = targetHeight / originalHeight;
            let scale;
            if (scaleMode === 'fit') {
                scale = Math.min(scaleX, scaleY);
            }
            else {
                scale = Math.max(scaleX, scaleY);
            }
            return {
                scale,
                width: originalWidth * scale,
                height: originalHeight * scale
            };
        }
        // 检查图片是否超过Figma限制
        static isOversized(width, height, maxSize = 4096) {
            return width > maxSize || height > maxSize;
        }
        // 计算切片策略（用于超大图片）- 智能切片策略
        static calculateSliceStrategy(width, height, maxSize = 4096) {
            const strategy = {
                direction: 'none',
                sliceWidth: width,
                sliceHeight: height,
                slicesCount: 1,
                description: '',
                cols: 1,
                rows: 1,
                totalSlices: 1
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
                strategy.cols = Math.ceil(width / strategy.sliceWidth);
                strategy.rows = 1;
                strategy.slicesCount = strategy.cols;
                strategy.totalSlices = strategy.cols;
                strategy.description = `宽度超限，垂直切割为${strategy.slicesCount}片，每片${strategy.sliceWidth}×${height}`;
            }
            else if (!widthExceeds && heightExceeds) {
                // 只有高度超限：水平切割（保持宽度）
                strategy.direction = 'horizontal';
                strategy.sliceWidth = width;
                strategy.sliceHeight = Math.floor(maxSize * 0.9); // 留10%安全边距
                strategy.cols = 1;
                strategy.rows = Math.ceil(height / strategy.sliceHeight);
                strategy.slicesCount = strategy.rows;
                strategy.totalSlices = strategy.rows;
                strategy.description = `高度超限，水平切割为${strategy.slicesCount}片，每片${width}×${strategy.sliceHeight}`;
            }
            else {
                // 宽度和高度都超限：网格切割
                strategy.direction = 'both';
                strategy.sliceWidth = Math.floor(maxSize * 0.9);
                strategy.sliceHeight = Math.floor(maxSize * 0.9);
                strategy.cols = Math.ceil(width / strategy.sliceWidth);
                strategy.rows = Math.ceil(height / strategy.sliceHeight);
                strategy.slicesCount = strategy.cols * strategy.rows;
                strategy.totalSlices = strategy.cols * strategy.rows;
                strategy.description = `宽高都超限，网格切割为${strategy.cols}×${strategy.rows}=${strategy.slicesCount}片`;
            }
            return strategy;
        }
    }

    // Figma相关工具类
    // 这些工具类专门用于Figma API操作
    // ==================== 字体管理器 ====================
    class FontManager {
        static async loadAll() {
            const loadPromises = this.fonts.map(async (font) => {
                try {
                    await figma.loadFontAsync(font);
                    return { success: true, font };
                }
                catch (error) {
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
        static async loadSingle(fontName) {
            try {
                await figma.loadFontAsync(fontName);
            }
            catch (error) {
                console.warn(`字体加载失败: ${fontName.family} ${fontName.style}`, error);
            }
        }
        /**
         * 加载Inter字体系列（别名方法）
         * @returns Promise<void>
         */
        static async loadInterFonts() {
            return this.loadAll();
        }
    }
    FontManager.fonts = [
        { family: "Inter", style: "Regular" },
        { family: "Inter", style: "Medium" },
        { family: "Inter", style: "Bold" }
    ];
    // ==================== 颜色工具 ====================
    class ColorUtils {
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
    class NodeUtils {
        // 创建一个新的Frame节点
        static createFrame(name, width, height) {
            const frame = figma.createFrame();
            frame.name = name;
            frame.resize(width, height);
            return frame;
        }
        // 创建一个新的Text节点并设置其属性
        static async createText(text, fontSize, fontWeight = 'Regular') {
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
    class ImageNodeBuilder {
        // 创建图片对象
        static async createImage(bytes) {
            try {
                return figma.createImage(bytes);
            }
            catch (error) {
                console.error('图片创建失败:', error);
                return null;
            }
        }
        // 创建大图片的兼容方法（当figma.createImage失败时使用）
        static async createLargeImage(bytes, width, height, name = "大图片") {
            try {
                // 创建矩形节点
                const rect = figma.createRectangle();
                rect.name = name;
                rect.resize(width, height);
                // 尝试通过填充方式设置图片
                await this.fillTheSelection(rect, bytes);
                return rect;
            }
            catch (error) {
                console.error('大图片创建失败:', error);
                return null;
            }
        }
        // 填充选中节点的方法（适配原始代码逻辑）
        static async fillTheSelection(node, bytes) {
            try {
                // 尝试创建图片
                const image = await this.createImage(bytes);
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
        }
        // 创建图片填充
        static async createImageFill(bytes, scaleMode = 'FILL') {
            const image = await this.createImage(bytes);
            if (image) {
                return {
                    type: 'IMAGE',
                    imageHash: image.hash,
                    scaleMode: scaleMode
                };
            }
            // 失败时返回灰色填充
            return ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 });
        }
        // 直接插入图片节点，使用前端获取的真实尺寸
        static async insertImage(imageData, name, defaultWidth = 800, defaultHeight = 600) {
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
        }
        // 处理超大尺寸图片
        static async handleOversizedImage(bytes, width, height, name) {
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
                const messageHandler = async (msg) => {
                    if (msg.type === 'slice-image-response' && msg.imageName === name) {
                        clearTimeout(timeout);
                        if (msg.success && msg.slices && msg.slices.length > 0) {
                            try {
                                // 完整的切片组装实现
                                const result = await this.assembleSlicedImage(msg.slices, width, height, name, sliceStrategy);
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
                };
                figma.ui.on('message', messageHandler);
                // 清理监听器（防止内存泄漏）
                setTimeout(() => {
                    figma.ui.off('message', messageHandler);
                }, 16000);
            });
        }
        // 组装切片后的图片
        static async assembleSlicedImage(slices, _totalWidth, _totalHeight, name, strategy) {
            try {
                figma.notify(`正在组装图片: ${name} (${strategy.description})`, { timeout: 2000 });
                const sliceNodes = [];
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
        static async setImageFill(node, imageData, scaleMode = 'FILL') {
            if (!imageData)
                return;
            const bytes = Utils.extractUint8Array(imageData);
            if (!bytes)
                return;
            try {
                const imageFill = await this.createImageFill(bytes, scaleMode);
                node.fills = [imageFill];
            }
            catch (error) {
                console.error('设置图片填充失败:', error);
            }
        }
    }
    // ==================== 标题容器创建函数 ====================
    async function createTitleContainer(title, bgImage, width, height, fontSize = 24, fontWeight = 'Bold') {
        // 创建容器框架
        const container = NodeUtils.createFrame('标题容器', width, height);
        // 如果有背景图片，设置背景
        if (bgImage) {
            await ImageNodeBuilder.setImageFill(container, bgImage);
        }
        else {
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

    // 模块构建器
    // 负责构建各种H5模块
    /// <reference types="@figma/plugin-typings" />
    // ==================== 头部模块 ====================
    async function createHeaderModule(headerImage, titleUpload) {
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
        let headerNode = null;
        let titleNode = null;
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
                        horizontal: "CENTER", // 水平居中
                        vertical: "MIN" // 上对齐（顶部对齐）
                    };
                    // 手动设置位置：水平居中、顶部对齐
                    headerNode.x = (frame.width - headerNode.width) / 2;
                    headerNode.y = currentY;
                    currentY = headerNode.height; // 更新Y位置
                }
            }
            catch (error) {
                console.error('头图创建失败:', error);
            }
        }
        // 调整头图容器高度
        adjustHeaderFrameHeight(frame, headerNode, titleNode);
        // 1. 在完成头图模块的创建后，对头图图片节点进行添加羽化蒙版
        if (headerNode) {
            try {
                await addFeatherMaskToHeaderImage(headerNode, frame);
            }
            catch (error) {
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
                        horizontal: "CENTER", // 水平居中
                        vertical: "MAX" // 底部对齐
                    };
                    // 手动设置位置：水平居中，底部对齐
                    titleNode.x = (frame.width - titleNode.width) / 2;
                    titleNode.y = frame.height - titleNode.height; // 底部对齐
                }
            }
            catch (error) {
                console.error('标题图片创建失败:', error);
            }
        }
        return frame;
    }
    // 调整头图容器高度的辅助函数
    function adjustHeaderFrameHeight(frame, headerNode, titleNode) {
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
    async function addFeatherMaskToHeaderImage(headerNode, frame) {
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
            let featherMaskGroup;
            try {
                featherMaskGroup = figma.group([maskRect], frame);
                featherMaskGroup.name = "羽化蒙版";
            }
            catch (groupError) {
                console.error('创建羽化蒙版组失败:', groupError);
                return;
            }
            // 6. 设置模糊效果给羽化蒙版组
            try {
                const blurEffect = {
                    type: "LAYER_BLUR",
                    radius: blurRadius,
                    visible: true
                };
                if (featherMaskGroup.effects !== undefined) {
                    featherMaskGroup.effects = [blurEffect];
                }
            }
            catch (effectError) {
                console.warn('设置模糊效果失败:', effectError);
            }
            // 7. 设置羽化蒙版组为剪切蒙版
            try {
                if ('isMask' in featherMaskGroup) {
                    featherMaskGroup.isMask = true;
                }
            }
            catch (maskError) {
                console.warn('设置剪切蒙版失败:', maskError);
            }
            // 8. 创建包含羽化蒙版组和头图节点的组，命名为头图
            let headerGroup;
            try {
                headerGroup = figma.group([featherMaskGroup, headerNode], frame);
                headerGroup.name = "头图";
            }
            catch (groupError) {
                console.error('创建头图组失败:', groupError);
                return;
            }
            // 9. 调整位置：基于Figma官方文档的Container Parent概念
            // 🎯 关键理解：
            // 1. 组内元素的坐标相对于"容器父级"（frame），不是相对于组本身
            // 2. 组会自动调整位置和大小以适应其内容
            // 3. 我们应该设置元素的绝对位置，让组自动调整
            // 蒙版矩形：在羽化蒙版组内，相对于frame的绝对位置
            const centerOffsetX = (originalWidth - rectWidth) / 2;
            maskRect.x = originalX + centerOffsetX; // 相对于frame的居中位置
            maskRect.y = 0; // 相对于frame，向上扩展模糊半径
            // 羽化蒙版组会自动调整以包围蒙版矩形，我们不需要手动设置其位置
            // featherMaskGroup.x 和 featherMaskGroup.y 会自动计算
            // 头图节点：保持原始位置（相对于frame）
            headerNode.x = originalX;
            headerNode.y = originalY;
            headerNode.constraints = originalConstraints;
            // 头图组也会自动调整以包围其所有子元素
            // headerGroup.x 和 headerGroup.y 会自动计算
            // 10. 删除原来的头图图片节点，将复制的头图图片节点放入头图组中
            try {
                if (headerNode && headerNode.parent) {
                    headerNode.remove();
                }
            }
            catch (removeError) {
                console.warn('删除原头图节点失败:', removeError);
            }
            // 将复制的头图图片节点添加到头图组中
            try {
                NodeUtils.safeAppendChild(headerGroup, headerNodeCopy, '复制的头图图片节点添加到头图组');
                // 🎯 关键：复制节点的位置也是相对于frame（容器父级）
                // 由于Container Parent概念，组内元素坐标相对于frame，不是相对于组
                headerNodeCopy.x = originalX; // 相对于frame的原始位置
                headerNodeCopy.y = originalY; // 相对于frame的原始位置
                headerNodeCopy.constraints = originalConstraints;
            }
            catch (addError) {
                console.error('将复制的头图图片节点添加到头图组失败:', addError);
            }
        }
        catch (error) {
            console.error('为头图图片添加羽化蒙版失败:', error);
            // 不再抛出错误，而是记录并继续执行
        }
    }
    // ==================== 游戏信息模块 ====================
    async function createGameInfoModule(config) {
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
        // 构造函数，初始化框架节点和配置信息
        constructor(frame, config) {
            this.frame = frame;
            this.config = config;
        }
        async build() {
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
        async addGameIcon() {
            // 如果没有配置游戏图标，则直接返回
            if (!this.config.gameIcon)
                return;
            // 插入游戏图标图片
            const iconImageNode = await ImageNodeBuilder.insertImage(this.config.gameIcon, "游戏图标", 190, 190);
            // 如果图标插入失败，则直接返回
            if (!iconImageNode)
                return;
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
        async addGameInfo() {
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
        async addButtons() {
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
        async addIconButton() {
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
                    const buttonBgImage = await ImageNodeBuilder.insertImage(this.config.iconButtonBg, "按钮底图", 344, 103);
                    if (buttonBgImage) {
                        buttonBgImage.x = 0;
                        buttonBgImage.y = 0;
                        NodeUtils.safeAppendChild(buttonFrame, buttonBgImage, '图标按钮底图添加');
                    }
                    else {
                        // 如果图片插入失败，使用默认背景色
                        buttonFrame.fills = [ColorUtils.createSolidFill({ r: 0, g: 0.44, b: 0.89 })];
                        buttonFrame.cornerRadius = 30;
                    }
                }
                catch (error) {
                    console.error('按钮底图创建失败:', error);
                    // 如果底图创建失败，设置默认背景色
                    buttonFrame.fills = [ColorUtils.createSolidFill({ r: 0, g: 0.44, b: 0.89 })];
                    buttonFrame.cornerRadius = 30;
                }
            }
            else {
                // 没有底图时使用默认背景色
                buttonFrame.fills = [ColorUtils.createSolidFill({ r: 0, g: 0.44, b: 0.89 })];
                buttonFrame.cornerRadius = 30;
            }
            // 添加按钮文本
            const buttonText = this.config.iconButtonText || "立即下载";
            {
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
                }
                catch (textError) {
                    console.error('创建按钮文本失败:', textError);
                }
            }
            // 将按钮框架添加到主框架中
            NodeUtils.safeAppendChild(this.frame, buttonFrame, '图标按钮框架添加');
        }
        async addSingleButton() {
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
            }
            catch (error) {
                console.error('单按钮底图设置失败:', error);
                return;
            }
            // 添加按钮文本
            const buttonText = this.config.singleButtonText || "立即下载";
            {
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
                }
                catch (textError) {
                    console.error('创建单按钮文本失败:', textError);
                }
            }
            NodeUtils.safeAppendChild(this.frame, buttonFrame, '单按钮框架添加');
        }
        async addDoubleButtons() {
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
                    const leftButton = await this.createButton("左侧按钮", this.config.leftButtonText || "左侧按钮", this.config.leftButtonTextColor, this.config.leftButtonBg, buttonWidth, 80);
                    if (leftButton) {
                        leftButton.x = startX;
                        leftButton.y = buttonY;
                        NodeUtils.safeAppendChild(this.frame, leftButton, '左侧按钮添加');
                    }
                }
                catch (leftButtonError) {
                    console.error('创建左侧按钮失败:', leftButtonError);
                }
            }
            // 右侧按钮 - 只有有底图时才创建
            if (hasRightBg) {
                try {
                    const rightButton = await this.createButton("右侧按钮", this.config.rightButtonText || "右侧按钮", this.config.rightButtonTextColor, this.config.rightButtonBg, buttonWidth, 80);
                    if (rightButton) {
                        rightButton.x = startX + buttonWidth + spacing;
                        rightButton.y = buttonY;
                        NodeUtils.safeAppendChild(this.frame, rightButton, '右侧按钮添加');
                    }
                }
                catch (rightButtonError) {
                    console.error('创建右侧按钮失败:', rightButtonError);
                }
            }
        }
        async createButton(name, text, textColor, bgImage, width, height) {
            // 只有当有底图时才创建按钮
            if (!bgImage) {
                return null;
            }
            const buttonFrame = NodeUtils.createFrame(name, width, height);
            buttonFrame.cornerRadius = height / 2;
            // 使用上传的底图
            try {
                await ImageNodeBuilder.setImageFill(buttonFrame, bgImage);
            }
            catch (error) {
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
                }
                catch (textError) {
                    console.error(`创建${name}文本失败:`, textError);
                }
            }
            return buttonFrame;
        }
    }
    // ==================== 自定义模块 ====================
    async function createCustomModule(module) {
        const factory = new ModuleFactory();
        return factory.createModule(module);
    }
    class ModuleFactory {
        async createModule(module) {
            try {
                let moduleFrame;
                // 🚨 关键修复：正确处理字符串类型的模块类型
                const moduleType = typeof module.type === 'string' ? module.type : module.type;
                console.log('🏭 [模块工厂] 开始创建模块:', {
                    模块ID: module.id,
                    模块类型: moduleType,
                    模块标题: module.title,
                    内容键: Object.keys(module.content || {})
                });
                switch (moduleType) {
                    case 'activityContent':
                    case ModuleType.ACTIVITY_CONTENT:
                        moduleFrame = await this.createActivityContentModule(module.content);
                        break;
                    case 'signIn':
                    case ModuleType.SIGN_IN:
                        moduleFrame = await this.createSignInModule(module.content);
                        break;
                    case 'collectCards':
                    case ModuleType.COLLECT_CARDS:
                        moduleFrame = await this.createCollectCardsModule(module.content);
                        break;
                    case 'nineGrid':
                    case ModuleType.NINE_GRID:
                        moduleFrame = await this.createNineGridModule(module.content);
                        break;
                    case 'carousel':
                    case ModuleType.CAROUSEL:
                        moduleFrame = await this.createCarouselModule(module.content);
                        break;
                    default:
                        console.warn(`未知的模块类型: ${moduleType}`);
                        return this.createErrorModule(module, `未知的模块类型: ${moduleType}`);
                }
                moduleFrame.name = module.title || `${moduleType}模块`;
                console.log('✅ [模块工厂] 模块创建成功:', {
                    模块名称: moduleFrame.name,
                    模块大小: `${moduleFrame.width}x${moduleFrame.height}`
                });
                return moduleFrame;
            }
            catch (error) {
                console.error(`❌ [模块工厂] 创建模块失败: ${module.type}`, error);
                return this.createErrorModule(module, error);
            }
        }
        async createActivityContentModule(content) {
            console.log('🎭 [活动内容模块] 开始创建:', {
                主标题: content.mainTitle,
                副标题: content.subTitle,
                正文内容: content.text,
                主标题背景: !!content.mainTitleBg,
                副标题背景: !!content.subTitleBg,
                插图: !!content.image
            });
            // 创建整个活动内容模块容器：1080宽，背景透明
            const frame = NodeUtils.createFrame('活动内容模块', CONSTANTS.H5_WIDTH, 1000);
            frame.fills = []; // 背景填充为透明
            try {
                // 实例化活动内容模块构建器
                const builder = new ActivityContentBuilder(frame, content);
                // 调用构建器的build方法来构建活动内容模块
                await builder.build();
                console.log('✅ [活动内容模块] 创建完成，最终高度：', frame.height);
                // 返回构建完成的框架
                return frame;
            }
            catch (error) {
                console.error('❌ [活动内容模块] 创建失败：', error);
                // 创建一个错误信息显示框
                const errorText = await NodeUtils.createText(`活动内容模块创建失败: ${error instanceof Error ? error.message : '未知错误'}`, 16);
                errorText.x = 20;
                errorText.y = 20;
                errorText.fills = [ColorUtils.createSolidFill({ r: 1, g: 0, b: 0 })];
                NodeUtils.safeAppendChild(frame, errorText, '活动内容模块错误文本添加');
                frame.resize(1080, 100);
                return frame;
            }
        }
        async createSignInModule(content) {
            const frame = NodeUtils.createFrame('签到模块', CONSTANTS.H5_WIDTH, 460);
            const builder = new SignInModuleBuilder(frame, content);
            await builder.build();
            return frame;
        }
        async createCollectCardsModule(content) {
            const frame = NodeUtils.createFrame('集卡模块', CONSTANTS.H5_WIDTH, 300);
            const builder = new CollectCardsModuleBuilder(frame, content);
            await builder.build();
            return frame;
        }
        async createNineGridModule(content) {
            const builder = new NineGridModuleBuilder(content);
            return builder.build();
        }
        /**
         * 创建轮播模块
         * @param content 轮播内容数据
         * @returns 返回创建的轮播模块框架节点
         */
        async createCarouselModule(content) {
            // 创建轮播模块的主框架，宽度为H5标准宽度，高度暂定为800
            const frame = NodeUtils.createFrame('轮播模块', CONSTANTS.H5_WIDTH, 800);
            // 实例化轮播模块构建器
            const builder = new CarouselModuleBuilder(frame, content);
            // 调用构建器的build方法来构建轮播模块
            await builder.build();
            // 返回构建完成的框架
            return frame;
        }
        async createErrorModule(module, error) {
            const frame = NodeUtils.createFrame(`错误模块-${module.type}`, CONSTANTS.H5_WIDTH, 100);
            frame.fills = [ColorUtils.createSolidFill({ r: 1.0, g: 0.9, b: 0.9 })];
            const errorText = await NodeUtils.createText(`模块创建失败: ${module.type}\n${error}`, 14, 'Regular');
            errorText.x = 20;
            errorText.y = 20;
            NodeUtils.safeAppendChild(frame, errorText, '错误信息添加');
            return frame;
        }
    }
    // 页面底部活动规则模块创建器
    async function createRulesModule(config) {
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
            const rulesData = {
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
        }
        catch (error) {
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
        // 构造函数，初始化活动规则模块构建器
        constructor(frame, content) {
            this.currentY = 0; // 当前Y位置
            this.frame = frame; // 设置框架节点
            this.content = content; // 设置内容
        }
        // 构建活动规则模块的主要方法
        async build() {
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
            }
            catch (error) {
                console.error('活动规则模块构建过程中出错：', error);
                throw error;
            }
        }
        // 添加标题
        async addTitle() {
            const hasRulesTitle = this.content.rulesTitle && this.content.rulesTitle.trim() !== '';
            const hasRulesBgImage = this.content.rulesBgImage !== null && this.content.rulesBgImage !== undefined;
            // 如果既没有标题文案也没有标题背景，直接返回
            if (!hasRulesTitle && !hasRulesBgImage)
                return;
            // 添加上边距
            this.currentY += 90;
            // 使用统一的标题容器创建函数
            // 如果没有标题文案，使用空字符串，但仍然可以显示背景图片
            const titleText = hasRulesTitle ? this.content.rulesTitle : '';
            const titleContainer = await createTitleContainer(titleText, this.content.rulesBgImage, 1080, 120, 48, // 48px字体大小
            'Bold');
            titleContainer.x = 0;
            titleContainer.y = this.currentY;
            NodeUtils.safeAppendChild(this.frame, titleContainer, '活动规则标题容器添加');
            this.currentY += 120;
        }
        // 添加规则内容
        async addRulesContent() {
            // 如果没有规则内容，直接返回
            if (!this.content.rulesContent)
                return;
            console.log('添加规则内容...');
            // 添加上边距
            this.currentY += 90;
            // 创建规则内容文本节点，直接插入到活动规则容器中（与活动详情模块的正文文本节点实现方式一致）
            const contentText = await NodeUtils.createText(this.content.rulesContent, 28, 'Regular');
            // 设置文本样式（与活动详情模块的正文文本完全一致）
            contentText.fills = [ColorUtils.createSolidFill({ r: 0, g: 0, b: 0 })]; // 黑色文字
            contentText.lineHeight = { unit: 'AUTO' }; // 设置行高40px（与活动详情模块一致）
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
        adjustFrameHeight() {
            // 添加下边距
            this.currentY += 90;
            // 调整框架高度
            this.frame.resize(1080, this.currentY);
        }
    }
    // ==================== 底部模块 ====================
    async function createFooterModule(config) {
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
        // 构造函数，初始化尾版框架和配置
        constructor(frame, config) {
            this.frame = frame;
            this.config = config;
        }
        // 构建尾版内容
        async build() {
            await this.setupBackground();
            await this.addContent();
        }
        // 设置尾版背景
        async setupBackground() {
            if (this.config.footerBg) {
                // 如果配置中有尾版背景图，则使用该图片
                await ImageNodeBuilder.setImageFill(this.frame, this.config.footerBg);
            }
            else {
                // 如果没有背景图，则使用透明背景
                this.frame.fills = [];
            }
        }
        // 添加尾版内容
        async addContent() {
            if (this.config.footerLogo) {
                await this.addLogo();
            }
        }
        // 添加Logo
        async addLogo() {
            // 检查是否有Logo图片数据
            if (!this.config.footerLogo) {
                console.log('跳过Logo创建：没有上传Logo图片');
                return;
            }
            console.log('开始创建Logo，使用ImageNodeBuilder');
            try {
                // 使用ImageNodeBuilder直接插入Logo图片节点
                const logoImage = await ImageNodeBuilder.insertImage(this.config.footerLogo, "LOGO");
                if (!logoImage) {
                    console.log('Logo图片节点创建失败');
                    return;
                }
                // 获取原始图片尺寸
                const originalWidth = logoImage.width;
                const originalHeight = logoImage.height;
                const aspectRatio = originalWidth / originalHeight;
                console.log(`Logo原始尺寸: ${originalWidth}x${originalHeight}, 宽高比: ${aspectRatio.toFixed(2)}`);
                let finalWidth;
                let finalHeight;
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
            }
            catch (error) {
                console.error('Logo创建失败:', error);
            }
        }
    }
    // ==================== 九宫格抽奖模块构建器 ====================
    class NineGridModuleBuilder {
        constructor(content) {
            this.CELL_SIZE = 270; // 每个格子固定大小270x270px
            this.CELL_SPACING = 24; // 格子间距24px
            this.currentY = 0; // 当前Y位置
            this.content = content;
            this.frame = NodeUtils.createFrame('九宫格抽奖', CONSTANTS.H5_WIDTH, 1000);
            this.frame.fills = []; // 背景填充为透明
        }
        async build() {
            try {
                // 添加标题
                await this.addTitle();
                // 添加九宫格主体
                await this.addNineGrid();
                // 调整整个模块的高度
                this.adjustFrameHeight();
                return this.frame;
            }
            catch (error) {
                console.error('九宫格模块构建过程中出错：', error);
                throw error;
            }
        }
        // 添加标题
        async addTitle() {
            // 如果没有主标题，直接返回
            if (!this.content.mainTitle)
                return;
            // 创建标题容器：1080宽，高度120
            const titleContainer = NodeUtils.createFrame("九宫格标题", CONSTANTS.H5_WIDTH, 120);
            titleContainer.x = 0;
            titleContainer.y = this.currentY + 90;
            titleContainer.fills = []; // 透明背景
            // 添加标题背景图片节点（如果有）
            if (this.content.titleBgImage) {
                try {
                    const titleBgImage = await ImageNodeBuilder.insertImage(this.content.titleBgImage, "标题背景图片", CONSTANTS.H5_WIDTH, 120);
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
            // 添加标题文本节点
            const titleText = await NodeUtils.createText(this.content.mainTitle, 48, 'Bold');
            titleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
            titleText.resize(CONSTANTS.H5_WIDTH, titleText.height);
            titleText.textAlignHorizontal = "CENTER";
            titleText.x = 0;
            titleText.y = (120 - titleText.height) / 2; // 垂直居中
            NodeUtils.safeAppendChild(titleContainer, titleText, '标题文本添加');
            NodeUtils.safeAppendChild(this.frame, titleContainer, '标题容器添加');
            this.currentY += 120;
        }
        // 添加九宫格主体
        async addNineGrid() {
            // 计算九宫格主体容器高度：3行格子 + 间距 + 上下边距
            const gridHeight = 3 * this.CELL_SIZE + 4 * this.CELL_SPACING + 180; // 上下各90px边距
            // 创建九宫格主体容器：1080宽，高度按创建成功后的高度来
            const gridContainer = NodeUtils.createFrame("九宫格主体", CONSTANTS.H5_WIDTH, gridHeight);
            gridContainer.x = 0;
            gridContainer.y = this.currentY + 90;
            gridContainer.fills = []; // 填充为透明
            // 添加九宫格背景图片节点（930x930px，上下左右居中对齐）
            if (this.content.gridBgImage) {
                try {
                    const backgroundNode = await ImageNodeBuilder.insertImage(this.content.gridBgImage, "九宫格背景", 930, 930);
                    if (backgroundNode) {
                        backgroundNode.x = (CONSTANTS.H5_WIDTH - 930) / 2; // 水平居中
                        backgroundNode.y = (gridHeight - 930) / 2; // 垂直居中
                        NodeUtils.safeAppendChild(gridContainer, backgroundNode, '九宫格背景图片添加');
                    }
                }
                catch (error) {
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
        async createGridCell(row, col, index) {
            // 计算九宫格总宽度：3个格子 + 2个间距
            const gridTotalWidth = 3 * this.CELL_SIZE + 2 * this.CELL_SPACING;
            // 计算格子位置：在H5_WIDTH容器中居中，加上90px上边距
            const startX = (CONSTANTS.H5_WIDTH - gridTotalWidth) / 2; // 在1080px容器中居中
            const x = startX + col * (this.CELL_SIZE + this.CELL_SPACING);
            const y = 90 + this.CELL_SPACING + row * (this.CELL_SIZE + this.CELL_SPACING); // 添加90px上边距
            // 中间位置创建抽奖按钮
            if (index === 4) {
                return this.createDrawButton(x, y);
            }
            // 其他位置创建奖品格子
            return this.createPrizeCell(x, y, index);
        }
        async createDrawButton(x, y) {
            // 创建抽奖按钮容器（270x270px）
            const buttonFrame = NodeUtils.createFrame("抽奖按钮容器", this.CELL_SIZE, this.CELL_SIZE);
            buttonFrame.x = x;
            buttonFrame.y = y;
            buttonFrame.fills = []; // 容器填充为透明
            try {
                // 直接插入抽奖按钮图片节点
                if (this.content.drawButtonImage) {
                    try {
                        const buttonImage = await ImageNodeBuilder.insertImage(this.content.drawButtonImage, "抽奖按钮图片", this.CELL_SIZE, this.CELL_SIZE);
                        if (buttonImage) {
                            buttonImage.x = 0;
                            buttonImage.y = 0;
                            NodeUtils.safeAppendChild(buttonFrame, buttonImage, '抽奖按钮图片添加');
                        }
                        else {
                            console.warn('抽奖按钮图片插入失败，使用默认样式');
                            await this.addDefaultButtonStyle(buttonFrame);
                        }
                    }
                    catch (error) {
                        console.error('抽奖按钮图片创建失败：', error);
                        await this.addDefaultButtonStyle(buttonFrame);
                    }
                }
                else {
                    // 默认按钮样式
                    await this.addDefaultButtonStyle(buttonFrame);
                }
            }
            catch (error) {
                console.error('创建抽奖按钮失败：', error);
                await this.addDefaultButtonStyle(buttonFrame);
            }
            return buttonFrame;
        }
        async addDefaultButtonStyle(buttonFrame) {
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
        async createPrizeCell(x, y, index) {
            var _a;
            // 获取奖品索引（跳过中间的抽奖按钮）
            const prizeIndex = this.getPrizeIndex(Math.floor(index / 3), index % 3);
            const prize = (_a = this.content.prizes) === null || _a === void 0 ? void 0 : _a[prizeIndex];
            const prizeNumber = (prizeIndex + 1).toString();
            const paddedNumber = prizeNumber.length < 2 ? '0' + prizeNumber : prizeNumber;
            const prizeName = (prize === null || prize === void 0 ? void 0 : prize.name) || `奖品${paddedNumber}`;
            // 创建奖品容器（270x270px）
            const prizeBox = NodeUtils.createFrame(prizeName, this.CELL_SIZE, this.CELL_SIZE);
            prizeBox.x = x;
            prizeBox.y = y;
            prizeBox.fills = []; // 容器填充为透明
            try {
                // 直接插入奖品背景图片节点（270x270px）
                if (this.content.prizeBgImage) {
                    try {
                        const prizeBgImage = await ImageNodeBuilder.insertImage(this.content.prizeBgImage, "奖品背景图片", this.CELL_SIZE, this.CELL_SIZE);
                        if (prizeBgImage) {
                            prizeBgImage.x = 0;
                            prizeBgImage.y = 0;
                            NodeUtils.safeAppendChild(prizeBox, prizeBgImage, '奖品背景图片添加');
                        }
                    }
                    catch (error) {
                        console.error('奖品背景图片创建失败:', error);
                    }
                }
                // 插入奖品图图片节点（180x180px，坐标为x45px，y11px）
                if (prize === null || prize === void 0 ? void 0 : prize.image) {
                    try {
                        const prizeImage = await ImageNodeBuilder.insertImage(prize.image, "奖品图片", 180, 180);
                        if (prizeImage) {
                            prizeImage.x = 45;
                            prizeImage.y = 11;
                            NodeUtils.safeAppendChild(prizeBox, prizeImage, '奖品图片添加');
                        }
                    }
                    catch (error) {
                        console.error('奖品图片创建失败:', error);
                        // 如果奖品图片创建失败，添加占位符
                        const placeholder = NodeUtils.createFrame("占位符", 180, 180);
                        placeholder.x = 45;
                        placeholder.y = 11;
                        placeholder.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
                        placeholder.cornerRadius = 10;
                        NodeUtils.safeAppendChild(prizeBox, placeholder, '奖品占位符添加');
                    }
                }
                else {
                    // 如果没有奖品图片，添加占位符
                    const placeholder = NodeUtils.createFrame("占位符", 180, 180);
                    placeholder.x = 45;
                    placeholder.y = 11;
                    placeholder.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
                    placeholder.cornerRadius = 10;
                    NodeUtils.safeAppendChild(prizeBox, placeholder, '奖品默认占位符添加');
                }
                // 插入文本节点（大小26，Medium，居中对齐，距离容器顶部190px）
                const displayName = (prize === null || prize === void 0 ? void 0 : prize.name) || prizeName;
                if (displayName) {
                    const prizeText = await NodeUtils.createText(displayName, 26, 'Medium');
                    prizeText.resize(this.CELL_SIZE, prizeText.height);
                    prizeText.textAlignHorizontal = "CENTER";
                    prizeText.x = 0;
                    prizeText.y = 190;
                    prizeText.fills = [ColorUtils.createSolidFill({ r: 0, g: 0, b: 0 })]; // 设置黑色文字
                    NodeUtils.safeAppendChild(prizeBox, prizeText, '奖品名称文本添加');
                }
            }
            catch (error) {
                console.error(`创建奖品格子失败 ${prizeIndex}:`, error);
            }
            return prizeBox;
        }
        // 获取奖品在九宫格中的索引（跳过中间的抽奖按钮）
        getPrizeIndex(row, col) {
            const cellIndex = row * 3 + col;
            if (cellIndex < 4)
                return cellIndex;
            return cellIndex - 1; // 跳过中间的抽奖按钮位置
        }
        adjustFrameHeight() {
            this.frame.resize(CONSTANTS.H5_WIDTH, this.currentY + 90);
        }
    }
    // ==================== 图片轮播（横版）模块构建器 ====================
    class CarouselModuleBuilder {
        constructor(frame, content) {
            // 根据Figma设计的精确尺寸
            this.TITLE_HEIGHT = 120; // 标题容器高度
            this.CAROUSEL_AREA_HEIGHT = 607; // 轮播区域高度
            this.CAROUSEL_BG_WIDTH = 1000; // 轮播图背景宽度
            this.CAROUSEL_BG_HEIGHT = 540; // 轮播图背景高度
            this.CAROUSEL_IMAGE_WIDTH = 960; // 轮播图宽度
            this.CAROUSEL_IMAGE_HEIGHT = 500; // 轮播图高度
            this.BUTTON_HEIGHT = 20; // 轮播按钮高度
            this.frame = frame;
            this.content = content;
        }
        async build() {
            console.log('开始构建图片轮播（横版）模块 - 按Figma设计实现');
            try {
                // 设置框架布局
                this.setupFrameLayout();
                // 添加标题容器
                await this.addTitleContainer();
                // 添加轮播预览区域
                await this.addCarouselPreview();
                console.log('图片轮播（横版）模块构建完成');
            }
            catch (error) {
                console.error('图片轮播（横版）模块构建过程中出错：', error);
                throw error;
            }
        }
        // 设置框架布局 - 按Figma设计：垂直布局，间距30px，内边距90px
        setupFrameLayout() {
            NodeUtils.setupAutoLayout(this.frame, 'VERTICAL', 30, 90);
        }
        // 添加标题容器 - 与活动内容模块保持一致
        async addTitleContainer() {
            if (!this.content.title && !this.content.titleBgImage)
                return;
            console.log('添加标题容器 - 1080x120px');
            // 创建标题容器：1080x120px
            const titleContainer = NodeUtils.createFrame("标题容器", 1080, this.TITLE_HEIGHT);
            titleContainer.fills = []; // 透明背景
            // 添加标题背景图片 - 1080x120px（与活动内容模块一致）
            if (this.content.titleBgImage) {
                try {
                    const titleBgImage = await ImageNodeBuilder.insertImage(this.content.titleBgImage, "标题背景图片", 1080, 120);
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
            // 添加标题文本 - 48px字体，白色，垂直居中（与活动内容模块一致）
            if (this.content.title) {
                const titleText = await NodeUtils.createText(this.content.title, 48, 'Bold');
                titleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })]; // 白色
                titleText.resize(1080, titleText.height);
                titleText.textAlignHorizontal = "CENTER";
                titleText.x = 0;
                titleText.y = (120 - titleText.height) / 2; // 垂直居中（与活动内容模块一致）
                NodeUtils.safeAppendChild(titleContainer, titleText, '标题文本添加');
            }
            NodeUtils.safeAppendChild(this.frame, titleContainer, '标题容器添加');
        }
        // 添加轮播预览区域 - 精确按Figma设计实现
        async addCarouselPreview() {
            console.log('添加轮播预览区域');
            // 创建轮播预览容器
            const carouselPreview = NodeUtils.createFrame("轮播图预览", 1080, this.CAROUSEL_AREA_HEIGHT);
            carouselPreview.fills = []; // 透明背景
            NodeUtils.setupAutoLayout(carouselPreview, 'VERTICAL', 0, 0);
            // 添加轮播区域
            await this.addCarouselArea(carouselPreview);
            // 添加轮播按钮
            await this.addCarouselButtons(carouselPreview);
            NodeUtils.safeAppendChild(this.frame, carouselPreview, '轮播预览区域添加');
        }
        // 添加轮播区域 - 包含轮播图背景和轮播图
        async addCarouselArea(parent) {
            console.log('添加轮播区域 - 1080x607px');
            // 创建轮播区域容器
            const carouselArea = NodeUtils.createFrame("轮播区域", 1080, this.CAROUSEL_AREA_HEIGHT);
            carouselArea.fills = []; // 透明背景
            // 添加轮播图背景 - 1000x540px，白色，居中
            const carouselBg = NodeUtils.createFrame("轮播图背景", this.CAROUSEL_BG_WIDTH, this.CAROUSEL_BG_HEIGHT);
            if (this.content.carouselBgImage) {
                // 使用用户上传的背景图片
                try {
                    const bgImage = await ImageNodeBuilder.insertImage(this.content.carouselBgImage, "轮播图背景图片", this.CAROUSEL_BG_WIDTH, this.CAROUSEL_BG_HEIGHT);
                    if (bgImage) {
                        bgImage.x = 0;
                        bgImage.y = 0;
                        NodeUtils.safeAppendChild(carouselBg, bgImage, '轮播图背景图片添加');
                    }
                }
                catch (error) {
                    console.error('轮播图背景图片创建失败:', error);
                    // 失败时使用默认白色背景
                    carouselBg.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
                }
            }
            else {
                // 默认白色背景
                carouselBg.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
            }
            // 轮播图背景居中定位
            carouselBg.x = (1080 - this.CAROUSEL_BG_WIDTH) / 2; // 水平居中
            carouselBg.y = (this.CAROUSEL_AREA_HEIGHT - this.CAROUSEL_BG_HEIGHT) / 2 + 0.5; // 垂直居中偏移0.5px
            NodeUtils.safeAppendChild(carouselArea, carouselBg, '轮播图背景添加');
            // 添加轮播图 - 960x500px，居中在背景上
            if (this.content.carouselImage) {
                try {
                    const carouselImageNode = await ImageNodeBuilder.insertImage(this.content.carouselImage, "轮播图", this.CAROUSEL_IMAGE_WIDTH, this.CAROUSEL_IMAGE_HEIGHT);
                    if (carouselImageNode) {
                        // 轮播图居中定位
                        carouselImageNode.x = (1080 - this.CAROUSEL_IMAGE_WIDTH) / 2; // 水平居中
                        carouselImageNode.y = (this.CAROUSEL_AREA_HEIGHT - this.CAROUSEL_IMAGE_HEIGHT) / 2 + 0.5; // 垂直居中偏移0.5px
                        NodeUtils.safeAppendChild(carouselArea, carouselImageNode, '轮播图添加');
                    }
                }
                catch (error) {
                    console.error('轮播图创建失败:', error);
                    // 创建红色占位矩形
                    const placeholder = figma.createRectangle();
                    placeholder.name = "轮播图";
                    placeholder.resize(this.CAROUSEL_IMAGE_WIDTH, this.CAROUSEL_IMAGE_HEIGHT);
                    placeholder.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.3, b: 0.3 })]; // 红色占位
                    placeholder.x = (1080 - this.CAROUSEL_IMAGE_WIDTH) / 2;
                    placeholder.y = (this.CAROUSEL_AREA_HEIGHT - this.CAROUSEL_IMAGE_HEIGHT) / 2 + 0.5;
                    NodeUtils.safeAppendChild(carouselArea, placeholder, '轮播图占位添加');
                }
            }
            NodeUtils.safeAppendChild(parent, carouselArea, '轮播区域添加');
        }
        // 添加轮播按钮 - 按Figma设计：5个圆形按钮，第一个为长椭圆
        async addCarouselButtons(parent) {
            console.log('添加轮播按钮');
            // 创建轮播按钮容器
            const buttonsContainer = NodeUtils.createFrame("轮播按钮", 300, this.BUTTON_HEIGHT);
            buttonsContainer.fills = []; // 透明背景
            NodeUtils.setupAutoLayout(buttonsContainer, 'HORIZONTAL', 24, 0); // 水平布局，间距24px
            // 第一个按钮 - 长椭圆形，活跃状态
            const activeButton = figma.createEllipse();
            activeButton.name = "活跃按钮";
            activeButton.resize(60, this.BUTTON_HEIGHT);
            activeButton.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })]; // 白色填充
            NodeUtils.safeAppendChild(buttonsContainer, activeButton, '活跃按钮添加');
            // 其他4个按钮 - 圆形，非活跃状态
            for (let i = 1; i < 5; i++) {
                const button = figma.createEllipse();
                button.name = `按钮${i + 1}`;
                button.resize(this.BUTTON_HEIGHT, this.BUTTON_HEIGHT);
                button.fills = []; // 透明填充
                button.strokes = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })]; // 白色边框
                button.strokeWeight = 2;
                NodeUtils.safeAppendChild(buttonsContainer, button, `按钮${i + 1}添加`);
            }
            // 按钮容器居中
            buttonsContainer.x = (1080 - buttonsContainer.width) / 2;
            NodeUtils.safeAppendChild(parent, buttonsContainer, '轮播按钮容器添加');
        }
    }
    // ==================== 活动内容构建器 ====================
    class ActivityContentBuilder {
        constructor(frame, content) {
            this.frame = frame;
            this.content = content;
        }
        async build() {
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
            }
            catch (error) {
                console.error('活动内容模块（非规则）构建过程中出错：', error);
                throw error;
            }
        }
        // 设置自动布局
        setupAutoLayout() {
            NodeUtils.setupAutoLayout(this.frame, 'VERTICAL', 60, 90); // 垂直布局，间距60px，上下边距90px
        }
        // 添加大标题
        async addMainTitle() {
            // 如果没有大标题背景，则不创建大标题容器
            if (!this.content.mainTitleBg || !this.content.mainTitle)
                return;
            console.log('添加大标题...');
            // 创建大标题容器：1080宽，高度120
            const titleContainer = NodeUtils.createFrame("活动内容大标题容器", 1080, 120);
            titleContainer.fills = []; // 透明背景
            // 添加大标题背景图片节点
            try {
                const titleBgImage = await ImageNodeBuilder.insertImage(this.content.mainTitleBg, "大标题背景图片", 1080, 120);
                if (titleBgImage) {
                    titleBgImage.x = 0;
                    titleBgImage.y = 0;
                    NodeUtils.safeAppendChild(titleContainer, titleBgImage, '活动内容标题背景图片添加');
                }
            }
            catch (error) {
                console.error('大标题背景图片创建失败:', error);
            }
            // 添加大标题文本节点
            const titleText = await NodeUtils.createText(this.content.mainTitle, 48, 'Bold');
            titleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
            titleText.resize(CONSTANTS.H5_WIDTH, titleText.height);
            titleText.textAlignHorizontal = "CENTER";
            titleText.x = 0;
            titleText.y = (120 - titleText.height) / 2; // 垂直居中
            NodeUtils.safeAppendChild(titleContainer, titleText, '活动内容标题文本添加');
            NodeUtils.safeAppendChild(this.frame, titleContainer, '活动内容标题容器添加');
        }
        // 添加小标题
        async addSubTitle() {
            // 如果没有小标题背景，则不创建小标题容器
            if (!this.content.subTitleBg || !this.content.subTitle)
                return;
            console.log('添加小标题...');
            // 创建小标题容器：1080宽，高度100
            const subTitleContainer = NodeUtils.createFrame("活动内容小标题容器", 1080, 100);
            subTitleContainer.fills = []; // 透明背景
            // 添加小标题背景图片节点
            try {
                const subTitleBgImage = await ImageNodeBuilder.insertImage(this.content.subTitleBg, "小标题背景图片", 1080, 100);
                if (subTitleBgImage) {
                    subTitleBgImage.x = 0;
                    subTitleBgImage.y = 0;
                    NodeUtils.safeAppendChild(subTitleContainer, subTitleBgImage, '小标题背景图片添加');
                }
            }
            catch (error) {
                console.error('小标题背景图片创建失败:', error);
            }
            // 添加小标题文本节点 - 44大小，Medium
            const subTitleText = await NodeUtils.createText(this.content.subTitle, 44, 'Medium');
            subTitleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
            subTitleText.resize(CONSTANTS.H5_WIDTH, subTitleText.height);
            subTitleText.textAlignHorizontal = "CENTER"; // 设置小标题文本水平居中对齐
            subTitleText.x = 0;
            subTitleText.y = (100 - subTitleText.height) / 2; // 垂直居中
            NodeUtils.safeAppendChild(subTitleContainer, subTitleText, '小标题文本添加');
            NodeUtils.safeAppendChild(this.frame, subTitleContainer, '小标题容器添加');
        }
        // 添加正文
        async addTextContent() {
            // 如果没有输入内容，则不创建
            if (!this.content.text)
                return;
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
        async addImage() {
            // 如果没有上传图片，则不插入图片节点
            if (!this.content.image)
                return;
            console.log('添加插图...');
            try {
                // 直接插入插图图片节点至活动内容模块容器，宽度为950
                const imageNode = await ImageNodeBuilder.insertImage(this.content.image, "活动内容插图", 950, 600 // 默认高度，会根据实际图片调整
                );
                if (imageNode) {
                    NodeUtils.safeAppendChild(this.frame, imageNode, '活动内容插图添加');
                }
            }
            catch (error) {
                console.error('插图创建失败:', error);
            }
        }
        // 调整整个模块的高度
        adjustFrameHeight() {
            // 自动布局会自动调整高度，无需手动设置
            // 框架会根据内容自动调整到合适的高度
        }
    }
    // ==================== 签到模块构建器 ====================
    class SignInModuleBuilder {
        constructor(frame, content) {
            this.frame = frame;
            this.content = content;
        }
        async build() {
            await this.setupBackground();
            await this.addTitle();
            await this.addSignInDays();
            await this.addSignInButton();
        }
        async setupBackground() {
            if (this.content.bgImage) {
                await ImageNodeBuilder.setImageFill(this.frame, this.content.bgImage);
            }
            else {
                this.frame.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 1 })];
            }
        }
        async addTitle() {
            const titleFrame = NodeUtils.createFrame("签到标题", 500, 100);
            titleFrame.x = (CONSTANTS.H5_WIDTH - 500) / 2;
            titleFrame.y = 20;
            if (this.content.titleImage) {
                await ImageNodeBuilder.setImageFill(titleFrame, this.content.titleImage, 'FIT');
            }
            else {
                await this.addDefaultTitle(titleFrame);
            }
            NodeUtils.safeAppendChild(this.frame, titleFrame, '签到标题添加');
        }
        async addDefaultTitle(titleFrame) {
            titleFrame.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.5, b: 0.3 })];
            const titleText = await NodeUtils.createText("每日签到", 28, 'Bold');
            titleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
            titleText.resize(500, titleText.height);
            titleText.textAlignHorizontal = "CENTER";
            titleText.y = (100 - titleText.height) / 2;
            NodeUtils.safeAppendChild(titleFrame, titleText, '签到默认标题文本添加');
        }
        async addSignInDays() {
            const daysContainer = NodeUtils.createFrame("签到日期容器", CONSTANTS.H5_WIDTH - 40, 240);
            daysContainer.x = 20;
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
        async createDayItem(dayNumber) {
            const dayItem = NodeUtils.createFrame(`第${dayNumber}天`, 80, 220);
            dayItem.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 0.95 })];
            dayItem.cornerRadius = 5;
            NodeUtils.setupAutoLayout(dayItem, 'VERTICAL', 10, 10);
            const dayIconFrame = await this.createDayIcon();
            NodeUtils.safeAppendChild(dayItem, dayIconFrame, '签到日期图标添加');
            const dayText = await NodeUtils.createText(`第${dayNumber}天`, 16, 'Medium');
            dayText.resize(80, dayText.height);
            dayText.textAlignHorizontal = "CENTER";
            NodeUtils.safeAppendChild(dayItem, dayText, '签到日期文本添加');
            const rewardText = await NodeUtils.createText("金币 x 100", 14);
            rewardText.fills = [ColorUtils.createSolidFill({ r: 0.5, g: 0.5, b: 0.5 })];
            rewardText.resize(80, rewardText.height);
            rewardText.textAlignHorizontal = "CENTER";
            NodeUtils.safeAppendChild(dayItem, rewardText, '签到奖励描述添加');
            return dayItem;
        }
        async createDayIcon() {
            const dayIconFrame = NodeUtils.createFrame("日期图标", 60, 60);
            if (this.content.dayIcon) {
                await ImageNodeBuilder.setImageFill(dayIconFrame, this.content.dayIcon, 'FILL');
            }
            else {
                dayIconFrame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.8, b: 0.2 })];
                dayIconFrame.cornerRadius = 30;
            }
            return dayIconFrame;
        }
        async addSignInButton() {
            const buttonFrame = NodeUtils.createFrame("签到按钮", 200, 60);
            buttonFrame.x = (CONSTANTS.H5_WIDTH - 200) / 2;
            buttonFrame.y = 400;
            if (this.content.signButton) {
                await ImageNodeBuilder.setImageFill(buttonFrame, this.content.signButton, 'FIT');
            }
            else {
                await this.addDefaultButton(buttonFrame);
            }
            NodeUtils.safeAppendChild(this.frame, buttonFrame, '签到按钮框架添加');
        }
        async addDefaultButton(buttonFrame) {
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
    // ==================== 集卡模块构建器 ====================
    class CollectCardsModuleBuilder {
        constructor(frame, content) {
            this.frame = frame;
            this.content = content;
        }
        async build() {
            // 设置背景
            if (this.content.bgImage) {
                await ImageNodeBuilder.setImageFill(this.frame, this.content.bgImage);
            }
            else {
                this.frame.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.9, b: 1 })];
            }
            let currentY = 20;
            // 添加标题
            if (this.content.titleImage) {
                const titleFrame = NodeUtils.createFrame("集卡标题", 400, 80);
                titleFrame.x = (CONSTANTS.H5_WIDTH - 400) / 2;
                titleFrame.y = currentY;
                await ImageNodeBuilder.setImageFill(titleFrame, this.content.titleImage, 'FIT');
                NodeUtils.safeAppendChild(this.frame, titleFrame, '集卡标题添加');
                currentY += 100;
            }
            // 创建卡片容器
            const cardsContainer = NodeUtils.createFrame("卡片容器", CONSTANTS.H5_WIDTH - 40, 200);
            cardsContainer.x = 20;
            cardsContainer.y = currentY;
            cardsContainer.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 }, 0.9)];
            cardsContainer.cornerRadius = 10;
            NodeUtils.setupAutoLayout(cardsContainer, 'HORIZONTAL', 10, 10);
            // 添加卡片
            const cardsCount = this.content.cardsCount || 5;
            for (let i = 0; i < cardsCount; i++) {
                const cardFrame = await this.createCardItem(i + 1);
                NodeUtils.safeAppendChild(cardsContainer, cardFrame, `集卡卡片${i + 1}添加`);
            }
            NodeUtils.safeAppendChild(this.frame, cardsContainer, '集卡卡片容器添加');
            currentY += 220;
            // 添加合成按钮
            if (this.content.combineButton) {
                const buttonFrame = NodeUtils.createFrame("合成按钮", 200, 60);
                buttonFrame.x = (CONSTANTS.H5_WIDTH - 200) / 2;
                buttonFrame.y = currentY;
                await ImageNodeBuilder.setImageFill(buttonFrame, this.content.combineButton, 'FIT');
                NodeUtils.safeAppendChild(this.frame, buttonFrame, '合成按钮添加');
                currentY += 80;
            }
            // 调整frame高度
            this.frame.resize(CONSTANTS.H5_WIDTH, currentY);
        }
        async createCardItem(cardNumber) {
            const cardSize = 100;
            const cardFrame = NodeUtils.createFrame(`卡片${cardNumber}`, cardSize, cardSize + 30);
            // 设置卡片背景
            if (this.content.cardBg) {
                await ImageNodeBuilder.setImageFill(cardFrame, this.content.cardBg, 'FILL');
            }
            else {
                cardFrame.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
            }
            // 根据卡片样式设置圆角
            switch (this.content.cardStyle) {
                case 'style1':
                    cardFrame.cornerRadius = 0;
                    break;
                case 'style2':
                    cardFrame.cornerRadius = 10;
                    break;
                case 'style3':
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
            NodeUtils.safeAppendChild(cardFrame, cardText, '集卡卡片编号添加');
            return cardFrame;
        }
    }

    // H5原型构建器
    // 负责构建完整的H5原型
    /// <reference types="@figma/plugin-typings" />
    /**
     * H5原型构建器
     * 负责根据配置创建完整的H5原型
     */
    class H5PrototypeBuilder {
        /**
         * 构造函数
         * @param config H5配置对象
         */
        constructor(config) {
            this.config = config;
        }
        /**
         * 构建H5原型
         * 这个方法执行整个H5原型的创建过程
         * @returns Promise<FrameNode> 返回创建完成的外层画板
         */
        async build() {
            try {
                console.log('开始构建H5原型...');
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
                console.log('H5原型构建完成');
                return this.outerFrame;
            }
            catch (error) {
                console.error('H5原型构建失败:', error);
                throw error;
            }
        }
        /**
         * 检查是否有任何模块内容需要创建
         * @returns boolean 如果有任何模块内容返回true，否则返回false
         */
        hasAnyModuleContent() {
            // 检查头部模块内容
            const hasHeaderContent = !!(this.config.headerImage || this.config.titleUpload);
            // 检查游戏信息模块内容
            const hasGameInfoContent = !!(this.config.gameName || this.config.gameDesc || this.config.gameIcon);
            // 检查自定义模块内容
            const hasCustomModules = !!(this.config.modules && this.config.modules.length > 0);
            // 检查规则模块内容
            const hasRulesTitle = this.config.rulesTitle && this.config.rulesTitle.trim() !== '';
            const hasRulesBgImage = this.config.rulesBgImage !== null && this.config.rulesBgImage !== undefined;
            const hasRulesContent = this.config.rulesContent && this.config.rulesContent.trim() !== '';
            const hasRulesContent_any = hasRulesTitle || hasRulesBgImage || hasRulesContent;
            // 检查底部模块内容
            const hasFooterContent = !!(this.config.footerLogo || this.config.footerBg);
            // 如果有任何模块内容，返回true
            return hasHeaderContent || hasGameInfoContent || hasCustomModules || hasRulesContent_any || hasFooterContent;
        }
        createBaseFrames() {
            // 1. H5原型容器不需要应用自动布局，只是一个画板，并设置内容裁剪
            this.outerFrame = NodeUtils.createFrame('H5原型', CONSTANTS.H5_WIDTH, 100);
            this.outerFrame.layoutMode = "NONE"; // 不使用自动布局
            this.outerFrame.clipsContent = true; // 设置内容裁剪
            // 🚨 重要：初始化时设置为透明填充，避免默认白色背景
            this.outerFrame.fills = [];
            // 2. 只有当有模块内容时才创建自适应模块容器
            if (this.hasAnyModuleContent()) {
                this.h5Frame = NodeUtils.createFrame('自适应模块', CONSTANTS.H5_WIDTH, 100);
                this.h5Frame.fills = [];
                // 设置自适应模块容器的自动布局
                NodeUtils.setupAutoLayout(this.h5Frame, 'VERTICAL', 0, 0);
                this.h5Frame.clipsContent = true; // 设置内容裁剪
                this.h5Frame.layoutWrap = "NO_WRAP"; // 设置布局不换行，确保所有子元素在一列中垂直排列
                console.log('检测到模块内容，已创建自适应模块容器');
            }
            else {
                console.log('未检测到模块内容，跳过自适应模块容器创建');
            }
        }
        /**
         * 设置背景
         * 根据配置设置页面背景，可以是图片或颜色
         */
        async setupBackground() {
            // 🚨 调试：显示传入的颜色配置
            console.log('🎨 [背景设置调试] 开始设置背景，配置信息:');
            console.log('   - pageBgColor:', this.config.pageBgColor);
            console.log('   - pageBgImage:', !!this.config.pageBgImage);
            // 🚨 修复：检测白色背景的逻辑更加严格
            const isDefaultWhite = !this.config.pageBgColor ||
                this.config.pageBgColor === "#FFFFFF" ||
                this.config.pageBgColor === "#ffffff" ||
                this.config.pageBgColor.toLowerCase() === "#ffffff";
            console.log('   - 是否为默认白色:', isDefaultWhite);
            // 自适应模块容器始终设置为透明填充
            if (this.h5Frame) {
                this.h5Frame.fills = []; // 始终透明
                console.log('✅ 自适应模块容器设置为透明填充');
            }
            // 🚨 修复：背景颜色设置逻辑
            if (!isDefaultWhite) {
                // 非白色时，设置指定颜色填充
                console.log('🎯 [颜色转换] 开始转换颜色:', this.config.pageBgColor);
                const rgbColor = ColorUtils.hexToRgb(this.config.pageBgColor || '#FFFFFF');
                console.log('   - RGB转换结果:', rgbColor);
                const colorFill = ColorUtils.createSolidFill(rgbColor);
                console.log('   - 创建的填充对象:', colorFill);
                this.outerFrame.fills = [colorFill];
                console.log(`✅ H5原型容器背景色设置为: ${this.config.pageBgColor}`);
                console.log('   - 最终Frame填充:', this.outerFrame.fills);
            }
            else {
                // 🚨 关键修复：白色或未设置时，确保透明填充（不是默认的白色填充）
                this.outerFrame.fills = [];
                console.log('✅ H5原型容器背景设置为透明（默认白色，代表用户未修改）');
                console.log('   - 最终Frame填充:', this.outerFrame.fills);
            }
            // 当bgImageData存在时，兼容pageBgColor的设置判定
            if (this.config.pageBgImage) {
                const bgImageData = Utils.extractUint8Array(this.config.pageBgImage);
                if (bgImageData) {
                    console.log('🖼️  开始添加背景图片');
                    // 直接将bgImageData图片节点插入H5原型容器中
                    const bgImageNode = await ImageNodeBuilder.insertImage(this.config.pageBgImage, "页面背景图片");
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
                        console.log('✅ 背景图片添加完成');
                    }
                }
            }
            // 设置完背景之后，如果存在自适应模块容器，将其添加为H5原型容器的子元素
            if (this.h5Frame) {
                NodeUtils.safeAppendChild(this.outerFrame, this.h5Frame, 'H5自适应模块容器添加');
            }
            console.log('🎨 [背景设置调试] 背景设置完成');
        }
        /**
         * 添加模块
         * 创建所有模块并将它们添加到H5画板中
         */
        async addModules() {
            // 如果没有自适应模块容器，说明没有模块内容，直接返回
            if (!this.h5Frame) {
                console.log('没有自适应模块容器，跳过模块添加');
                return;
            }
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
        async createAllModules() {
            return Promise.all([
                this.createHeaderModuleIfNeeded(), // 创建头部模块（如果需要）
                this.createGameInfoModuleIfNeeded(), // 创建游戏信息模块（如果需要）
                ...this.createCustomModules(), // 创建自定义模块（展开数组）
                this.createRulesModuleIfNeeded(), // 创建规则模块（如果需要）
                this.createFooterModuleIfNeeded() // 创建底部模块
            ]);
        }
        async createHeaderModuleIfNeeded() {
            if (this.config.headerImage || this.config.titleUpload) {
                const module = await createHeaderModule(this.config.headerImage, this.config.titleUpload);
                if (module) {
                    return module;
                }
            }
            return null;
        }
        async createGameInfoModuleIfNeeded() {
            if (this.config.gameName || this.config.gameDesc || this.config.gameIcon) {
                const module = await createGameInfoModule(this.config);
                return module;
            }
            return null;
        }
        createCustomModules() {
            var _a;
            return ((_a = this.config.modules) === null || _a === void 0 ? void 0 : _a.map(async (module) => {
                const moduleFrame = await createCustomModule(module);
                return moduleFrame;
            })) || [];
        }
        async createRulesModuleIfNeeded() {
            // 检查是否有任何活动规则相关内容
            const hasRulesTitle = this.config.rulesTitle && this.config.rulesTitle.trim() !== '';
            const hasRulesBgImage = this.config.rulesBgImage !== null && this.config.rulesBgImage !== undefined;
            const hasRulesContent = this.config.rulesContent && this.config.rulesContent.trim() !== '';
            // 只有当标题文案、标题背景图或活动规则内容任一存在时才创建模块
            if (hasRulesTitle || hasRulesBgImage || hasRulesContent) {
                const module = await createRulesModule(this.config);
                return module;
            }
            return null;
        }
        /**
         * 创建底部模块（如果需要）
         * 如果配置中包含底部logo或背景，则创建底部模块
         * @returns Promise<FrameNode | null> 返回创建的底部模块或null
         */
        async createFooterModuleIfNeeded() {
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
        finalizeLayout() {
            // 2. 调整H5原型容器高度
            if (this.h5Frame) {
                // 如果有自适应模块容器，调整为自适应模块容器高度
                this.outerFrame.resize(CONSTANTS.H5_WIDTH, this.h5Frame.height);
                // 确保自适应模块容器在最上层显示（使用insertChild方法而不是remove+appendChild）
                try {
                    if (this.h5Frame.parent === this.outerFrame) {
                        // 获取当前子节点数量，将h5Frame移动到最后位置（最上层）
                        const childrenCount = this.outerFrame.children.length;
                        if (childrenCount > 1) {
                            // 使用insertChild将节点移动到最后位置
                            this.outerFrame.insertChild(childrenCount - 1, this.h5Frame);
                        }
                    }
                }
                catch (reorderError) {
                    console.error('重新排列H5模块容器失败:', reorderError);
                }
            }
            else {
                // 如果没有自适应模块容器，设置一个最小高度或根据背景图片调整
                let finalHeight = 100; // 默认最小高度
                // 如果有背景图片，根据背景图片高度调整
                if (this.config.pageBgImage) {
                    // 查找背景图片节点
                    const bgImageNode = this.outerFrame.findOne(node => node.name === '页面背景图片');
                    if (bgImageNode && 'height' in bgImageNode) {
                        finalHeight = Math.max(finalHeight, bgImageNode.height);
                    }
                }
                this.outerFrame.resize(CONSTANTS.H5_WIDTH, finalHeight);
                console.log(`没有模块内容，H5原型设置为最小高度: ${finalHeight}px`);
            }
            // 添加到当前页面并居中显示
            NodeUtils.safeAppendChild(figma.currentPage, this.outerFrame, 'H5原型添加到当前页面');
            figma.viewport.scrollAndZoomIntoView([this.outerFrame]);
        }
    }
    /**
     * 创建H5原型的便捷函数
     * @param config H5配置对象
     * @returns Promise<FrameNode> 返回创建完成的H5原型
     */
    async function createH5Prototype(config) {
        const builder = new H5PrototypeBuilder(config);
        return builder.build();
    }

    /// <reference types="@figma/plugin-typings" />
    // ==================== 渠道原型生成器 ====================
    // 全局渠道图片数据（从客户端存储中获取）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let channelImages = {};
    // 初始化渠道图片数据
    async function initChannelImages() {
        try {
            // 初始化为空对象，从各个渠道的客户端存储中加载
            channelImages = {};
            const channels = ['oppo', 'vivo', 'huawei', 'xiaomi'];
            for (const channel of channels) {
                const stored = await figma.clientStorage.getAsync(`channel-images-${channel}`);
                if (stored) {
                    channelImages[channel] = JSON.parse(stored);
                    console.log(`已加载 ${channel} 渠道图片数据`);
                }
            }
        }
        catch (error) {
            console.warn('获取渠道图片数据失败:', error);
            channelImages = {};
        }
    }
    /**
     * 渠道配置接口（原始版本，与code.ts保持一致）
     */
    /**
     * 渠道原型生成器类
     * 负责根据不同渠道的规格要求生成对应的H5原型版本
     */
    class ChannelPrototypeGenerator {
        constructor(channel, sourcePrototype) {
            this.channel = channel.toLowerCase();
            this.sourcePrototype = sourcePrototype;
        }
        /**
         * 生成渠道版本的主方法
         */
        async generate() {
            try {
                console.log(`开始生成${this.channel}渠道版本`);
                // 1. 复制原始原型
                const channelPrototype = await this.clonePrototype();
                // 2. 应用渠道特定的调整
                await this.applyChannelAdjustments(channelPrototype);
                // 3. 定位新原型位置
                this.positionChannelPrototype(channelPrototype);
                console.log(`${this.channel}渠道版本创建完成`);
            }
            catch (error) {
                console.error(`生成${this.channel}渠道版本失败:`, error);
                throw error;
            }
        }
        /**
         * 复制原始原型
         */
        async clonePrototype() {
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
            }
            catch (error) {
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
        async applyChannelAdjustments(prototype) {
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
            }
            catch (error) {
                console.error(`应用${this.channel}渠道调整失败:`, error);
                throw error;
            }
        }
        /**
         * 查找自适应模块容器
         * 自适应模块是包含所有可调整模块的容器，是渠道适配的主要目标
         */
        findAdaptiveModule(prototype) {
            const findAdaptive = (node) => {
                if (node.type === 'FRAME' && node.name === '自适应模块') {
                    return node;
                }
                if ('children' in node) {
                    for (const child of node.children) {
                        const result = findAdaptive(child);
                        if (result)
                            return result;
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
        async adjustAdaptiveModuleContent(adaptiveModule) {
            for (const child of adaptiveModule.children) {
                if (child.type === 'FRAME') {
                    const moduleFrame = child;
                    await this.adjustModuleStyles(moduleFrame); // 调整模块样式
                    await this.adjustModuleContent(moduleFrame); // 调整模块内容
                }
            }
        }
        /**
         * 调整渠道H5容器尺寸与自适应模块保持一致
         */
        resizeChannelPrototype(prototype, adaptiveModule) {
            try {
                // 获取自适应模块的尺寸
                const moduleWidth = adaptiveModule.width;
                const moduleHeight = adaptiveModule.height;
                // 调整渠道H5容器的尺寸
                prototype.resize(moduleWidth, moduleHeight);
                console.log(`${this.channel}渠道H5容器尺寸已调整为: ${moduleWidth}x${moduleHeight}`);
            }
            catch (error) {
                console.error('调整渠道H5容器尺寸失败:', error);
            }
        }
        /**
         * 调整特定模块的样式（尺寸、间距等）
         */
        async adjustModuleStyles(moduleFrame) {
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
            }
            catch (error) {
                console.error(`调整模块样式失败:`, error);
            }
        }
        /**
         * 调整特定模块的内容（文本、图片等）
         */
        async adjustModuleContent(moduleFrame) {
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
            }
            catch (error) {
                console.error(`调整模块内容失败:`, error);
            }
        }
        /**
         * OPPO渠道样式调整
         */
        async applyOppoStyles(moduleFrame) {
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
            }
            catch (error) {
                console.error(`OPPO样式调整失败:`, error);
            }
        }
        /**
         * 调整OPPO头图模块
         */
        async adjustOppoHeaderModule(headerFrame) {
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
            }
            catch (error) {
                console.error('调整OPPO头图模块失败:', error);
            }
        }
        /**
         * 查找蒙版矩形节点
         */
        findMaskRectangle(container) {
            // 递归查找蒙版矩形
            const findMask = (node) => {
                if (node.type === 'RECTANGLE' && node.name === '蒙版') {
                    return node;
                }
                if ('children' in node) {
                    for (const child of node.children) {
                        const result = findMask(child);
                        if (result)
                            return result;
                    }
                }
                return null;
            };
            return findMask(container);
        }
        /**
         * 查找头图图片节点
         */
        findHeaderImageNode(container) {
            // 递归查找头图图片节点
            const findHeaderImage = (node) => {
                // 仅查找名称为"头图图片"的节点
                if (node.name === '头图图片') {
                    return node;
                }
                // 递归查找子节点
                if ('children' in node) {
                    for (const child of node.children) {
                        const result = findHeaderImage(child);
                        if (result)
                            return result;
                    }
                }
                return null;
            };
            return findHeaderImage(container);
        }
        /**
         * 调整OPPO九宫格模块
         */
        async adjustOppoNineGridModule(nineGridFrame) {
            try {
                console.log('开始调整OPPO九宫格模块');
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
            }
            catch (error) {
                console.error('调整OPPO九宫格模块失败:', error);
            }
        }
        /**
         * 调整OPPO尾版模块
         */
        async adjustOppoFooterModule(footerFrame) {
            try {
                console.log('开始调整OPPO尾版模块');
                // 调整尾版容器高度为807px
                footerFrame.resize(footerFrame.width, 807);
                // 清除尾版LOGO
                this.clearFooterLogo(footerFrame);
                // 插入尾版样式图片
                await this.insertFooterStyleImage(footerFrame, this.channel);
                console.log('OPPO尾版模块调整完成');
            }
            catch (error) {
                console.error('调整OPPO尾版模块失败:', error);
            }
        }
        /**
         * 清除尾版LOGO
         */
        clearFooterLogo(footerFrame) {
            try {
                // 查找并删除LOGO图片节点
                const logoNode = footerFrame.findOne(node => node.name.toLowerCase().includes('logo'));
                if (logoNode) {
                    NodeUtils.safeRemoveNode(logoNode, '清除尾版LOGO');
                    console.log('尾版LOGO已清除');
                }
            }
            catch (error) {
                console.error('清除尾版LOGO失败:', error);
            }
        }
        /**
         * 查找九宫格主体容器
         */
        findNineGridMainContainer(nineGridFrame) {
            const mainContainer = nineGridFrame.findOne(node => node.type === 'FRAME' && node.name === '九宫格主体');
            return mainContainer || null;
        }
        /**
         * 清除容器内容
         */
        clearContainerContent(container) {
            try {
                // 删除所有子节点
                const children = [...container.children]; // 创建副本避免遍历时修改
                children.forEach(child => {
                    NodeUtils.safeRemoveNode(child, `清除${container.name}子节点`);
                });
                console.log(`已清除${container.name}的所有内容`);
            }
            catch (error) {
                console.error(`清除容器内容失败:`, error);
            }
        }
        /**
         * 插入砸蛋样式图片
         */
        async insertEggBreakingImage(container, channel) {
            try {
                // 获取上传的砸蛋样式图片
                const channelData = channelImages[channel];
                const eggBreakingData = channelData === null || channelData === void 0 ? void 0 : channelData.eggBreaking;
                if (eggBreakingData) {
                    // 使用上传的图片
                    const imageNode = await this.createImageFromData(eggBreakingData, '砸蛋样式');
                    imageNode.resize(864, 512);
                    imageNode.x = 108; // 距离左边108px
                    imageNode.y = 150; // 距离上边150px
                    NodeUtils.safeAppendChild(container, imageNode, '砸蛋样式图片添加');
                    console.log('砸蛋样式图片已插入:', eggBreakingData.name);
                }
                else {
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
            }
            catch (error) {
                console.error('插入砸蛋样式图片失败:', error);
            }
        }
        /**
         * 创建立即抽奖容器
         */
        async createDrawContainer(mainContainer, nineGridFrame) {
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
                    }
                    else {
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
                }
                catch (textError) {
                    console.error('创建文本节点失败:', textError);
                    // 即使文本创建失败，也继续执行后续代码
                }
                NodeUtils.safeAppendChild(mainContainer, drawContainer, '立即抽奖容器添加');
                return drawContainer;
            }
            catch (error) {
                console.error('创建立即抽奖容器失败:', error);
                return null;
            }
        }
        /**
         * 创建我的奖品容器
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async createMyPrizesContainer(mainContainer, drawContainer, nineGridFrame) {
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
                    }
                    else {
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
                }
                catch (textError) {
                    console.error('创建我的奖品文本失败:', textError);
                }
                NodeUtils.safeAppendChild(mainContainer, myPrizesContainer, '我的奖品容器添加');
                return myPrizesContainer;
            }
            catch (error) {
                console.error('创建我的奖品容器失败:', error);
                return null;
            }
        }
        /**
         * 创建活动规则按钮
         */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        async createRulesContainer(mainContainer, myPrizesContainer, nineGridFrame) {
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
                    }
                    else {
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
                }
                catch (textError) {
                    console.error('创建活动规则文本失败:', textError);
                }
                NodeUtils.safeAppendChild(mainContainer, rulesContainer, '活动规则按钮添加');
            }
            catch (error) {
                console.error('创建活动规则按钮失败:', error);
            }
        }
        /**
         * 从游戏信息容器复制按钮底图图片
         */
        async copyButtonImageFromGameInfo(nineGridFrame) {
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
                    // 查找名称为"按钮底图"的节点
                    if (node.name === '按钮底图') {
                        // 确保节点是可克隆的SceneNode类型
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
                console.error('从游戏信息复制按钮底图失败:', error);
                return null;
            }
        }
        /**
         * 从游戏信息容器获取下载按钮的文本样式
         */
        getDownloadButtonTextStyle(nineGridFrame) {
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
                // 递归查找下载按钮容器中的文本节点
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
                        fills: textNode.fills
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
         * 插入尾版样式图片
         */
        async insertFooterStyleImage(footerFrame, channel) {
            try {
                // 获取上传的尾版样式图片
                const channelData = channelImages[channel];
                const footerStyleData = channelData === null || channelData === void 0 ? void 0 : channelData.footerStyle;
                if (footerStyleData) {
                    // 使用上传的图片
                    const imageNode = await this.createImageFromData(footerStyleData, '尾版样式');
                    imageNode.resize(1080, 289);
                    imageNode.x = (footerFrame.width - 1080) / 2; // 左右居中
                    imageNode.y = 122; // 距离上122px
                    NodeUtils.safeAppendChild(footerFrame, imageNode, '尾版样式图片添加');
                    console.log('尾版样式图片已插入:', footerStyleData.name);
                }
                else {
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
            }
            catch (error) {
                console.error('插入尾版样式图片失败:', error);
            }
        }
        async createImageFromData(imageData, name) {
            // 处理不同类型的图片数据
            let uint8Array;
            if (typeof imageData.data === 'string') {
                // 如果是base64字符串，先解码
                const binaryString = atob(imageData.data);
                uint8Array = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    uint8Array[i] = binaryString.charCodeAt(i);
                }
            }
            else {
                // 如果是number数组，直接转换
                uint8Array = new Uint8Array(imageData.data);
            }
            const imageNode = figma.createRectangle();
            imageNode.name = name;
            imageNode.resize(imageData.width, imageData.height);
            const imageHash = figma.createImage(uint8Array).hash;
            const imageFill = {
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
        async applyVivoStyles(moduleFrame) {
            console.log(`VIVO样式调整: ${moduleFrame.name}`);
            // VIVO渠道特定样式调整将在后续版本实现
        }
        /**
         * VIVO渠道内容调整
         */
        async applyVivoContent(moduleFrame) {
            console.log(`VIVO内容调整: ${moduleFrame.name}`);
            // VIVO渠道特定内容调整将在后续版本实现
        }
        /**
         * 小米渠道样式调整
         */
        async applyXiaomiStyles(moduleFrame) {
            console.log(`小米样式调整: ${moduleFrame.name}`);
            // 小米渠道特定样式调整将在后续版本实现
        }
        /**
         * 小米渠道内容调整
         */
        async applyXiaomiContent(moduleFrame) {
            console.log(`小米内容调整: ${moduleFrame.name}`);
            // 小米渠道特定内容调整将在后续版本实现
        }
        /**
         * OPPO渠道内容调整
         */
        async applyOppoContent(moduleFrame) {
            console.log(`OPPO内容调整: ${moduleFrame.name}`);
            // OPPO渠道的内容调整主要在样式调整中完成
        }
        positionChannelPrototype(prototype) {
            prototype.x = this.sourcePrototype.x + this.sourcePrototype.width + 100;
            prototype.y = this.sourcePrototype.y;
        }
        /**
         * 从容器复制按钮图片
         */
        copyButtonImageFromContainer(container) {
            try {
                // 查找容器中的图片节点（通常是第一个RectangleNode）
                const imageNode = container.findOne(node => node.type === 'RECTANGLE');
                if (imageNode) {
                    return imageNode.clone();
                }
                return null;
            }
            catch (error) {
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
    async function generateChannelVersion(channel) {
        try {
            console.log(`开始为${channel}渠道生成H5原型`);
            // 检查是否选中了H5原型容器
            const selectedPrototype = getSelectedPrototype();
            if (!selectedPrototype) {
                throw new Error('请先选中名为"H5原型"的容器');
            }
            // 初始化渠道图片数据
            await initChannelImages();
            // 根据H5原型容器中的文本节点加载字体
            console.log('分析H5原型容器中的文本节点并加载字体...');
            await loadFontsFromPrototype(selectedPrototype);
            console.log('字体加载完成');
            // 创建渠道专用的H5原型生成器
            const channelGenerator = new ChannelPrototypeGenerator(channel, selectedPrototype);
            // 生成渠道版本
            await channelGenerator.generate();
            console.log(`${channel}渠道版本生成完成`);
        }
        catch (error) {
            console.error(`生成${channel}渠道版本失败:`, error);
            throw error;
        }
    }
    /**
     * 从H5原型容器中提取所有文本节点使用的字体并加载
     */
    async function loadFontsFromPrototype(prototypeContainer) {
        try {
            console.log('开始分析H5原型容器中的文本节点...');
            // 收集所有文本节点使用的字体
            const fontsToLoad = new Set();
            // 递归遍历所有节点，收集文本节点的字体信息
            const collectFonts = (node) => {
                if (node.type === 'TEXT') {
                    const textNode = node;
                    // 处理混合字体样式
                    if (typeof textNode.fontName === 'object' && 'family' in textNode.fontName) {
                        // 单一字体
                        const fontKey = `${textNode.fontName.family}|${textNode.fontName.style}`;
                        fontsToLoad.add(fontKey);
                        console.log(`发现文本节点 "${textNode.name}" 使用字体: ${textNode.fontName.family} ${textNode.fontName.style}`);
                    }
                    else if (textNode.fontName === figma.mixed) {
                        // 混合字体 - 需要遍历每个字符的字体
                        const len = textNode.characters.length;
                        for (let i = 0; i < len; i++) {
                            const font = textNode.getRangeFontName(i, i + 1);
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
                }
                catch (error) {
                    console.warn(`✗ 字体加载失败: ${family} ${style}`, error);
                    // 字体加载失败不阻断流程
                }
            });
            await Promise.all(loadPromises);
            console.log('所有字体加载完成');
        }
        catch (error) {
            console.error('从原型容器加载字体时发生错误:', error);
            // 不抛出错误，让后续流程继续执行
        }
    }
    /**
     * 获取当前选中的H5原型容器
     */
    function getSelectedPrototype() {
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
                return selectedNode;
            }
            console.warn(`选中的节点不是H5原型容器，当前选中: ${selectedNode.name} (类型: ${selectedNode.type})`);
            return null;
        }
        catch (error) {
            console.error('获取选中的原型容器失败:', error);
            return null;
        }
    }

    // 渠道美术-H5延展工具 - 核心服务层
    // 这个文件包含所有的服务类，将作为独立库发布到GitHub
    // ==================== 存储适配器 ====================
    // 适配Figma插件沙盒环境，使用clientStorage替代localStorage
    class StorageAdapter {
        // 检查是否在Figma环境中
        static isFigmaEnvironment() {
            return typeof figma !== 'undefined' && !!figma.clientStorage;
        }
        // 异步保存数据
        static async setItem(key, value) {
            if (this.isFigmaEnvironment()) {
                await figma.clientStorage.setAsync(key, value);
            }
            else {
                // 回退到localStorage（用于测试环境）
                localStorage.setItem(key, value);
            }
        }
        // 异步获取数据
        static async getItem(key) {
            if (this.isFigmaEnvironment()) {
                return await figma.clientStorage.getAsync(key) || null;
            }
            else {
                // 回退到localStorage（用于测试环境）
                return localStorage.getItem(key);
            }
        }
        // 异步删除数据
        static async removeItem(key) {
            if (this.isFigmaEnvironment()) {
                await figma.clientStorage.deleteAsync(key);
            }
            else {
                // 回退到localStorage（用于测试环境）
                localStorage.removeItem(key);
            }
        }
        // 获取所有键（仅用于localStorage兼容）
        static async getAllKeys() {
            if (this.isFigmaEnvironment()) {
                // Figma clientStorage没有直接获取所有键的方法
                // 我们需要维护一个键列表
                const keyList = await figma.clientStorage.getAsync('__storage_keys__') || '[]';
                return JSON.parse(keyList);
            }
            else {
                return Object.keys(localStorage);
            }
        }
    }
    // ==================== 配置管理服务 ====================
    class ConfigService {
        // 保存配置到存储
        static async saveConfig(config) {
            try {
                const configData = JSON.stringify(config);
                await StorageAdapter.setItem(this.STORAGE_KEY, configData);
            }
            catch (error) {
                console.error('保存配置失败:', error);
                throw new Error('保存配置失败');
            }
        }
        // 从存储加载配置
        static async loadConfig() {
            try {
                const configData = await StorageAdapter.getItem(this.STORAGE_KEY);
                if (!configData)
                    return null;
                return JSON.parse(configData);
            }
            catch (error) {
                console.error('加载配置失败:', error);
                return null;
            }
        }
        // 清除配置
        static async clearConfig() {
            try {
                await StorageAdapter.removeItem(this.STORAGE_KEY);
            }
            catch (error) {
                console.error('清除配置失败:', error);
            }
        }
        // 验证配置完整性
        static validateConfig(config) {
            var _a, _b, _c, _d, _e, _f;
            const errors = [];
            if (!((_a = config.pageTitle) === null || _a === void 0 ? void 0 : _a.trim())) {
                errors.push('页面标题不能为空');
            }
            if (!((_b = config.gameName) === null || _b === void 0 ? void 0 : _b.trim())) {
                errors.push('游戏名称不能为空');
            }
            if (!config.buttonVersion) {
                errors.push('请选择按钮版本');
            }
            // 根据按钮版本验证相应字段
            switch (config.buttonVersion) {
                case 'icon':
                    if (!((_c = config.iconButtonText) === null || _c === void 0 ? void 0 : _c.trim())) {
                        errors.push('带图标按钮文本不能为空');
                    }
                    break;
                case 'single':
                    if (!((_d = config.singleButtonText) === null || _d === void 0 ? void 0 : _d.trim())) {
                        errors.push('单按钮文本不能为空');
                    }
                    break;
                case 'double':
                    if (!((_e = config.leftButtonText) === null || _e === void 0 ? void 0 : _e.trim())) {
                        errors.push('左侧按钮文本不能为空');
                    }
                    if (!((_f = config.rightButtonText) === null || _f === void 0 ? void 0 : _f.trim())) {
                        errors.push('右侧按钮文本不能为空');
                    }
                    break;
            }
            return {
                isValid: errors.length === 0,
                errors
            };
        }
        // 创建默认配置
        static createDefaultConfig() {
            return {
                pageTitle: '活动页面',
                pageBgColor: '#ffffff',
                pageBgImage: null,
                headerImage: null,
                titleUpload: null,
                gameIcon: null,
                gameName: '游戏名称',
                gameDesc: '游戏描述',
                gameTextColor: '#333333',
                buttonVersion: 'single',
                iconButtonText: '立即下载',
                iconButtonTextColor: '#ffffff',
                iconButtonBg: null,
                singleButtonText: '立即下载',
                singleButtonTextColor: '#ffffff',
                singleButtonBg: null,
                leftButtonText: '预约游戏',
                leftButtonTextColor: '#ffffff',
                leftButtonBg: null,
                rightButtonText: '立即下载',
                rightButtonTextColor: '#ffffff',
                rightButtonBg: null,
                buttonSpacing: 20,
                modules: [],
                rulesTitle: '活动规则',
                rulesBgImage: null,
                rulesContent: '请填写活动规则内容',
                footerLogo: null,
                footerBg: null,
                canvasWidth: 1080,
                canvasHeight: 1920
            };
        }
    }
    ConfigService.STORAGE_KEY = 'h5-tools-config';
    // ==================== 主题管理服务 ====================
    class ThemeService {
        // 保存主题设置
        static async saveTheme(theme) {
            if (!this.isValidTheme(theme)) {
                throw new Error('无效的主题类型');
            }
            try {
                await StorageAdapter.setItem(this.THEME_KEY, theme);
            }
            catch (error) {
                console.error('保存主题失败:', error);
            }
        }
        // 加载主题设置
        static async loadTheme() {
            try {
                const theme = await StorageAdapter.getItem(this.THEME_KEY);
                return this.isValidTheme(theme) ? theme : 'auto';
            }
            catch (error) {
                console.error('加载主题失败:', error);
                return 'auto';
            }
        }
        // 检测系统主题
        static detectSystemTheme() {
            if (typeof window !== 'undefined' && window.matchMedia) {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return 'light';
        }
        // 获取当前应用的主题
        static async getCurrentTheme() {
            const savedTheme = await this.loadTheme();
            if (savedTheme === 'auto') {
                return this.detectSystemTheme();
            }
            return savedTheme;
        }
        // 验证主题类型
        static isValidTheme(theme) {
            return theme !== null && this.THEMES.indexOf(theme) !== -1;
        }
    }
    ThemeService.THEME_KEY = 'h5-tools-theme';
    ThemeService.THEMES = ['light', 'dark', 'auto'];
    // ==================== 渠道图片管理服务 ====================
    class ChannelImageService {
        // 保存渠道图片
        static async saveChannelImage(channel, imageType, imageData) {
            try {
                const allImages = await this.loadAllChannelImages();
                if (!allImages[channel]) {
                    allImages[channel] = {};
                }
                allImages[channel][imageType] = imageData;
                // 检查存储大小
                const dataSize = this.calculateStorageSize(allImages);
                if (dataSize > this.MAX_STORAGE_SIZE) {
                    throw new Error('存储空间不足，请清理旧数据');
                }
                await StorageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(allImages));
            }
            catch (error) {
                console.error('保存渠道图片失败:', error);
                throw error;
            }
        }
        // 加载所有渠道图片
        static async loadAllChannelImages() {
            try {
                const data = await StorageAdapter.getItem(this.STORAGE_KEY);
                if (!data)
                    return {};
                return JSON.parse(data);
            }
            catch (error) {
                console.error('加载渠道图片失败:', error);
                return {};
            }
        }
        // 加载指定渠道的图片
        static async loadChannelImages(channel) {
            const allImages = await this.loadAllChannelImages();
            return allImages[channel] || {};
        }
        // 删除指定渠道的指定图片
        static async deleteChannelImage(channel, imageType) {
            try {
                const allImages = await this.loadAllChannelImages();
                if (allImages[channel] && allImages[channel][imageType]) {
                    delete allImages[channel][imageType];
                    // 如果渠道下没有图片了，删除整个渠道
                    if (Object.keys(allImages[channel]).length === 0) {
                        delete allImages[channel];
                    }
                    await StorageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(allImages));
                }
            }
            catch (error) {
                console.error('删除渠道图片失败:', error);
                throw error;
            }
        }
        // 清空所有渠道图片
        static async clearAllChannelImages() {
            try {
                await StorageAdapter.removeItem(this.STORAGE_KEY);
            }
            catch (error) {
                console.error('清空渠道图片失败:', error);
            }
        }
        // 清理过期的渠道图片
        static async clearExpiredChannelImages() {
            try {
                const allImages = await this.loadAllChannelImages();
                const now = Date.now();
                const expiredTime = 30 * 24 * 60 * 60 * 1000; // 30天
                let hasChanges = false;
                for (const channel in allImages) {
                    for (const imageType in allImages[channel]) {
                        const imageData = allImages[channel][imageType];
                        if (imageData && typeof imageData === 'object' && 'timestamp' in imageData) {
                            if (now - imageData.timestamp > expiredTime) {
                                delete allImages[channel][imageType];
                                hasChanges = true;
                            }
                        }
                    }
                    // 清理空的渠道
                    if (Object.keys(allImages[channel]).length === 0) {
                        delete allImages[channel];
                        hasChanges = true;
                    }
                }
                if (hasChanges) {
                    await StorageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(allImages));
                }
            }
            catch (error) {
                console.error('清理过期渠道图片失败:', error);
            }
        }
        // 计算存储大小
        static calculateStorageSize(data) {
            return JSON.stringify(data).length * 2; // 估算字节大小
        }
        // 获取存储使用情况
        static async getStorageUsage() {
            try {
                const allImages = await this.loadAllChannelImages();
                const used = this.calculateStorageSize(allImages);
                const max = this.MAX_STORAGE_SIZE;
                const percentage = (used / max) * 100;
                return { used, max, percentage };
            }
            catch (error) {
                console.error('获取存储使用情况失败:', error);
                return { used: 0, max: this.MAX_STORAGE_SIZE, percentage: 0 };
            }
        }
    }
    ChannelImageService.STORAGE_KEY = 'h5-tools-channel-images';
    ChannelImageService.MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB

    // H5Tools 插件主程序
    // 使用模块化核心库
    // ==================== 插件消息处理器 ====================
    class MessageHandler {
        async handleMessage(msg) {
            try {
                switch (msg.type) {
                    case 'create-prototype':
                    case 'generate':
                        await this.handleCreatePrototype(msg.config);
                        break;
                    case 'save-config':
                        await this.handleSaveConfig(msg.config);
                        break;
                    case 'load-config':
                        await this.handleLoadConfig();
                        break;
                    case 'get-theme':
                        await this.handleGetTheme();
                        break;
                    case 'save-theme':
                        await this.handleSaveTheme(msg.theme);
                        break;
                    case 'channel-image-upload':
                        await this.handleChannelImageUpload(msg);
                        break;
                    case 'channel-generate':
                        await this.handleGenerateChannelVersion(msg);
                        break;
                    case 'storage-set':
                        await this.handleStorageSet(msg.key, msg.value);
                        break;
                    case 'storage-delete':
                        await this.handleStorageDelete(msg.key);
                        break;
                    case 'ui-loaded':
                        console.log('UI界面已加载');
                        break;
                    case 'ui-ready':
                        console.log('UI界面已就绪');
                        break;
                    default:
                        console.warn('未知消息类型:', msg.type);
                }
            }
            catch (error) {
                console.error('处理消息失败:', error);
                figma.ui.postMessage({
                    type: 'error',
                    message: `操作失败: ${error}`
                });
            }
        }
        async handleCreatePrototype(config) {
            try {
                console.log('开始创建H5原型...');
                await createH5Prototype(config);
                figma.ui.postMessage({
                    type: 'prototype-created',
                    message: 'H5原型创建成功！'
                });
                console.log('H5原型创建完成');
            }
            catch (error) {
                console.error('创建H5原型失败:', error);
                figma.ui.postMessage({
                    type: 'error',
                    message: `创建H5原型失败: ${error}`
                });
                throw error;
            }
        }
        async handleSaveConfig(config) {
            try {
                await ConfigService.saveConfig(config);
                figma.ui.postMessage({
                    type: 'config-saved',
                    message: '配置保存成功'
                });
            }
            catch (error) {
                console.error('保存配置失败:', error);
                figma.ui.postMessage({
                    type: 'error',
                    message: `保存配置失败: ${error}`
                });
                throw error;
            }
        }
        async handleLoadConfig() {
            try {
                const config = await ConfigService.loadConfig();
                figma.ui.postMessage({
                    type: 'config-loaded',
                    config: config
                });
            }
            catch (error) {
                console.error('加载配置失败:', error);
                figma.ui.postMessage({
                    type: 'error',
                    message: `加载配置失败: ${error}`
                });
                throw error;
            }
        }
        async handleGetTheme() {
            try {
                const theme = await ThemeService.getCurrentTheme();
                figma.ui.postMessage({
                    type: 'theme-loaded',
                    theme: theme
                });
            }
            catch (error) {
                console.error('获取主题失败:', error);
                figma.ui.postMessage({
                    type: 'error',
                    message: `获取主题失败: ${error}`
                });
                throw error;
            }
        }
        async handleSaveTheme(theme) {
            try {
                await ThemeService.saveTheme(theme);
                figma.ui.postMessage({
                    type: 'theme-saved',
                    message: '主题保存成功'
                });
            }
            catch (error) {
                console.error('保存主题失败:', error);
                figma.ui.postMessage({
                    type: 'error',
                    message: `保存主题失败: ${error}`
                });
                throw error;
            }
        }
        async handleChannelImageUpload(msg) {
            try {
                console.log('渠道图片上传:', {
                    channel: msg.channel,
                    imageType: msg.imageType,
                    imageData: msg.imageData
                });
                figma.ui.postMessage({
                    type: 'channel-image-uploaded',
                    message: '渠道图片上传成功'
                });
            }
            catch (error) {
                console.error('渠道图片上传失败:', error);
                figma.ui.postMessage({
                    type: 'error',
                    message: `渠道图片上传失败: ${error}`
                });
                throw error;
            }
        }
        async handleGenerateChannelVersion(msg) {
            try {
                console.log('开始生成渠道版本:', msg.channel);
                // 调用渠道生成器
                await generateChannelVersion(msg.channel);
                figma.ui.postMessage({
                    type: 'channel-version-generated',
                    message: `${msg.channel.toUpperCase()}渠道版本生成成功`
                });
                console.log(`${msg.channel}渠道版本生成完成`);
            }
            catch (error) {
                console.error('生成渠道版本失败:', error);
                figma.ui.postMessage({
                    type: 'error',
                    message: `生成${msg.channel.toUpperCase()}渠道版本失败: ${error}`
                });
                throw error;
            }
        }
        async handleStorageSet(key, value) {
            try {
                await figma.clientStorage.setAsync(key, value);
                console.log(`✅ Figma存储设置成功: ${key}`);
            }
            catch (error) {
                console.error(`Figma存储设置失败 ${key}:`, error);
            }
        }
        async handleStorageDelete(key) {
            try {
                await figma.clientStorage.deleteAsync(key);
                console.log(`✅ Figma存储删除成功: ${key}`);
            }
            catch (error) {
                console.error(`Figma存储删除失败 ${key}:`, error);
            }
        }
    }
    // ==================== 插件入口 ====================
    const messageHandler = new MessageHandler();
    // 显示UI界面
    figma.showUI(__html__, { width: 400, height: 700 });
    // 监听来自UI的消息
    figma.ui.onmessage = async (msg) => {
        await messageHandler.handleMessage(msg);
    };
    console.log('H5Tools插件已启动');

})();
//# sourceMappingURL=code-standalone.js.map
