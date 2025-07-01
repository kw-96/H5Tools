// H5Tools 插件主程序
// 使用模块化核心库

/// <reference types="@figma/plugin-typings" />

// ==================== 导入核心库 ====================

import { 
  H5Config, 
  PluginMessage,
  ChannelImageMessage,
  ChannelGenerateMessage,
  StorageMessage
} from '../core/types';
import { 
  createH5Prototype 
} from '../core/builders/h5-prototype-builder';
import { generateChannelVersion } from '../core/builders/channel-generator';
import { ConfigService, ThemeService } from '../core/services';

// ==================== 插件消息处理器 ====================

class MessageHandler {
  async handleMessage(msg: PluginMessage): Promise<void> {
    try {
      // 提前声明所有变量
      let setMsg: StorageMessage;
      let deleteMsg: StorageMessage;

      switch (msg.type) {
        case 'create-prototype':
        case 'generate':
          if (!msg.config) {
            throw new Error('配置信息不能为空');
          }
          await this.handleCreatePrototype(msg.config);
          break;
        case 'save-config':
          if (!msg.config) {
            throw new Error('配置信息不能为空');
          }
          await this.handleSaveConfig(msg.config);
          break;
        case 'load-config':
          await this.handleLoadConfig();
          break;
        case 'channel-image-upload':
          await this.handleChannelImageUpload(msg as ChannelImageMessage);
          break;
        case 'channel-generate':
          await this.handleGenerateChannelVersion(msg as ChannelGenerateMessage);
          break;
        case 'storage-set':
          setMsg = msg as StorageMessage;
          if (!setMsg.key || setMsg.value === undefined) {
            throw new Error('存储键和值不能为空');
          }
          await this.handleStorageSet(setMsg.key, setMsg.value);
          break;
        case 'storage-delete':
          deleteMsg = msg as StorageMessage;
          if (!deleteMsg.key) {
            throw new Error('存储键不能为空');
          }
          await this.handleStorageDelete(deleteMsg.key);
          break;
        case 'storage-get':
          const getMsg = msg as StorageMessage;
          if (!getMsg.key) {
            throw new Error('存储键不能为空');
          }
          await this.handleStorageGet(getMsg.key, getMsg._messageId);
          break;
        case 'ui-loaded':
          console.log('UI界面已加载');
          break;
        case 'ui-ready':
          console.log('UI界面已就绪');
          break;
        default:
          console.warn('未知消息类型:', msg.type);
      }
    } catch (error) {
      console.error('处理消息失败:', error);
      figma.ui.postMessage({
        type: 'error',
        message: `操作失败: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  }

  private async handleCreatePrototype(config: H5Config): Promise<void> {
    try {
      console.log('开始创建H5原型...');
      
      await createH5Prototype(config);
      
      figma.ui.postMessage({
        type: 'prototype-created',
        message: 'H5原型创建成功！'
      });
      
      console.log('H5原型创建完成');
    } catch (error) {
      console.error('创建H5原型失败:', error);
      figma.ui.postMessage({
        type: 'error',
        message: `创建H5原型失败: ${error instanceof Error ? error.message : String(error)}`
      });
      throw error;
    }
  }

  private async handleSaveConfig(config: H5Config): Promise<void> {
    try {
      await ConfigService.saveConfig(config);
      figma.ui.postMessage({
        type: 'config-saved',
        message: '配置保存成功'
      });
    } catch (error) {
      console.error('保存配置失败:', error);
      figma.ui.postMessage({
        type: 'error',
        message: `保存配置失败: ${error instanceof Error ? error.message : String(error)}`
      });
      throw error;
    }
  }

  private async handleLoadConfig(): Promise<void> {
    try {
      const config = await ConfigService.loadConfig();
      figma.ui.postMessage({
        type: 'config-loaded',
        config: config
      });
    } catch (error) {
      console.error('加载配置失败:', error);
      figma.ui.postMessage({
        type: 'error',
        message: `加载配置失败: ${error instanceof Error ? error.message : String(error)}`
      });
      throw error;
    }
  }



  private async handleChannelImageUpload(msg: ChannelImageMessage): Promise<void> {
    try {
      console.log('渠道图片上传:', {
        channel: msg.channel,
        imageType: msg.imageType,
        imageData: msg.imageData
      });
      figma.ui.postMessage({
        type: 'channel-image-uploaded',
        message: '渠道图片上传成功'
      });
    } catch (error) {
      console.error('渠道图片上传失败:', error);
      figma.ui.postMessage({
        type: 'error',
        message: `渠道图片上传失败: ${error instanceof Error ? error.message : String(error)}`
      });
      throw error;
    }
  }

  private async handleGenerateChannelVersion(msg: ChannelGenerateMessage): Promise<void> {
    try {
      console.log('开始生成渠道版本:', msg.channel);
      
      // 调用渠道生成器
      await generateChannelVersion(msg.channel);
      
      figma.ui.postMessage({
        type: 'channel-version-generated',
        message: `${msg.channel.toUpperCase()}渠道版本生成成功`
      });
      
      console.log(`${msg.channel}渠道版本生成完成`);
    } catch (error) {
      console.error('生成渠道版本失败:', error);
      figma.ui.postMessage({
        type: 'error',
        message: `生成${msg.channel.toUpperCase()}渠道版本失败: ${error instanceof Error ? error.message : String(error)}`
      });
      throw error;
    }
  }

  private async handleStorageSet(key: string, value: unknown): Promise<void> {
    try {
      await figma.clientStorage.setAsync(key, value);
      console.log(`✅ Figma存储设置成功: ${key}`);
    } catch (error) {
      console.error(`Figma存储设置失败 ${key}:`, error);
    }
  }

  private async handleStorageDelete(key: string): Promise<void> {
    try {
      await figma.clientStorage.deleteAsync(key);
      console.log(`✅ Figma存储删除成功: ${key}`);
    } catch (error) {
      console.error(`Figma存储删除失败 ${key}:`, error);
    }
  }

  private async handleStorageGet(key: string, messageId?: string): Promise<void> {
    try {
      const value = await figma.clientStorage.getAsync(key);
      console.log(`✅ Figma存储获取成功: ${key}`, value);
      figma.ui.postMessage({
        type: 'storage-get-response',
        key: key,
        value: value,
        _messageId: messageId
      });
    } catch (error) {
      console.error(`Figma存储获取失败 ${key}:`, error);
      figma.ui.postMessage({
        type: 'error',
        message: `获取存储失败: ${error instanceof Error ? error.message : String(error)}`,
        key: key,
        _messageId: messageId
      });
    }
  }
}

// ==================== 插件入口 ====================

const messageHandler = new MessageHandler();

// 显示UI界面
figma.showUI(__html__, { width: 360, height: 700 });

// 监听来自UI的消息
figma.ui.onmessage = async (msg: PluginMessage) => {
  await messageHandler.handleMessage(msg);
};

console.log('H5Tools插件已启动'); 