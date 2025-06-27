import { ChannelImages, ChannelImageData } from '../types';
import { StorageService } from './storage.service';

// 渠道图片服务
export class ChannelImageService {
  private static readonly STORAGE_KEY = 'h5-tools-channel-images';
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
  private static storage = StorageService.getInstance();
  
  // 保存渠道图片
  static async saveChannelImage(channel: string, imageType: string, imageData: ChannelImageData): Promise<void> {
    try {
      // 加载现有数据
      const allImages = await this.loadAllChannelImages();
      
      // 更新数据
      if (!allImages[channel]) {
        allImages[channel] = {};
      }
      allImages[channel][imageType] = {
        ...imageData,
        timestamp: Date.now()
      };
      
      // 检查存储大小
      const storageSize = this.calculateStorageSize(allImages);
      if (storageSize > this.MAX_STORAGE_SIZE) {
        await this.clearExpiredChannelImages();
      }
      
      // 保存数据
      const jsonData = JSON.stringify(allImages);
      this.storage.setItem(this.STORAGE_KEY, jsonData);
    } catch (error) {
      console.error('保存渠道图片失败:', error);
      throw new Error('保存渠道图片失败');
    }
  }
  
  // 加载所有渠道图片
  static async loadAllChannelImages(): Promise<ChannelImages> {
    try {
      const jsonData = this.storage.getItem(this.STORAGE_KEY);
      if (!jsonData) return {};
      
      return JSON.parse(jsonData) as ChannelImages;
    } catch (error) {
      console.error('加载渠道图片失败:', error);
      return {};
    }
  }
  
  // 加载指定渠道的图片
  static async loadChannelImages(channel: string): Promise<ChannelImages[string]> {
    const allImages = await this.loadAllChannelImages();
    return allImages[channel] || {};
  }
  
  // 删除渠道图片
  static async deleteChannelImage(channel: string, imageType: string): Promise<void> {
    try {
      const allImages = await this.loadAllChannelImages();
      
      if (allImages[channel] && allImages[channel][imageType]) {
        delete allImages[channel][imageType];
        
        // 如果渠道没有图片了，删除渠道
        if (Object.keys(allImages[channel]).length === 0) {
          delete allImages[channel];
        }
        
        const jsonData = JSON.stringify(allImages);
        this.storage.setItem(this.STORAGE_KEY, jsonData);
      }
    } catch (error) {
      console.error('删除渠道图片失败:', error);
    }
  }
  
  // 清除所有渠道图片
  static async clearAllChannelImages(): Promise<void> {
    try {
      this.storage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('清除所有渠道图片失败:', error);
    }
  }
  
  // 清除过期的渠道图片
  static async clearExpiredChannelImages(): Promise<void> {
    try {
      const allImages = await this.loadAllChannelImages();
      const now = Date.now();
      const expireTime = 7 * 24 * 60 * 60 * 1000; // 7天过期
      
      let hasExpired = false;
      
      // 遍历所有渠道
      for (const channel in allImages) {
        const channelImages = allImages[channel];
        
        // 遍历渠道内的图片
        for (const imageType in channelImages) {
          const imageData = channelImages[imageType];
          
          // 检查是否过期
          if (now - imageData.timestamp > expireTime) {
            delete channelImages[imageType];
            hasExpired = true;
          }
        }
        
        // 如果渠道没有图片了，删除渠道
        if (Object.keys(channelImages).length === 0) {
          delete allImages[channel];
        }
      }
      
      // 如果有过期数据，保存更新
      if (hasExpired) {
        const jsonData = JSON.stringify(allImages);
        this.storage.setItem(this.STORAGE_KEY, jsonData);
      }
    } catch (error) {
      console.error('清除过期渠道图片失败:', error);
    }
  }
  
  // 计算存储大小
  private static calculateStorageSize(data: ChannelImages): number {
    return new Blob([JSON.stringify(data)]).size;
  }
  
  // 获取存储使用情况
  static async getStorageUsage(): Promise<{ used: number; max: number; percentage: number }> {
    try {
      const allImages = await this.loadAllChannelImages();
      const used = this.calculateStorageSize(allImages);
      const percentage = (used / this.MAX_STORAGE_SIZE) * 100;
      
      return {
        used,
        max: this.MAX_STORAGE_SIZE,
        percentage
      };
    } catch (error) {
      console.error('获取存储使用情况失败:', error);
      return {
        used: 0,
        max: this.MAX_STORAGE_SIZE,
        percentage: 0
      };
    }
  }
} 