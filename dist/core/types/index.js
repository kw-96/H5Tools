// 渠道美术-H5延展工具 - 核心类型定义
// 这个文件包含所有的接口和类型定义，将作为独立库发布到GitHub
// ==================== 常量定义 ====================
export const CONSTANTS = {
    H5_WIDTH: 1080, // H5画板宽度
    MODULE_WIDTH: 950, // 模块宽度
    PADDING: 0, // 内边距
    GRID_SIZE: 3, // 九宫格行列数
    DEFAULT_SPACING: 20 // 默认间距
};
// 模块类型枚举
export var ModuleType;
(function (ModuleType) {
    ModuleType["HEADER"] = "header";
    ModuleType["GAME_INFO"] = "gameInfo";
    ModuleType["FOOTER"] = "footer";
    ModuleType["ACTIVITY_CONTENT"] = "activityContent";
    ModuleType["SIGN_IN"] = "signIn";
    ModuleType["COLLECT_CARDS"] = "collectCards";
    ModuleType["NINE_GRID"] = "nineGrid";
    ModuleType["CAROUSEL"] = "carousel";
    ModuleType["VERTICAL_CAROUSEL"] = "verticalCarousel";
    ModuleType["RULES"] = "rules";
    ModuleType["CUSTOM"] = "custom";
})(ModuleType || (ModuleType = {}));
// 渠道类型枚举
export var ChannelType;
(function (ChannelType) {
    ChannelType["OPPO"] = "oppo";
    ChannelType["VIVO"] = "vivo";
    ChannelType["HUAWEI"] = "huawei";
    ChannelType["XIAOMI"] = "xiaomi";
})(ChannelType || (ChannelType = {}));
//# sourceMappingURL=index.js.map