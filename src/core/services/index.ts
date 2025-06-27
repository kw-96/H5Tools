// 渠道美术-H5延展工具 - 核心服务层
// 这个文件包含所有的服务类，将作为独立库发布到GitHub

import { H5Config, ChannelImages, ChannelImageData } from '../types';

// ==================== 存储适配器 ====================
// 适配Figma插件沙盒环境，使用clientStorage替代localStorage

class StorageAdapter {
  // 检查是否在Figma环境中
  private static isFigmaEnvironment(): boolean {
    return typeof figma !== 'undefined' && !!figma.clientStorage;
  }

  // 异步保存数据
  static async setItem(key: string, value: string): Promise<void> {
    if (this.isFigmaEnvironment()) {
      await figma.clientStorage.setAsync(key, value);
    } else {
      // 回退到localStorage（用于测试环境）
      localStorage.setItem(key, value);
    }
  }

  // 异步获取数据
  static async getItem(key: string): Promise<string | null> {
    if (this.isFigmaEnvironment()) {
      return await figma.clientStorage.getAsync(key) || null;
    } else {
      // 回退到localStorage（用于测试环境）
      return localStorage.getItem(key);
    }
  }

  // 异步删除数据
  static async removeItem(key: string): Promise<void> {
    if (this.isFigmaEnvironment()) {
      await figma.clientStorage.deleteAsync(key);
    } else {
      // 回退到localStorage（用于测试环境）
      localStorage.removeItem(key);
    }
  }

  // 获取所有键（仅用于localStorage兼容）
  static async getAllKeys(): Promise<string[]> {
    if (this.isFigmaEnvironment()) {
      // Figma clientStorage没有直接获取所有键的方法
      // 我们需要维护一个键列表
      const keyList = await figma.clientStorage.getAsync('__storage_keys__') || '[]';
      return JSON.parse(keyList);
    } else {
      return Object.keys(localStorage);
    }
  }
}

// ==================== 配置管理服务 ====================

export class ConfigService {
  private static readonly STORAGE_KEY = 'h5-tools-config';
  
  // 保存配置到存储
  static async saveConfig(config: H5Config): Promise<void> {
    try {
      const configData = JSON.stringify(config);
      await StorageAdapter.setItem(this.STORAGE_KEY, configData);
    } catch (error) {
      console.error('保存配置失败:', error);
      throw new Error('保存配置失败');
    }
  }
  
  // 从存储加载配置
  static async loadConfig(): Promise<H5Config | null> {
    try {
      const configData = await StorageAdapter.getItem(this.STORAGE_KEY);
      if (!configData) return null;
      
      return JSON.parse(configData) as H5Config;
    } catch (error) {
      console.error('加载配置失败:', error);
      return null;
    }
  }
  
  // 清除配置
  static async clearConfig(): Promise<void> {
    try {
      await StorageAdapter.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('清除配置失败:', error);
    }
  }
  
  // 验证配置完整性
  static validateConfig(config: H5Config): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!config.pageTitle?.trim()) {
      errors.push('页面标题不能为空');
    }
    
    if (!config.gameName?.trim()) {
      errors.push('游戏名称不能为空');
    }
    
    if (!config.buttonVersion) {
      errors.push('请选择按钮版本');
    }
    
    // 根据按钮版本验证相应字段
    switch (config.buttonVersion) {
      case 'icon':
        if (!config.iconButtonText?.trim()) {
          errors.push('带图标按钮文本不能为空');
        }
        break;
      case 'single':
        if (!config.singleButtonText?.trim()) {
          errors.push('单按钮文本不能为空');
        }
        break;
      case 'double':
        if (!config.leftButtonText?.trim()) {
          errors.push('左侧按钮文本不能为空');
        }
        if (!config.rightButtonText?.trim()) {
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
  static createDefaultConfig(): H5Config {
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

// ==================== 主题管理服务 ====================

export class ThemeService {
  private static readonly THEME_KEY = 'h5-tools-theme';
  private static readonly THEMES = ['light', 'dark', 'auto'] as const;
  
  // 保存主题设置
  static async saveTheme(theme: string): Promise<void> {
    if (!this.isValidTheme(theme)) {
      throw new Error('无效的主题类型');
    }
    
    try {
      await StorageAdapter.setItem(this.THEME_KEY, theme);
    } catch (error) {
      console.error('保存主题失败:', error);
    }
  }
  
  // 加载主题设置
  static async loadTheme(): Promise<string> {
    try {
      const theme = await StorageAdapter.getItem(this.THEME_KEY);
      return this.isValidTheme(theme) ? theme : 'auto';
    } catch (error) {
      console.error('加载主题失败:', error);
      return 'auto';
    }
  }
  
  // 检测系统主题
  static detectSystemTheme(): 'light' | 'dark' {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  
  // 获取当前应用的主题
  static async getCurrentTheme(): Promise<'light' | 'dark'> {
    const savedTheme = await this.loadTheme();
    if (savedTheme === 'auto') {
      return this.detectSystemTheme();
    }
    return savedTheme as 'light' | 'dark';
  }
  
  // 验证主题类型
  private static isValidTheme(theme: string | null): theme is string {
    return theme !== null && this.THEMES.indexOf(theme as typeof ThemeService.THEMES[number]) !== -1;
  }
}

// ==================== 渠道图片管理服务 ====================

export class ChannelImageService {
  private static readonly STORAGE_KEY = 'h5-tools-channel-images';
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
  
  // 保存渠道图片
  static async saveChannelImage(channel: string, imageType: string, imageData: ChannelImageData): Promise<void> {
    try {
      const allImages = await this.loadAllChannelImages();
      
      if (!allImages[channel]) {
        allImages[channel] = {};
      }
      
      allImages[channel][imageType as keyof typeof allImages[typeof channel]] = imageData;
      
      // 检查存储大小
      const dataSize = this.calculateStorageSize(allImages);
      if (dataSize > this.MAX_STORAGE_SIZE) {
        throw new Error('存储空间不足，请清理旧数据');
      }
      
      await StorageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(allImages));
    } catch (error) {
      console.error('保存渠道图片失败:', error);
      throw error;
    }
  }
  
  // 加载所有渠道图片
  static async loadAllChannelImages(): Promise<ChannelImages> {
    try {
      const data = await StorageAdapter.getItem(this.STORAGE_KEY);
      if (!data) return {};
      
      return JSON.parse(data) as ChannelImages;
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
  
  // 删除指定渠道的指定图片
  static async deleteChannelImage(channel: string, imageType: string): Promise<void> {
    try {
      const allImages = await this.loadAllChannelImages();
      
      if (allImages[channel] && allImages[channel][imageType as keyof typeof allImages[typeof channel]]) {
        delete allImages[channel][imageType as keyof typeof allImages[typeof channel]];
        
        // 如果渠道下没有图片了，删除整个渠道
        if (Object.keys(allImages[channel]).length === 0) {
          delete allImages[channel];
        }
        
        await StorageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(allImages));
      }
    } catch (error) {
      console.error('删除渠道图片失败:', error);
      throw error;
    }
  }
  
  // 清空所有渠道图片
  static async clearAllChannelImages(): Promise<void> {
    try {
      await StorageAdapter.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('清空渠道图片失败:', error);
    }
  }
  
  // 清理过期的渠道图片
  static async clearExpiredChannelImages(): Promise<void> {
    try {
      const allImages = await this.loadAllChannelImages();
      const now = Date.now();
      const expiredTime = 30 * 24 * 60 * 60 * 1000; // 30天
      
      let hasChanges = false;
      
      for (const channel in allImages) {
        for (const imageType in allImages[channel]) {
          const imageData = allImages[channel][imageType as keyof typeof allImages[typeof channel]];
          if (imageData && typeof imageData === 'object' && 'timestamp' in imageData) {
            if (now - imageData.timestamp > expiredTime) {
              delete allImages[channel][imageType as keyof typeof allImages[typeof channel]];
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
        await StorageAdapter.setItem(this.STORAGE_KEY, JSON.stringify(allImages));
      }
    } catch (error) {
      console.error('清理过期渠道图片失败:', error);
    }
  }
  
  // 计算存储大小
  private static calculateStorageSize(data: ChannelImages): number {
    return JSON.stringify(data).length * 2; // 估算字节大小
  }
  
  // 获取存储使用情况
  static async getStorageUsage(): Promise<{ used: number; max: number; percentage: number }> {
    try {
      const allImages = await this.loadAllChannelImages();
      const used = this.calculateStorageSize(allImages);
      const max = this.MAX_STORAGE_SIZE;
      const percentage = (used / max) * 100;
      
      return { used, max, percentage };
    } catch (error) {
      console.error('获取存储使用情况失败:', error);
      return { used: 0, max: this.MAX_STORAGE_SIZE, percentage: 0 };
    }
  }
}

// ==================== 数据验证服务 ====================

export class ValidationService {
  // 验证H5配置
  static validateH5Config(config: Partial<H5Config>): { isValid: boolean; errors: string[] } {
    return ConfigService.validateConfig(config as H5Config);
  }
  
  // 验证图片数据
  static validateImageData(imageData: ChannelImageData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
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
  static validateChannelName(channel: string): boolean {
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
  static readonly config = {
    loadConfig: async () => {
      const { ConfigService } = await import('./config.service');
      return ConfigService.loadConfig();
    }
  };
  
  static readonly theme = {
    getInstance: async () => {
      const { ThemeService } = await import('./theme.service');
      return ThemeService.getInstance();
    }
  };
  
  static readonly channelImage = {
    clearExpiredChannelImages: async () => {
      const { ChannelImageService } = await import('./channel-image.service');
      return ChannelImageService.clearExpiredChannelImages();
    },
    getStorageUsage: async () => {
      const { ChannelImageService } = await import('./channel-image.service');
      return ChannelImageService.getStorageUsage();
    }
  };
  
  static readonly validation = {
    validateH5Config: async (config: any) => {
      const { ValidationService } = await import('./validation.service');
      return ValidationService.validateH5Config(config);
    }
  };
  
  static async initialize(): Promise<void> {
    // 初始化所有服务
    await Promise.all([
      this.config.loadConfig(),
      this.theme.getInstance(),
      this.channelImage.clearExpiredChannelImages()
    ]);
    }
  
  static async getSystemStatus(): Promise<{
    configLoaded: boolean;
    theme: string;
    storageUsage: { used: number; max: number; percentage: number };
  }> {
    const [config, themeInstance, storageUsage] = await Promise.all([
      this.config.loadConfig(),
      this.theme.getInstance(),
      this.channelImage.getStorageUsage()
    ]);
    
    const theme = await themeInstance.getCurrentTheme();
      
      return {
      configLoaded: !!config,
        theme,
        storageUsage
      };
  }
} 