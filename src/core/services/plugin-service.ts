/// <reference types="@figma/plugin-typings" />

import { H5Config, ChannelImages, ChannelImageData } from '../types';

// 全局渠道图片存储
const channelImages: ChannelImages = {};

/**
 * 插件消息处理服务
 * 负责处理来自UI的各种消息
 */
export class PluginMessageService {
  
  /**
   * 处理创建原型消息
   */
  static async handleCreatePrototype(config: H5Config): Promise<void> {
    if (!config) {
      throw new Error('配置数据为空');
    }

    // 动态导入避免循环依赖
    const { FontManager } = await import('../builders/figma-utils');
    const { createH5Prototype } = await import('../builders/h5-prototype-builder');

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
  static async handleSaveConfig(config: H5Config): Promise<void> {
    try {
      await figma.clientStorage.setAsync('h5-config', JSON.stringify(config));
      figma.ui.postMessage({
        type: 'save-success',
        message: '配置已保存'
      });
    } catch (error) {
      throw new Error(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 处理加载配置消息
   */
  static async handleLoadConfig(): Promise<void> {
    try {
      const configStr = await figma.clientStorage.getAsync('h5-config');
      const config = configStr ? JSON.parse(configStr) : null;
      
      figma.ui.postMessage({
        type: 'load-config-success',
        config: config
      });
    } catch (error) {
      throw new Error(`加载配置失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 处理获取主题消息
   */
  static async handleGetTheme(): Promise<void> {
    try {
      const theme = await figma.clientStorage.getAsync('ui-theme') || 'light';
      figma.ui.postMessage({
        type: 'theme-loaded',
        theme: theme
      });
    } catch (error) {
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
  static async handleSaveTheme(theme: string): Promise<void> {
    try {
      await figma.clientStorage.setAsync('ui-theme', theme);
      console.log('主题已保存:', theme);
    } catch (error) {
      console.error('保存主题失败:', error);
    }
  }

  /**
   * 处理渠道图片上传消息
   */
  static async handleChannelImageUpload(data: { channel: string; imageType: string; imageData: ChannelImageData }): Promise<void> {
    try {
      const { channel, imageType, imageData } = data;
      
      // 初始化渠道对象（如果不存在）
      if (!channelImages[channel]) {
        channelImages[channel] = {};
      }
      
      // 存储图片数据
      channelImages[channel][imageType as keyof ChannelImages[string]] = imageData;
      
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
      
    } catch (error) {
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
  static async handleChannelGenerate(channel: string): Promise<void> {
    try {
      // 动态导入避免循环依赖
      const { generateChannelVersion } = await import('../builders/channel-generator');
      await generateChannelVersion(channel);
      
      figma.ui.postMessage({
        type: 'channel-generate-success',
        channel: channel,
        message: `${channel} 渠道版本生成成功！`
      });
    } catch (error) {
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
  static async loadChannelImages(): Promise<void> {
    try {
      const channels = ['oppo', 'vivo', 'huawei', 'xiaomi'];
      
      for (const channel of channels) {
        const stored = await figma.clientStorage.getAsync(`channel-images-${channel}`);
        if (stored) {
          channelImages[channel] = JSON.parse(stored);
          console.log(`已加载 ${channel} 渠道图片数据`);
        }
      }
      
    } catch (error) {
      console.error('加载渠道图片失败:', error);
    }
  }

  /**
   * 获取渠道图片数据
   */
  static getChannelImages(): ChannelImages {
    return channelImages;
  }

  /**
   * 获取指定渠道的图片数据
   */
  static getChannelImageData(channel: string, imageType: string): ChannelImageData | undefined {
    return channelImages[channel]?.[imageType as keyof ChannelImages[string]];
  }
}

/**
 * 消息处理器映射
 */
export const MessageHandlers = {
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
export function setupMessageHandler(): void {
  figma.ui.onmessage = async (msg: Record<string, unknown>) => {
    try {
      const messageType = msg.type as string;
      
      switch (messageType) {
        case 'create-prototype':
          await MessageHandlers.handleCreatePrototype(msg.config as H5Config);
          break;
        
        case 'save-config':
          await MessageHandlers.handleSaveConfig(msg.config as H5Config);
          break;
        
        case 'load-config':
          await MessageHandlers.handleLoadConfig();
          break;
        
        case 'get-theme':
          await MessageHandlers.handleGetTheme();
          break;
        
        case 'save-theme':
          await MessageHandlers.handleSaveTheme(msg.theme as string);
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
            await MessageHandlers.handleCreatePrototype(msg.config as H5Config);
            figma.ui.postMessage({ type: 'generate-complete' });
          } catch (error) {
            console.error('生成失败:', error);
            figma.ui.postMessage({ 
              type: 'generate-error', 
              error: error instanceof Error ? error.message : '未知错误'
            });
          }
          break;

        case 'channel-generate':
          await MessageHandlers.handleChannelGenerate(msg.channel as string);
          break;

        case 'channel-image-upload':
          await MessageHandlers.handleChannelImageUpload(msg as { channel: string; imageType: string; imageData: ChannelImageData });
          break;
        
        default:
          console.warn('未知消息类型:', messageType);
      }
    } catch (error) {
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
export async function initializePluginService(): Promise<void> {
  try {
    // 加载渠道图片数据
    await MessageHandlers.loadChannelImages();
    
    // 设置消息处理器
    setupMessageHandler();
    
    console.log('插件服务初始化完成');
  } catch (error) {
    console.error('插件服务初始化失败:', error);
  }
} 