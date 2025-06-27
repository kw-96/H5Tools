// 渠道美术-H5延展工具 - 核心服务层
// 这个文件包含所有的服务类，将作为独立库发布到GitHub
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var _a;
// ==================== 存储适配器 ====================
// 适配Figma插件沙盒环境，使用clientStorage替代localStorage
class StorageAdapter {
    // 检查是否在Figma环境中
    static isFigmaEnvironment() {
        return typeof figma !== 'undefined' && !!figma.clientStorage;
    }
    // 异步保存数据
    static setItem(key, value) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isFigmaEnvironment()) {
                yield figma.clientStorage.setAsync(key, value);
            }
            else {
                // 回退到localStorage（用于测试环境）
                localStorage.setItem(key, value);
            }
        });
    }
    // 异步获取数据
    static getItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isFigmaEnvironment()) {
                return (yield figma.clientStorage.getAsync(key)) || null;
            }
            else {
                // 回退到localStorage（用于测试环境）
                return localStorage.getItem(key);
            }
        });
    }
    // 异步删除数据
    static removeItem(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isFigmaEnvironment()) {
                yield figma.clientStorage.deleteAsync(key);
            }
            else {
                // 回退到localStorage（用于测试环境）
                localStorage.removeItem(key);
            }
        });
    }
    // 获取所有键（仅用于localStorage兼容）
    static getAllKeys() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isFigmaEnvironment()) {
                // Figma clientStorage没有直接获取所有键的方法
                // 我们需要维护一个键列表
                const keyList = (yield figma.clientStorage.getAsync('__storage_keys__')) || '[]';
                return JSON.parse(keyList);
            }
            else {
                return Object.keys(localStorage);
            }
        });
    }
}
// ==================== 配置管理服务 ====================
export class ConfigService {
    // 保存配置到存储
    static saveConfig(config) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configData = JSON.stringify(config);
                yield StorageAdapter.setItem(this.STORAGE_KEY, configData);
            }
            catch (error) {
                console.error('保存配置失败:', error);
                throw new Error('保存配置失败');
            }
        });
    }
    // 从存储加载配置
    static loadConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configData = yield StorageAdapter.getItem(this.STORAGE_KEY);
                if (!configData)
                    return null;
                return JSON.parse(configData);
            }
            catch (error) {
                console.error('加载配置失败:', error);
                return null;
            }
        });
    }
    // 清除配置
    static clearConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield StorageAdapter.removeItem(this.STORAGE_KEY);
            }
            catch (error) {
                console.error('清除配置失败:', error);
            }
        });
    }
    // 验证配置完整性
    static validateConfig(config) {
        var _b, _c, _d, _e, _f, _g;
        const errors = [];
        if (!((_b = config.pageTitle) === null || _b === void 0 ? void 0 : _b.trim())) {
            errors.push('页面标题不能为空');
        }
        if (!((_c = config.gameName) === null || _c === void 0 ? void 0 : _c.trim())) {
            errors.push('游戏名称不能为空');
        }
        if (!config.buttonVersion) {
            errors.push('请选择按钮版本');
        }
        // 根据按钮版本验证相应字段
        switch (config.buttonVersion) {
            case 'icon':
                if (!((_d = config.iconButtonText) === null || _d === void 0 ? void 0 : _d.trim())) {
                    errors.push('带图标按钮文本不能为空');
                }
                break;
            case 'single':
                if (!((_e = config.singleButtonText) === null || _e === void 0 ? void 0 : _e.trim())) {
                    errors.push('单按钮文本不能为空');
                }
                break;
            case 'double':
                if (!((_f = config.leftButtonText) === null || _f === void 0 ? void 0 : _f.trim())) {
                    errors.push('左侧按钮文本不能为空');
                }
                if (!((_g = config.rightButtonText) === null || _g === void 0 ? void 0 : _g.trim())) {
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
export class ThemeService {
    // 保存主题设置
    static saveTheme(theme) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isValidTheme(theme)) {
                throw new Error('无效的主题类型');
            }
            try {
                yield StorageAdapter.setItem(this.THEME_KEY, theme);
            }
            catch (error) {
                console.error('保存主题失败:', error);
            }
        });
    }
    // 加载主题设置
    static loadTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const theme = yield StorageAdapter.getItem(this.THEME_KEY);
                return this.isValidTheme(theme) ? theme : 'auto';
            }
            catch (error) {
                console.error('加载主题失败:', error);
                return 'auto';
            }
        });
    }
    // 检测系统主题
    static detectSystemTheme() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    }
    // 获取当前应用的主题
    static getCurrentTheme() {
        return __awaiter(this, void 0, void 0, function* () {
            const savedTheme = yield this.loadTheme();
            if (savedTheme === 'auto') {
                return this.detectSystemTheme();
            }
            return savedTheme;
        });
    }
    // 验证主题类型
    static isValidTheme(theme) {
        return theme !== null && this.THEMES.indexOf(theme) !== -1;
    }
}
ThemeService.THEME_KEY = 'h5-tools-theme';
ThemeService.THEMES = ['light', 'dark', 'auto'];
// ==================== 渠道图片管理服务 ====================
export class ChannelImageService {
    // 保存渠道图片
    static saveChannelImage(channel, imageType, imageData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allImages = yield this.loadAllChannelImages();
                if (!allImages[channel]) {
                    allImages[channel] = {};
                }
                allImages[channel][imageType] = imageData;
                // 检查存储大小
                const dataSize = this.calculateStorageSize(allImages);
                if (dataSize > this.MAX_STORAGE_SIZE) {
                    throw new Error('存储空间不足，请清理旧数据');
                }
                yield StorageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(allImages));
            }
            catch (error) {
                console.error('保存渠道图片失败:', error);
                throw error;
            }
        });
    }
    // 加载所有渠道图片
    static loadAllChannelImages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield StorageAdapter.getItem(this.STORAGE_KEY);
                if (!data)
                    return {};
                return JSON.parse(data);
            }
            catch (error) {
                console.error('加载渠道图片失败:', error);
                return {};
            }
        });
    }
    // 加载指定渠道的图片
    static loadChannelImages(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const allImages = yield this.loadAllChannelImages();
            return allImages[channel] || {};
        });
    }
    // 删除指定渠道的指定图片
    static deleteChannelImage(channel, imageType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allImages = yield this.loadAllChannelImages();
                if (allImages[channel] && allImages[channel][imageType]) {
                    delete allImages[channel][imageType];
                    // 如果渠道下没有图片了，删除整个渠道
                    if (Object.keys(allImages[channel]).length === 0) {
                        delete allImages[channel];
                    }
                    yield StorageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(allImages));
                }
            }
            catch (error) {
                console.error('删除渠道图片失败:', error);
                throw error;
            }
        });
    }
    // 清空所有渠道图片
    static clearAllChannelImages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield StorageAdapter.removeItem(this.STORAGE_KEY);
            }
            catch (error) {
                console.error('清空渠道图片失败:', error);
            }
        });
    }
    // 清理过期的渠道图片
    static clearExpiredChannelImages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allImages = yield this.loadAllChannelImages();
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
                    yield StorageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(allImages));
                }
            }
            catch (error) {
                console.error('清理过期渠道图片失败:', error);
            }
        });
    }
    // 计算存储大小
    static calculateStorageSize(data) {
        return JSON.stringify(data).length * 2; // 估算字节大小
    }
    // 获取存储使用情况
    static getStorageUsage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allImages = yield this.loadAllChannelImages();
                const used = this.calculateStorageSize(allImages);
                const max = this.MAX_STORAGE_SIZE;
                const percentage = (used / max) * 100;
                return { used, max, percentage };
            }
            catch (error) {
                console.error('获取存储使用情况失败:', error);
                return { used: 0, max: this.MAX_STORAGE_SIZE, percentage: 0 };
            }
        });
    }
}
ChannelImageService.STORAGE_KEY = 'h5-tools-channel-images';
ChannelImageService.MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
// ==================== 数据验证服务 ====================
export class ValidationService {
    // 验证H5配置
    static validateH5Config(config) {
        return ConfigService.validateConfig(config);
    }
    // 验证图片数据
    static validateImageData(imageData) {
        const errors = [];
        if (!imageData) {
            errors.push('图片数据不能为空');
            return { isValid: false, errors };
        }
        if (typeof imageData !== 'object') {
            errors.push('图片数据格式错误');
            return { isValid: false, errors };
        }
        if (!imageData.data || typeof imageData.data !== 'string') {
            errors.push('图片数据内容无效');
        }
        if (!imageData.name || typeof imageData.name !== 'string') {
            errors.push('图片名称无效');
        }
        if (!imageData.type || typeof imageData.type !== 'string') {
            errors.push('图片类型无效');
        }
        if (typeof imageData.size !== 'number' || imageData.size <= 0) {
            errors.push('图片大小无效');
        }
        // 检查图片大小限制（10MB）
        if (imageData.size > 10 * 1024 * 1024) {
            errors.push('图片大小不能超过10MB');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    // 验证渠道名称
    static validateChannelName(channel) {
        return typeof channel === 'string' && channel.trim().length > 0;
    }
}
// ==================== 服务管理器 ====================
// 服务模块导出
export * from './storage.service';
export * from './theme.service';
export * from './plugin-service';
export * from './config.service';
export * from './channel-image.service';
export * from './validation.service';
// 服务管理器
export class ServiceManager {
    static initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // 初始化所有服务
            yield Promise.all([
                this.config.loadConfig(),
                this.theme.getInstance(),
                this.channelImage.clearExpiredChannelImages()
            ]);
        });
    }
    static getSystemStatus() {
        return __awaiter(this, void 0, void 0, function* () {
            const [config, themeInstance, storageUsage] = yield Promise.all([
                this.config.loadConfig(),
                this.theme.getInstance(),
                this.channelImage.getStorageUsage()
            ]);
            const theme = yield themeInstance.getCurrentTheme();
            return {
                configLoaded: !!config,
                theme,
                storageUsage
            };
        });
    }
}
_a = ServiceManager;
ServiceManager.config = {
    loadConfig: () => __awaiter(void 0, void 0, void 0, function* () {
        const { ConfigService } = yield import('./config.service');
        return ConfigService.loadConfig();
    })
};
ServiceManager.theme = {
    getInstance: () => __awaiter(void 0, void 0, void 0, function* () {
        const { ThemeService } = yield import('./theme.service');
        return ThemeService.getInstance();
    })
};
ServiceManager.channelImage = {
    clearExpiredChannelImages: () => __awaiter(void 0, void 0, void 0, function* () {
        const { ChannelImageService } = yield import('./channel-image.service');
        return ChannelImageService.clearExpiredChannelImages();
    }),
    getStorageUsage: () => __awaiter(void 0, void 0, void 0, function* () {
        const { ChannelImageService } = yield import('./channel-image.service');
        return ChannelImageService.getStorageUsage();
    })
};
ServiceManager.validation = {
    validateH5Config: (config) => __awaiter(void 0, void 0, void 0, function* () {
        const { ValidationService } = yield import('./validation.service');
        return ValidationService.validateH5Config(config);
    })
};
//# sourceMappingURL=index.js.map