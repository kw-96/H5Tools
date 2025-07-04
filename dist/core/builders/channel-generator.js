/// <reference types="@figma/plugin-typings" />
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { NodeUtils, ColorUtils, createButtonContainer } from './figma-utils';
// ==================== 渠道原型生成器 ====================
/**
 * 渠道原型生成器类
 * 负责根据不同渠道的规格要求生成对应的H5原型版本
 */
class ChannelPrototypeGenerator {
    constructor(channel, sourcePrototype, images) {
        this.channel = channel.toLowerCase();
        this.sourcePrototype = sourcePrototype;
        this.images = images || {};
    }
    /**
     * 生成渠道版本的主方法
     */
    generate() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`开始生成${this.channel}渠道版本`);
                // 1. 复制原始原型
                const channelPrototype = yield this.clonePrototype();
                // 2. 应用渠道特定的调整
                yield this.applyChannelAdjustments(channelPrototype);
                console.log(`${this.channel}渠道版本创建完成`);
            }
            catch (error) {
                console.error(`生成${this.channel}渠道版本失败:`, error);
                throw error;
            }
        });
    }
    /**
     * 复制原始原型
     */
    clonePrototype() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1. 复制H5原型容器
                const clonedPrototype = this.sourcePrototype.clone();
                // 2. 修改命名为对应渠道
                clonedPrototype.name = `${this.channel.toUpperCase()}-H5`;
                // 3. 设置位置：放置在原H5原型容器的右侧（横向间隔100px）
                positionChannelPrototype(clonedPrototype, this.sourcePrototype);
                // 4. 添加到当前页面
                NodeUtils.safeAppendChild(figma.currentPage, clonedPrototype, `${this.channel}渠道原型添加`);
                console.log(`${this.channel}渠道原型复制完成，位置: (${clonedPrototype.x}, ${clonedPrototype.y})`);
                return clonedPrototype;
            }
            catch (error) {
                console.error('复制原型失败:', error);
                throw new Error(`复制${this.channel}原型失败: ${error instanceof Error ? error.message : '未知错误'}`);
            }
        });
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
    applyChannelAdjustments(prototype) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(`应用${this.channel}渠道的特定调整`);
                // 1. 查找自适应模块容器
                const adaptiveModule = this.findAdaptiveModule(prototype);
                if (!adaptiveModule) {
                    throw new Error('未找到自适应模块容器');
                }
                // 2. 对自适应模块容器内的内容进行调整
                yield this.adjustAdaptiveModuleContent(adaptiveModule);
                // 3. 调整渠道H5容器的尺寸与自适应模块保持一致
                this.resizeChannelPrototype(prototype, adaptiveModule);
            }
            catch (error) {
                console.error(`应用${this.channel}渠道调整失败:`, error);
                throw error;
            }
        });
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
    adjustAdaptiveModuleContent(adaptiveModule) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const child of adaptiveModule.children) {
                if (child.type === 'FRAME') {
                    const moduleFrame = child;
                    yield this.adjustModuleStyles(moduleFrame); // 调整模块
                }
            }
        });
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
    adjustModuleStyles(moduleFrame) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 根据渠道配置调整模块样式
                switch (this.channel) {
                    case 'oppo':
                        yield this.applyOppoStyles(moduleFrame);
                        break;
                    case 'vivo':
                        yield this.applyVivoStyles(moduleFrame);
                        break;
                    case 'huawei':
                        yield this.applyHuaweiStyles(moduleFrame);
                        break;
                    case 'xiaomi':
                        yield this.applyXiaomiStyles(moduleFrame);
                        break;
                    default:
                        console.log(`${this.channel}渠道暂无特定样式调整`);
                }
            }
            catch (error) {
                console.error(`调整模块样式失败:`, error);
            }
        });
    }
    /**
     * OPPO渠道调整
     */
    applyOppoStyles(moduleFrame) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (moduleFrame.name.trim()) {
                    case '头图':
                        yield this.adjustOppoHeaderModule(moduleFrame);
                        break;
                    case '九宫格抽奖':
                        console.log('匹配到九宫格抽奖模块，开始调整');
                        yield this.adjustOppoNineGridModule(moduleFrame);
                        break;
                    case '尾版':
                        yield this.adjustOppoFooterModule(moduleFrame);
                        break;
                    default:
                        console.log(`模块 "${moduleFrame.name}" 无需OPPO特定样式调整`);
                        console.log('可匹配的模块名称: 头图, 九宫格抽奖, 尾版');
                }
            }
            catch (error) {
                console.error(`OPPO样式调整失败:`, error);
            }
        });
    }
    /**
     * 调整OPPO头图模块
     */
    adjustOppoHeaderModule(headerFrame) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('开始调整OPPO头图模块');
                // 1. 调整头图容器高度为1300px
                headerFrame.resize(headerFrame.width, 1300);
                // 2. 查找并调整蒙版矩形节点
                const maskRect = findMaskRectangle(headerFrame);
                if (maskRect) {
                    // 高度-100px
                    const newHeight = maskRect.height - 100;
                    maskRect.resize(maskRect.width, newHeight);
                    // 下移150px
                    maskRect.y = maskRect.y + 150;
                }
                // 3. 查找并调整头图图片节点
                const headerImageNode = findHeaderImageNode(headerFrame);
                if (headerImageNode) {
                    // 头图图片节点下移100px
                    headerImageNode.y = headerImageNode.y + 100;
                }
                console.log('OPPO头图模块调整完成');
            }
            catch (error) {
                console.error('调整OPPO头图模块失败:', error);
            }
        });
    }
    /**
     * 调整OPPO九宫格模块
     */
    adjustOppoNineGridModule(nineGridFrame) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('开始调整OPPO九宫格模块');
                const eggBreakingData = this.images.eggBreaking;
                if (!eggBreakingData) {
                    console.log('未上传砸蛋样式图片，跳过九宫格模块调整');
                    return;
                }
                // 查找九宫格主体容器
                const mainContainer = findNineGridMainContainer(nineGridFrame);
                if (!mainContainer) {
                    console.warn('未找到九宫格主体容器');
                    return;
                }
                // 清空九宫格主体容器的所有内容
                clearContainerContent(mainContainer);
                // 插入砸蛋样式图片
                yield this.insertEggBreakingImage(mainContainer, this.channel);
                // 创建立即抽奖容器
                yield createButtonContainer(mainContainer, nineGridFrame, {
                    name: '立即抽奖',
                    text: '立即抽奖',
                    x: 284,
                    y: 648,
                    width: 512,
                    height: 133,
                    textFontSize: 58
                });
                // 创建我的奖品容器
                yield createButtonContainer(mainContainer, nineGridFrame, {
                    name: '我的奖品',
                    text: '我的奖品',
                    x: 102,
                    y: 851,
                    width: 398,
                    height: 112,
                    textFontSize: 50
                });
                // 创建活动规则容器
                yield createButtonContainer(mainContainer, nineGridFrame, {
                    name: '活动规则',
                    text: '活动规则',
                    x: 580,
                    y: 851,
                    width: 398,
                    height: 112,
                    textFontSize: 50
                });
                console.log('OPPO九宫格模块调整完成');
            }
            catch (error) {
                console.error('调整OPPO九宫格模块失败:', error);
            }
        });
    }
    /**
     * 调整OPPO尾版模块
     */
    adjustOppoFooterModule(footerFrame) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('开始调整OPPO尾版模块');
                // 插入尾版样式图片（仅有图片时才插入并调整，否则跳过）
                const footerStyleData = this.images.footerStyle;
                if (footerStyleData) {
                    try {
                        // 调整尾版容器高度为807px
                        footerFrame.resize(footerFrame.width, 807);
                        // 清除尾版LOGO
                        clearFooterLogo(footerFrame);
                        // 使用上传的图片
                        const imageNode = yield createImageFromData(footerStyleData, '尾版样式');
                        imageNode.resize(1080, 289);
                        imageNode.x = (footerFrame.width - 1080) / 2; // 左右居中
                        imageNode.y = 122; // 距离上122px
                        NodeUtils.safeAppendChild(footerFrame, imageNode, '尾版样式图片添加');
                        console.log('尾版样式图片已插入:', footerStyleData.name);
                    }
                    catch (error) {
                        console.error('插入尾版样式图片失败:', error);
                    }
                    console.log('OPPO尾版模块调整完成');
                    return;
                }
                // 没有上传图片则跳过调整
                return;
            }
            catch (error) {
                console.error('调整OPPO尾版模块失败:', error);
            }
        });
    }
    /**
     * 插入砸蛋样式图片
     */
    insertEggBreakingImage(container, channel) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const eggBreakingData = this.images.eggBreaking;
                if (eggBreakingData) {
                    // 使用上传的图片
                    const imageNode = yield createImageFromData(eggBreakingData, '砸蛋样式');
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
        });
    }
    /**
     * VIVO渠道样式调整
     */
    applyVivoStyles(moduleFrame) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                switch (moduleFrame.name.trim()) {
                    case '头图':
                        yield this.adjustVivoHeaderModule(moduleFrame);
                        break;
                    // case '九宫格抽奖':
                    //   console.log('匹配到九宫格抽奖模块，开始调整');
                    //   await this.adjustVivoNineGridModule(moduleFrame);
                    //   break;
                    case '尾版':
                        yield this.adjustVivoFooterModule(moduleFrame);
                        break;
                    default:
                        console.log(`模块 "${moduleFrame.name}" 无需VIVO特定样式调整`);
                        console.log('可匹配的模块名称: 头图, 九宫格抽奖, 尾版');
                }
            }
            catch (error) {
                console.error(`VIVO样式调整失败:`, error);
            }
        });
    }
    /**
     * 调整VIVO头图模块
     */
    adjustVivoHeaderModule(headerFrame) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('开始调整VIVO头图模块');
                // 1. 调整头图容器高度为1300px
                headerFrame.resize(headerFrame.width, 1300);
                // 2. 查找并调整蒙版矩形节点
                const maskRect = findMaskRectangle(headerFrame);
                if (maskRect) {
                    // 高度-100px
                    const newHeight = maskRect.height - 100;
                    maskRect.resize(maskRect.width, newHeight);
                    // 下移150px
                    maskRect.y = maskRect.y + 150;
                }
                // 3. 查找并调整头图图片节点
                const headerImageNode = findHeaderImageNode(headerFrame);
                if (headerImageNode) {
                    // 头图图片节点下移100px
                    headerImageNode.y = headerImageNode.y + 100;
                }
                console.log('VIVO头图模块调整完成');
            }
            catch (error) {
                console.error('调整VIVO头图模块失败:', error);
            }
        });
    }
    /**
     * 调整VIVO尾版模块
     */
    adjustVivoFooterModule(footerFrame) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('开始调整VIVO尾版模块');
                // 插入尾版样式图片（仅有图片时才插入并调整，否则跳过）
                const footerStyleData = this.images.footerStyle;
                if (footerStyleData) {
                    try {
                        // 调整尾版容器高度为550px
                        footerFrame.resize(footerFrame.width, 550);
                        // 清除尾版LOGO
                        clearFooterLogo(footerFrame);
                        // 使用上传的图片
                        const imageNode = yield createImageFromData(footerStyleData, '尾版样式');
                        imageNode.resize(1080, 332);
                        imageNode.x = (footerFrame.width - 1080) / 2; // 左右居中
                        imageNode.y = 0; // 距离上0px
                        NodeUtils.safeAppendChild(footerFrame, imageNode, '尾版样式图片添加');
                        console.log('尾版样式图片已插入:', footerStyleData.name);
                    }
                    catch (error) {
                        console.error('插入尾版样式图片失败:', error);
                    }
                    console.log('VIVO尾版模块调整完成');
                    return;
                }
                // 没有上传图片则跳过调整
                return;
            }
            catch (error) {
                console.error('调整VIVO尾版模块失败:', error);
            }
        });
    }
    /**
     * 华为渠道样式调整
     */
    applyHuaweiStyles(moduleFrame) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`华为样式调整: ${moduleFrame.name}`);
            // 华为渠道特定样式调整将在后续版本实现
        });
    }
    /**
     * 小米渠道样式调整
     */
    applyXiaomiStyles(moduleFrame) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`小米样式调整: ${moduleFrame.name}`);
            // 小米渠道特定样式调整将在后续版本实现
        });
    }
}
// ==================== 工具函数 ====================
/**
 * 生成渠道特定版本的H5原型
 * @param channel 渠道名称 (oppo, vivo, xiaomi等)
 */
export function generateChannelVersion(channel, images) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`开始为${channel}渠道生成H5原型`);
            // 检查是否选中了H5原型容器
            const selectedPrototype = getSelectedPrototype();
            if (!selectedPrototype) {
                throw new Error('请先选中名为"H5原型"的容器');
            }
            // 根据H5原型容器中的文本节点加载字体
            console.log('分析H5原型容器中的文本节点并加载字体...');
            yield loadFontsFromPrototype(selectedPrototype);
            console.log('字体加载完成');
            // 创建渠道专用的H5原型生成器，传递图片数据
            const channelGenerator = new ChannelPrototypeGenerator(channel, selectedPrototype, images || {});
            // 生成渠道版本
            yield channelGenerator.generate();
            console.log(`${channel}渠道版本生成完成`);
        }
        catch (error) {
            console.error(`生成${channel}渠道版本失败:`, error);
            throw error;
        }
    });
}
/**
 * 从H5原型容器中提取所有文本节点使用的字体并加载
 */
function loadFontsFromPrototype(prototypeContainer) {
    return __awaiter(this, void 0, void 0, function* () {
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
            const loadPromises = Array.from(fontsToLoad).map((fontKey) => __awaiter(this, void 0, void 0, function* () {
                const [family, style] = fontKey.split('|');
                try {
                    yield figma.loadFontAsync({ family, style });
                    console.log(`✓ 字体加载成功: ${family} ${style}`);
                }
                catch (error) {
                    console.warn(`✗ 字体加载失败: ${family} ${style}`, error);
                    // 字体加载失败不阻断流程
                }
            }));
            yield Promise.all(loadPromises);
            console.log('所有字体加载完成');
        }
        catch (error) {
            console.error('从原型容器加载字体时发生错误:', error);
            // 不抛出错误，让后续流程继续执行
        }
    });
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
/**
 * 递归查找蒙版矩形节点
 */
function findMaskRectangle(container) {
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
 * 递归查找头图图片节点
 */
function findHeaderImageNode(container) {
    const findHeaderImage = (node) => {
        if (node.name === '头图图片') {
            return node;
        }
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
 * 清除尾版LOGO
 */
function clearFooterLogo(footerFrame) {
    try {
        const logoNode = footerFrame.findOne(node => node.name.toLowerCase().includes('logo'));
        if (logoNode) {
            NodeUtils.safeRemoveNode(logoNode, '清除尾版LOGO');
            // 可选：console.log('尾版LOGO已清除');
        }
    }
    catch (error) {
        console.error('清除尾版LOGO失败:', error);
    }
}
/**
 * 查找九宫格主体容器
 */
function findNineGridMainContainer(nineGridFrame) {
    const mainContainer = nineGridFrame.findOne(node => node.type === 'FRAME' && node.name === '九宫格主体');
    return mainContainer || null;
}
/**
 * 清除容器内容
 */
function clearContainerContent(container) {
    try {
        const children = [...container.children];
        children.forEach(child => {
            NodeUtils.safeRemoveNode(child, `清除${container.name}子节点`);
        });
        // 可选：console.log(`已清除${container.name}的所有内容`);
    }
    catch (error) {
        console.error(`清除容器内容失败:`, error);
    }
}
/**
 * 根据图片数据创建RectangleNode
 */
function createImageFromData(imageData, name) {
    return __awaiter(this, void 0, void 0, function* () {
        let uint8Array;
        if (typeof imageData.data === 'string') {
            const binaryString = atob(imageData.data);
            uint8Array = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i);
            }
        }
        else {
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
    });
}
/**
 * 设置渠道原型的位置
 *
 * 作用：将新生成的渠道原型 Frame 节点，放置在原始 H5 原型容器的右侧（横向间隔100px），
 * 并与原型保持同一纵坐标，避免重叠，方便用户在画布上直观区分不同渠道的原型。
 *
 * @param prototype 新生成的渠道原型 Frame 节点
 * @param sourcePrototype 原始 H5 原型容器 Frame 节点
 */
function positionChannelPrototype(prototype, sourcePrototype) {
    prototype.x = sourcePrototype.x + sourcePrototype.width + 100;
    prototype.y = sourcePrototype.y;
}
//# sourceMappingURL=channel-generator.js.map