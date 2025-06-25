"use strict";
// 渠道美术-H5延展工具 - 核心库入口文件
// 这个文件作为独立库的主入口，将发布到GitHub
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESCRIPTION = exports.LIBRARY_NAME = exports.VERSION = exports.AdvancedFeatures = exports.generateChannelVersion = exports.FeatherMaskUtils = exports.createFooterModule = exports.createRulesModule = exports.createGameInfoModule = exports.createHeaderModule = exports.createH5Prototype = void 0;
// ==================== 类型定义导出 ====================
__exportStar(require("./types"), exports);
// ==================== 工具函数导出 ====================
__exportStar(require("./utils"), exports);
// ==================== 服务层导出 ====================
__exportStar(require("./services"), exports);
// ==================== 构建器导出 ====================
__exportStar(require("./builders/figma-utils"), exports);
__exportStar(require("./builders/h5-prototype-builder"), exports);
__exportStar(require("./builders/module-builders"), exports);
__exportStar(require("./builders/feather-mask-utils"), exports);
__exportStar(require("./builders/channel-generator"), exports);
__exportStar(require("./builders/advanced-features"), exports);
// ==================== 便捷函数导出 ====================
var h5_prototype_builder_1 = require("./builders/h5-prototype-builder");
Object.defineProperty(exports, "createH5Prototype", { enumerable: true, get: function () { return h5_prototype_builder_1.createH5Prototype; } });
var module_builders_1 = require("./builders/module-builders");
Object.defineProperty(exports, "createHeaderModule", { enumerable: true, get: function () { return module_builders_1.createHeaderModule; } });
Object.defineProperty(exports, "createGameInfoModule", { enumerable: true, get: function () { return module_builders_1.createGameInfoModule; } });
Object.defineProperty(exports, "createRulesModule", { enumerable: true, get: function () { return module_builders_1.createRulesModule; } });
Object.defineProperty(exports, "createFooterModule", { enumerable: true, get: function () { return module_builders_1.createFooterModule; } });
var feather_mask_utils_1 = require("./builders/feather-mask-utils");
Object.defineProperty(exports, "FeatherMaskUtils", { enumerable: true, get: function () { return feather_mask_utils_1.FeatherMaskUtils; } });
var channel_generator_1 = require("./builders/channel-generator");
Object.defineProperty(exports, "generateChannelVersion", { enumerable: true, get: function () { return channel_generator_1.generateChannelVersion; } });
var advanced_features_1 = require("./builders/advanced-features");
Object.defineProperty(exports, "AdvancedFeatures", { enumerable: true, get: function () { return advanced_features_1.AdvancedFeatures; } });
// ==================== 版本信息 ====================
exports.VERSION = '2.0.0';
exports.LIBRARY_NAME = 'H5Tools Core';
exports.DESCRIPTION = '渠道美术-H5延展工具核心库';
// ==================== 默认导出 ====================
exports.default = {
    VERSION: exports.VERSION,
    LIBRARY_NAME: exports.LIBRARY_NAME,
    DESCRIPTION: exports.DESCRIPTION
};
//# sourceMappingURL=index.js.map