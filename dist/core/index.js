// 渠道美术-H5延展工具 - 核心库入口文件
// 这个文件作为独立库的主入口，将发布到GitHub
// ==================== 类型定义导出 ====================
export * from './types';
// ==================== 工具函数导出 ====================
export * from './utils';
// ==================== 服务层导出 ====================
export * from './services';
// ==================== 构建器导出 ====================
export * from './builders/figma-utils';
export * from './builders/h5-prototype-builder';
export * from './builders/module-builders';
export * from './builders/feather-mask-utils';
export * from './builders/channel-generator';
export * from './builders/advanced-features';
// ==================== 便捷函数导出 ====================
export { createH5Prototype } from './builders/h5-prototype-builder';
export { createHeaderModule, createGameInfoModule, createRulesModule, createFooterModule } from './builders/module-builders';
export { FeatherMaskUtils } from './builders/feather-mask-utils';
export { generateChannelVersion } from './builders/channel-generator';
export { AdvancedFeatures } from './builders/advanced-features';
// ==================== 版本信息 ====================
export const VERSION = '2.0.0';
export const LIBRARY_NAME = 'H5Tools Core';
export const DESCRIPTION = '渠道美术-H5延展工具核心库';
// ==================== 默认导出 ====================
export default {
    VERSION,
    LIBRARY_NAME,
    DESCRIPTION
};
//# sourceMappingURL=index.js.map