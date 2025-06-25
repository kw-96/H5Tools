import { H5Config } from '../types';
/**
 * H5原型构建器
 * 负责根据配置创建完整的H5原型
 */
export declare class H5PrototypeBuilder {
    private config;
    private outerFrame;
    private h5Frame;
    /**
     * 构造函数
     * @param config H5配置对象
     */
    constructor(config: H5Config);
    /**
     * 构建H5原型
     * 这个方法执行整个H5原型的创建过程
     * @returns Promise<FrameNode> 返回创建完成的外层画板
     */
    build(): Promise<FrameNode>;
    /**
     * 检查是否有任何模块内容需要创建
     * @returns boolean 如果有任何模块内容返回true，否则返回false
     */
    private hasAnyModuleContent;
    private createBaseFrames;
    /**
     * 设置背景
     * 根据配置设置页面背景，可以是图片或颜色
     */
    private setupBackground;
    /**
     * 添加模块
     * 创建所有模块并将它们添加到H5画板中
     */
    private addModules;
    /**
     * 创建所有模块
     * 异步方法，用于创建所有需要的模块
     * @returns Promise，解析为一个包含所有创建的模块（FrameNode或null）的数组
     */
    private createAllModules;
    private createHeaderModuleIfNeeded;
    private createGameInfoModuleIfNeeded;
    private createCustomModules;
    private createRulesModuleIfNeeded;
    /**
     * 创建底部模块（如果需要）
     * 如果配置中包含底部logo或背景，则创建底部模块
     * @returns Promise<FrameNode | null> 返回创建的底部模块或null
     */
    private createFooterModuleIfNeeded;
    private finalizeLayout;
}
/**
 * 创建H5原型的便捷函数
 * @param config H5配置对象
 * @returns Promise<FrameNode> 返回创建完成的H5原型
 */
export declare function createH5Prototype(config: H5Config): Promise<FrameNode>;
//# sourceMappingURL=h5-prototype-builder.d.ts.map