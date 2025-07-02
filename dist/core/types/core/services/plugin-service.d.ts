import { H5Config, ChannelImages, ChannelImageData } from '../types';
/**
 * 插件消息处理服务
 * 负责处理来自UI的各种消息
 */
export declare class PluginMessageService {
    /**
     * 处理创建原型消息
     */
    static handleCreatePrototype(config: H5Config): Promise<void>;
    /**
     * 处理保存配置消息
     */
    static handleSaveConfig(config: H5Config): Promise<void>;
    /**
     * 处理加载配置消息
     */
    static handleLoadConfig(): Promise<void>;
    /**
     * 处理获取主题消息
     */
    static handleGetTheme(): Promise<void>;
    /**
     * 处理保存主题消息
     */
    static handleSaveTheme(theme: string): Promise<void>;
    /**
     * 处理渠道图片上传消息
     */
    static handleChannelImageUpload(data: {
        channel: string;
        imageType: string;
        imageData: ChannelImageData;
    }): Promise<void>;
    /**
     * 处理渠道生成消息
     */
    static handleChannelGenerate(channel: string): Promise<void>;
    /**
     * 加载所有渠道图片
     */
    static loadChannelImages(): Promise<void>;
    /**
     * 获取渠道图片数据
     */
    static getChannelImages(): ChannelImages;
    /**
     * 获取指定渠道的图片数据
     */
    static getChannelImageData(channel: string, imageType: string): ChannelImageData | undefined;
}
/**
 * 消息处理器映射
 */
export declare const MessageHandlers: {
    handleCreatePrototype: typeof PluginMessageService.handleCreatePrototype;
    handleSaveConfig: typeof PluginMessageService.handleSaveConfig;
    handleLoadConfig: typeof PluginMessageService.handleLoadConfig;
    handleGetTheme: typeof PluginMessageService.handleGetTheme;
    handleSaveTheme: typeof PluginMessageService.handleSaveTheme;
    handleChannelImageUpload: typeof PluginMessageService.handleChannelImageUpload;
    handleChannelGenerate: typeof PluginMessageService.handleChannelGenerate;
    loadChannelImages: typeof PluginMessageService.loadChannelImages;
};
/**
 * 主消息处理函数
 * 处理来自UI的所有消息
 */
export declare function setupMessageHandler(): void;
/**
 * 初始化插件服务
 */
export declare function initializePluginService(): Promise<void>;
