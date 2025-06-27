import { H5Config, ChannelImageData } from '../types';

// 验证服务
export class ValidationService {
  // 验证H5配置
  static validateH5Config(config: Partial<H5Config>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 必填字段验证
    if (!config.pageTitle?.trim()) {
      errors.push('页面标题不能为空');
    }
    
    if (!config.gameName?.trim()) {
      errors.push('游戏名称不能为空');
    }
    
    // 按钮版本验证
    if (config.buttonVersion) {
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
        default:
          errors.push('无效的按钮版本');
      }
    } else {
      errors.push('请选择按钮版本');
    }
    
    // 画布尺寸验证
    if (config.canvasWidth && config.canvasWidth < 320) {
      errors.push('画布宽度不能小于320px');
    }
    
    if (config.canvasHeight && config.canvasHeight < 480) {
      errors.push('画布高度不能小于480px');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // 验证图片数据
  static validateImageData(imageData: ChannelImageData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 必填字段验证
    if (!imageData.data) {
      errors.push('图片数据不能为空');
    }
    
    if (!imageData.name?.trim()) {
      errors.push('图片名称不能为空');
    }
    
    if (!imageData.type?.trim()) {
      errors.push('图片类型不能为空');
    }
    
    // 尺寸验证
    if (!imageData.width || imageData.width <= 0) {
      errors.push('图片宽度必须大于0');
    }
    
    if (!imageData.height || imageData.height <= 0) {
      errors.push('图片高度必须大于0');
    }
    
    // 大小验证
    if (!imageData.size || imageData.size <= 0) {
      errors.push('图片大小必须大于0');
    }
    
    // 时间戳验证
    if (!imageData.timestamp || imageData.timestamp <= 0) {
      errors.push('图片时间戳无效');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // 验证渠道名称
  static validateChannelName(channel: string): boolean {
    return /^[a-zA-Z0-9_-]{2,50}$/.test(channel);
  }
} 