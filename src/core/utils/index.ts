// 渠道美术-H5延展工具 - 核心工具函数
// 这个文件包含所有的工具函数，将作为独立库发布到GitHub

import { ImageInfo } from '../types';

// ==================== 基础工具类 ====================

export class Utils {
  // 延迟函数，返回一个Promise，在指定的毫秒数后resolve
  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 从ImageInfo或Uint8Array中提取Uint8Array数据
  static extractUint8Array(imageData: ImageInfo | Uint8Array | null): Uint8Array | null {
    if (!imageData) return null;
    
    // 如果已经是Uint8Array，直接返回
    if (imageData instanceof Uint8Array) {
      return imageData;
    }
    
    // 如果是对象且包含data属性，返回data
    if (typeof imageData === 'object' && 'data' in imageData) {
      return imageData.data;
    }
    
    // 如果都不符合，返回null
    return null;
  }

  // 十六进制颜色转RGB
  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : { r: 0, g: 0, b: 0 };
  }

  // 计算图片切片策略
  static calculateSliceStrategy(width: number, height: number, maxSize: number) {
    const totalPixels = width * height;
    const maxPixels = maxSize * maxSize;
    
    if (totalPixels <= maxPixels) {
      return { needsSlicing: false, slices: [] };
    }
    
    // 计算需要的切片数量
    const ratio = Math.ceil(Math.sqrt(totalPixels / maxPixels));
    const sliceWidth = Math.ceil(width / ratio);
    const sliceHeight = Math.ceil(height / ratio);
    
    const slices = [];
    for (let row = 0; row < ratio; row++) {
      for (let col = 0; col < ratio; col++) {
        const x = col * sliceWidth;
        const y = row * sliceHeight;
        const w = Math.min(sliceWidth, width - x);
        const h = Math.min(sliceHeight, height - y);
        
        if (w > 0 && h > 0) {
          slices.push({ x, y, width: w, height: h, row, col });
        }
      }
    }
    
    return {
      needsSlicing: true,
      slices,
      totalWidth: width,
      totalHeight: height,
      sliceWidth,
      sliceHeight,
      rows: ratio,
      cols: ratio
    };
  }

  // 获取奖品位置（九宫格）
  static getPrizePosition(index: number): { row: number; col: number } {
    // 九宫格位置映射：0-7对应外围8个位置，中心位置(1,1)是抽奖按钮
    const positions = [
      { row: 0, col: 0 }, // 左上
      { row: 0, col: 1 }, // 上中
      { row: 0, col: 2 }, // 右上
      { row: 1, col: 2 }, // 右中
      { row: 2, col: 2 }, // 右下
      { row: 2, col: 1 }, // 下中
      { row: 2, col: 0 }, // 左下
      { row: 1, col: 0 }  // 左中
    ];
    
    return positions[index] || { row: 0, col: 0 };
  }

  // 安全的数值转换
  static safeNumber(value: unknown, defaultValue: number = 0): number {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  }

  // 安全的字符串转换
  static safeString(value: unknown, defaultValue: string = ''): string {
    return value != null ? String(value) : defaultValue;
  }

  // 生成唯一ID
  static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 深拷贝对象
  static deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as T;
    if (obj instanceof Array) return obj.map(item => Utils.deepClone(item)) as T;
    if (typeof obj === 'object') {
      const clonedObj = {} as Record<string, unknown>;
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          clonedObj[key] = Utils.deepClone((obj as Record<string, unknown>)[key]);
        }
      }
      return clonedObj as T;
    }
    return obj;
  }
}

// ==================== 图片处理工具 ====================

export class ImageUtils {
  // 验证图片格式
  static isValidImageType(type: string): boolean {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
    return validTypes.indexOf(type.toLowerCase()) !== -1;
  }

  // 获取图片文件扩展名
  static getImageExtension(type: string): string {
    const extensions: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/gif': 'gif',
      'image/webp': 'webp'
    };
    return extensions[type.toLowerCase()] || 'png';
  }

  // 计算图片缩放比例
  static calculateScale(
    originalWidth: number, 
    originalHeight: number, 
    targetWidth: number, 
    targetHeight: number,
    scaleMode: 'fit' | 'fill' = 'fit'
  ): { scale: number; width: number; height: number } {
    const scaleX = targetWidth / originalWidth;
    const scaleY = targetHeight / originalHeight;
    
    let scale: number;
    if (scaleMode === 'fit') {
      scale = Math.min(scaleX, scaleY);
    } else {
      scale = Math.max(scaleX, scaleY);
    }
    
    return {
      scale,
      width: originalWidth * scale,
      height: originalHeight * scale
    };
  }

  // 检查图片是否超过Figma限制
  static isOversized(width: number, height: number, maxSize: number = 4096): boolean {
    return width > maxSize || height > maxSize;
  }

  // 计算切片策略（用于超大图片）- 智能切片策略
  static calculateSliceStrategy(width: number, height: number, maxSize: number = 4096) {
    const strategy = {
      direction: 'none' as 'horizontal' | 'vertical' | 'both' | 'none',
      sliceWidth: width,
      sliceHeight: height,
      slicesCount: 1,
      description: '',
      cols: 1,
      rows: 1,
      totalSlices: 1
    };

    const widthExceeds = width > maxSize;
    const heightExceeds = height > maxSize;

    if (!widthExceeds && !heightExceeds) {
      // 不需要切割
      strategy.description = '图片尺寸正常，无需切割';
      return strategy;
    }

    if (widthExceeds && !heightExceeds) {
      // 只有宽度超限：垂直切割（保持高度）
      strategy.direction = 'vertical';
      strategy.sliceWidth = Math.floor(maxSize * 0.9); // 留10%安全边距
      strategy.sliceHeight = height;
      strategy.cols = Math.ceil(width / strategy.sliceWidth);
      strategy.rows = 1;
      strategy.slicesCount = strategy.cols;
      strategy.totalSlices = strategy.cols;
      strategy.description = `宽度超限，垂直切割为${strategy.slicesCount}片，每片${strategy.sliceWidth}×${height}`;
    } else if (!widthExceeds && heightExceeds) {
      // 只有高度超限：水平切割（保持宽度）
      strategy.direction = 'horizontal';
      strategy.sliceWidth = width;
      strategy.sliceHeight = Math.floor(maxSize * 0.9); // 留10%安全边距
      strategy.cols = 1;
      strategy.rows = Math.ceil(height / strategy.sliceHeight);
      strategy.slicesCount = strategy.rows;
      strategy.totalSlices = strategy.rows;
      strategy.description = `高度超限，水平切割为${strategy.slicesCount}片，每片${width}×${strategy.sliceHeight}`;
    } else {
      // 宽度和高度都超限：网格切割
      strategy.direction = 'both';
      strategy.sliceWidth = Math.floor(maxSize * 0.9);
      strategy.sliceHeight = Math.floor(maxSize * 0.9);
      strategy.cols = Math.ceil(width / strategy.sliceWidth);
      strategy.rows = Math.ceil(height / strategy.sliceHeight);
      strategy.slicesCount = strategy.cols * strategy.rows;
      strategy.totalSlices = strategy.cols * strategy.rows;
      strategy.description = `宽高都超限，网格切割为${strategy.cols}×${strategy.rows}=${strategy.slicesCount}片`;
    }

    return strategy;
  }
}

// ==================== 颜色处理工具 ====================
// 注意：Figma专用的ColorUtils已移至builders/figma-utils.ts
// 这里保留基础颜色工具，用于非Figma环境

export class ColorUtilsBase {
  // 十六进制转RGB（返回0-255范围）
  static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // RGB转十六进制
  static rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // 获取对比色
  static getContrastColor(hex: string): string {
    const rgb = ColorUtilsBase.hexToRgb(hex);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  }

  // 颜色亮度调整
  static adjustBrightness(hex: string, percent: number): string {
    const rgb = ColorUtilsBase.hexToRgb(hex);
    if (!rgb) return hex;
    
    const adjust = (color: number) => {
      const adjusted = Math.round(color * (100 + percent) / 100);
      return Math.max(0, Math.min(255, adjusted));
    };
    
    return ColorUtilsBase.rgbToHex(
      adjust(rgb.r),
      adjust(rgb.g),
      adjust(rgb.b)
    );
  }
}

// ==================== 文件处理工具 ====================

export class FileUtils {
  // 读取文件为ArrayBuffer
  static readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
  }

  // 读取文件为DataURL
  static readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // 格式化文件大小
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // 验证文件大小
  static validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}

// ==================== 验证工具 ====================

export class ValidationUtils {
  // 验证必填字段
  static validateRequired(value: unknown, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
      return `${fieldName}不能为空`;
    }
    return null;
  }

  // 验证数字范围
  static validateNumberRange(value: number, min: number, max: number, fieldName: string): string | null {
    if (value < min || value > max) {
      return `${fieldName}必须在${min}到${max}之间`;
    }
    return null;
  }

  // 验证字符串长度
  static validateStringLength(value: string, minLength: number, maxLength: number, fieldName: string): string | null {
    if (value.length < minLength || value.length > maxLength) {
      return `${fieldName}长度必须在${minLength}到${maxLength}个字符之间`;
    }
    return null;
  }

  // 验证颜色格式
  static validateColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  }

  // 验证URL格式
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // 验证图片信息是否有效
  static isValidImageInfo(imageInfo: ImageInfo): boolean {
    return !!(
      imageInfo &&
      imageInfo.name &&
      imageInfo.width > 0 &&
      imageInfo.height > 0 &&
      imageInfo.data &&
      imageInfo.data.length > 0
    );
  }

  // 验证渠道类型是否有效
  static isValidChannelType(channelType: string): boolean {
    const validChannels = ['wechat', 'weibo', 'douyin', 'xiaohongshu', 'kuaishou', 'bilibili', 'zhihu', 'custom'];
    return validChannels.includes(channelType);
  }
} 