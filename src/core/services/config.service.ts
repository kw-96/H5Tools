import { H5Config } from '../types';
import { StorageService } from './storage.service';

// 配置管理服务
export class ConfigService {
  private static readonly STORAGE_KEY = 'h5-tools-config';
  private static storage = StorageService.getInstance();
  
  // 保存配置到存储
  static async saveConfig(config: H5Config): Promise<void> {
    try {
      const configData = JSON.stringify(config);
      this.storage.setItem(this.STORAGE_KEY, configData);
    } catch (error) {
      console.error('保存配置失败:', error);
      throw new Error('保存配置失败');
    }
  }
  
  // 从存储加载配置
  static async loadConfig(): Promise<H5Config | null> {
    try {
      const configData = this.storage.getItem(this.STORAGE_KEY);
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
      this.storage.removeItem(this.STORAGE_KEY);
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