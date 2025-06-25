"use strict";
// H5原型构建器
// 负责构建完整的H5原型
Object.defineProperty(exports, "__esModule", { value: true });
exports.H5PrototypeBuilder = void 0;
exports.createH5Prototype = createH5Prototype;
/// <reference types="@figma/plugin-typings" />
const types_1 = require("../types");
const utils_1 = require("../utils");
const figma_utils_1 = require("./figma-utils");
const module_builders_1 = require("./module-builders");
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
            await figma_utils_1.FontManager.loadAll();
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
        this.outerFrame = figma_utils_1.NodeUtils.createFrame('H5原型', types_1.CONSTANTS.H5_WIDTH, 100);
        this.outerFrame.layoutMode = "NONE"; // 不使用自动布局
        this.outerFrame.clipsContent = true; // 设置内容裁剪
        // 🚨 重要：初始化时设置为透明填充，避免默认白色背景
        this.outerFrame.fills = [];
        // 2. 只有当有模块内容时才创建自适应模块容器
        if (this.hasAnyModuleContent()) {
            this.h5Frame = figma_utils_1.NodeUtils.createFrame('自适应模块', types_1.CONSTANTS.H5_WIDTH, 100);
            this.h5Frame.fills = [];
            // 设置自适应模块容器的自动布局
            figma_utils_1.NodeUtils.setupAutoLayout(this.h5Frame, 'VERTICAL', 0, 0);
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
            const rgbColor = figma_utils_1.ColorUtils.hexToRgb(this.config.pageBgColor || '#FFFFFF');
            console.log('   - RGB转换结果:', rgbColor);
            const colorFill = figma_utils_1.ColorUtils.createSolidFill(rgbColor);
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
            const bgImageData = utils_1.Utils.extractUint8Array(this.config.pageBgImage);
            if (bgImageData) {
                console.log('🖼️  开始添加背景图片');
                // 直接将bgImageData图片节点插入H5原型容器中
                const bgImageNode = await figma_utils_1.ImageNodeBuilder.insertImage(this.config.pageBgImage, "页面背景图片");
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
                    figma_utils_1.NodeUtils.safeAppendChild(this.outerFrame, bgImageNode, '页面背景图片添加');
                    console.log('✅ 背景图片添加完成');
                }
            }
        }
        // 设置完背景之后，如果存在自适应模块容器，将其添加为H5原型容器的子元素
        if (this.h5Frame) {
            figma_utils_1.NodeUtils.safeAppendChild(this.outerFrame, this.h5Frame, 'H5自适应模块容器添加');
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
        figma_utils_1.NodeUtils.safeBatchAppendChildren(this.h5Frame, modules, 'H5模块批量添加');
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
            const module = await (0, module_builders_1.createHeaderModule)(this.config.headerImage, this.config.titleUpload);
            if (module) {
                return module;
            }
        }
        return null;
    }
    async createGameInfoModuleIfNeeded() {
        if (this.config.gameName || this.config.gameDesc || this.config.gameIcon) {
            const module = await (0, module_builders_1.createGameInfoModule)(this.config);
            return module;
        }
        return null;
    }
    createCustomModules() {
        return this.config.modules?.map(async (module) => {
            const moduleFrame = await (0, module_builders_1.createCustomModule)(module);
            return moduleFrame;
        }) || [];
    }
    async createRulesModuleIfNeeded() {
        // 检查是否有任何活动规则相关内容
        const hasRulesTitle = this.config.rulesTitle && this.config.rulesTitle.trim() !== '';
        const hasRulesBgImage = this.config.rulesBgImage !== null && this.config.rulesBgImage !== undefined;
        const hasRulesContent = this.config.rulesContent && this.config.rulesContent.trim() !== '';
        // 只有当标题文案、标题背景图或活动规则内容任一存在时才创建模块
        if (hasRulesTitle || hasRulesBgImage || hasRulesContent) {
            const module = await (0, module_builders_1.createRulesModule)(this.config);
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
            const module = await (0, module_builders_1.createFooterModule)(this.config);
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
            this.outerFrame.resize(types_1.CONSTANTS.H5_WIDTH, this.h5Frame.height);
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
            this.outerFrame.resize(types_1.CONSTANTS.H5_WIDTH, finalHeight);
            console.log(`没有模块内容，H5原型设置为最小高度: ${finalHeight}px`);
        }
        // 添加到当前页面并居中显示
        figma_utils_1.NodeUtils.safeAppendChild(figma.currentPage, this.outerFrame, 'H5原型添加到当前页面');
        figma.viewport.scrollAndZoomIntoView([this.outerFrame]);
    }
}
exports.H5PrototypeBuilder = H5PrototypeBuilder;
/**
 * 创建H5原型的便捷函数
 * @param config H5配置对象
 * @returns Promise<FrameNode> 返回创建完成的H5原型
 */
async function createH5Prototype(config) {
    const builder = new H5PrototypeBuilder(config);
    return builder.build();
}
//# sourceMappingURL=h5-prototype-builder.js.map