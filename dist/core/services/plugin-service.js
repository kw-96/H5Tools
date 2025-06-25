"use strict";
/// <reference types="@figma/plugin-typings" />
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandlers = exports.PluginMessageService = void 0;
exports.setupMessageHandler = setupMessageHandler;
exports.initializePluginService = initializePluginService;
// 全局渠道图片存储
const channelImages = {};
/**
 * 插件消息处理服务
 * 负责处理来自UI的各种消息
 */
class PluginMessageService {
    /**
     * 处理创建原型消息
     */
    static async handleCreatePrototype(config) {
        if (!config) {
            throw new Error('配置数据为空');
        }
        // 动态导入避免循环依赖
        const { FontManager } = await Promise.resolve().then(() => __importStar(require('../builders/figma-utils')));
        const { createH5Prototype } = await Promise.resolve().then(() => __importStar(require('../builders/h5-prototype-builder')));
        await FontManager.loadAll();
        await createH5Prototype(config);
        figma.ui.postMessage({
            type: 'creation-success',
            message: '原型创建成功！'
        });
    }
    /**
     * 处理保存配置消息
     */
    static async handleSaveConfig(config) {
        try {
            await figma.clientStorage.setAsync('h5-config', JSON.stringify(config));
            figma.ui.postMessage({
                type: 'save-success',
                message: '配置已保存'
            });
        }
        catch (error) {
            throw new Error(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
    /**
     * 处理加载配置消息
     */
    static async handleLoadConfig() {
        try {
            const configStr = await figma.clientStorage.getAsync('h5-config');
            const config = configStr ? JSON.parse(configStr) : null;
            figma.ui.postMessage({
                type: 'load-config-success',
                config: config
            });
        }
        catch (error) {
            throw new Error(`加载配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
        }
    }
    /**
     * 处理获取主题消息
     */
    static async handleGetTheme() {
        try {
            const theme = await figma.clientStorage.getAsync('ui-theme') || 'light';
            figma.ui.postMessage({
                type: 'theme-loaded',
                theme: theme
            });
        }
        catch (error) {
            console.error('获取主题失败:', error);
            figma.ui.postMessage({
                type: 'theme-loaded',
                theme: 'light'
            });
        }
    }
    /**
     * 处理保存主题消息
     */
    static async handleSaveTheme(theme) {
        try {
            await figma.clientStorage.setAsync('ui-theme', theme);
            console.log('主题已保存:', theme);
        }
        catch (error) {
            console.error('保存主题失败:', error);
        }
    }
    /**
     * 处理渠道图片上传消息
     */
    static async handleChannelImageUpload(data) {
        try {
            const { channel, imageType, imageData } = data;
            // 初始化渠道对象（如果不存在）
            if (!channelImages[channel]) {
                channelImages[channel] = {};
            }
            // 存储图片数据
            channelImages[channel][imageType] = imageData;
            // 保存到 Figma 客户端存储
            await figma.clientStorage.setAsync(`channel-images-${channel}`, JSON.stringify(channelImages[channel]));
            console.log(`${channel} 渠道 ${imageType} 图片已保存:`, {
                name: imageData.name,
                size: `${imageData.width}x${imageData.height}`,
                dataSize: imageData.data.length
            });
            figma.ui.postMessage({
                type: 'channel-image-saved',
                channel: channel,
                imageType: imageType,
                message: '图片已保存'
            });
        }
        catch (error) {
            console.error('保存渠道图片失败:', error);
            figma.ui.postMessage({
                type: 'channel-image-error',
                message: `保存图片失败: ${error instanceof Error ? error.message : '未知错误'}`
            });
        }
    }
    /**
     * 处理渠道生成消息
     */
    static async handleChannelGenerate(channel) {
        try {
            // 动态导入避免循环依赖
            const { generateChannelVersion } = await Promise.resolve().then(() => __importStar(require('../builders/channel-generator')));
            await generateChannelVersion(channel);
            figma.ui.postMessage({
                type: 'channel-generate-success',
                channel: channel,
                message: `${channel} 渠道版本生成成功！`
            });
        }
        catch (error) {
            console.error(`${channel} 渠道生成失败:`, error);
            figma.ui.postMessage({
                type: 'channel-generate-error',
                channel: channel,
                message: `${channel} 渠道生成失败: ${error instanceof Error ? error.message : '未知错误'}`
            });
        }
    }
    /**
     * 加载所有渠道图片
     */
    static async loadChannelImages() {
        try {
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
            console.error('加载渠道图片失败:', error);
        }
    }
    /**
     * 获取渠道图片数据
     */
    static getChannelImages() {
        return channelImages;
    }
    /**
     * 获取指定渠道的图片数据
     */
    static getChannelImageData(channel, imageType) {
        return channelImages[channel]?.[imageType];
    }
}
exports.PluginMessageService = PluginMessageService;
/**
 * 消息处理器映射
 */
exports.MessageHandlers = {
    handleCreatePrototype: PluginMessageService.handleCreatePrototype,
    handleSaveConfig: PluginMessageService.handleSaveConfig,
    handleLoadConfig: PluginMessageService.handleLoadConfig,
    handleGetTheme: PluginMessageService.handleGetTheme,
    handleSaveTheme: PluginMessageService.handleSaveTheme,
    handleChannelImageUpload: PluginMessageService.handleChannelImageUpload,
    handleChannelGenerate: PluginMessageService.handleChannelGenerate,
    loadChannelImages: PluginMessageService.loadChannelImages
};
/**
 * 主消息处理函数
 * 处理来自UI的所有消息
 */
function setupMessageHandler() {
    figma.ui.onmessage = async (msg) => {
        try {
            const messageType = msg.type;
            switch (messageType) {
                case 'create-prototype':
                    await exports.MessageHandlers.handleCreatePrototype(msg.config);
                    break;
                case 'save-config':
                    await exports.MessageHandlers.handleSaveConfig(msg.config);
                    break;
                case 'load-config':
                    await exports.MessageHandlers.handleLoadConfig();
                    break;
                case 'get-theme':
                    await exports.MessageHandlers.handleGetTheme();
                    break;
                case 'save-theme':
                    await exports.MessageHandlers.handleSaveTheme(msg.theme);
                    break;
                case 'close-plugin':
                    figma.closePlugin();
                    break;
                case 'reset-complete':
                    figma.ui.postMessage({
                        type: 'reset-acknowledged',
                        message: '插件已确认重置完成'
                    });
                    break;
                case 'ping':
                    figma.ui.postMessage({
                        type: 'pong',
                        message: '插件连接正常'
                    });
                    break;
                case 'slice-image-response':
                    // 图片切片响应会由其他处理器处理
                    break;
                case 'generate':
                    try {
                        await exports.MessageHandlers.handleCreatePrototype(msg.config);
                        figma.ui.postMessage({ type: 'generate-complete' });
                    }
                    catch (error) {
                        console.error('生成失败:', error);
                        figma.ui.postMessage({
                            type: 'generate-error',
                            error: error instanceof Error ? error.message : '未知错误'
                        });
                    }
                    break;
                case 'channel-generate':
                    await exports.MessageHandlers.handleChannelGenerate(msg.channel);
                    break;
                case 'channel-image-upload':
                    await exports.MessageHandlers.handleChannelImageUpload(msg);
                    break;
                default:
                    console.warn('未知消息类型:', messageType);
            }
        }
        catch (error) {
            console.error('消息处理失败:', error);
            figma.ui.postMessage({
                type: 'error',
                message: error instanceof Error ? error.message : '未知错误'
            });
        }
    };
}
/**
 * 初始化插件服务
 */
async function initializePluginService() {
    try {
        // 加载渠道图片数据
        await exports.MessageHandlers.loadChannelImages();
        // 设置消息处理器
        setupMessageHandler();
        console.log('插件服务初始化完成');
    }
    catch (error) {
        console.error('插件服务初始化失败:', error);
    }
}
//# sourceMappingURL=plugin-service.js.map