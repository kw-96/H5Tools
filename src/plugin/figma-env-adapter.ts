// Figma环境适配器
// 为核心库提供必要的浏览器API兼容层

/// <reference types="@figma/plugin-typings" />

// 提供localStorage兼容层
const createStorageAdapter = () => {
  return {
    getItem: async (key: string) => {
      try {
        return await figma.clientStorage.getAsync(key);
      } catch {
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        await figma.clientStorage.setAsync(key, value);
      } catch (error) {
        console.error('Storage error:', error);
      }
    },
    removeItem: async (key: string) => {
      try {
        await figma.clientStorage.setAsync(key, undefined);
      } catch (error) {
        console.error('Storage error:', error);
      }
    }
  };
};

// 提供File API兼容层
class FigmaFile {
  constructor(
    public data: Uint8Array,
    public name: string,
    public type: string = 'application/octet-stream'
  ) {}

  get size() {
    return this.data.length;
  }
}

// 提供FileReader兼容层
class FigmaFileReader {
  result: string | ArrayBuffer | null = null;
  error: Error | null = null;
  onload: ((event: { target: { result: string | ArrayBuffer | null } }) => void) | null = null;
  onerror: ((event: { target: { error: Error | null } }) => void) | null = null;

  readAsDataURL(file: FigmaFile) {
    try {
      // 简单的base64编码
      const base64 = btoa(String.fromCharCode(...file.data));
      this.result = `data:${file.type};base64,${base64}`;
      
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    } catch (error) {
      this.error = error as Error;
      if (this.onerror) {
        this.onerror({ target: { error: this.error } });
      }
    }
  }

  readAsArrayBuffer(file: FigmaFile) {
    try {
      this.result = file.data.buffer;
      if (this.onload) {
        this.onload({ target: { result: this.result } });
      }
    } catch (error) {
      this.error = error as Error;
      if (this.onerror) {
        this.onerror({ target: { error: this.error } });
      }
    }
  }
}

// 提供URL兼容层
const createURL = (data: Uint8Array, mimeType: string = 'application/octet-stream') => {
  // 在Figma环境中，我们不能创建真正的URL，但可以返回一个标识符
  // 包含类型信息以便调试
  return `figma-blob:${mimeType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// 提供atob兼容层
const figmaAtob = (str: string): string => {
  try {
    // 简单的base64解码实现
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let result = '';
    let i = 0;
    
    str = str.replace(/[^A-Za-z0-9+/]/g, '');
    
    while (i < str.length) {
      const encoded1 = chars.indexOf(str.charAt(i++));
      const encoded2 = chars.indexOf(str.charAt(i++));
      const encoded3 = chars.indexOf(str.charAt(i++));
      const encoded4 = chars.indexOf(str.charAt(i++));
      
      const bitmap = (encoded1 << 18) | (encoded2 << 12) | (encoded3 << 6) | encoded4;
      
      result += String.fromCharCode((bitmap >> 16) & 255);
      if (encoded3 !== 64) result += String.fromCharCode((bitmap >> 8) & 255);
      if (encoded4 !== 64) result += String.fromCharCode(bitmap & 255);
    }
    
    return result;
  } catch {
    return '';
  }
};

// 导出适配器
export const FigmaEnvAdapter = {
  storage: createStorageAdapter(),
  File: FigmaFile,
  FileReader: FigmaFileReader,
  URL: { createObjectURL: createURL },
  atob: figmaAtob,
  
  // 初始化全局适配器
  init() {
    // 在Figma环境中，我们不能修改全局对象
    // 但可以通过模块导出提供这些API
    console.log('Figma环境适配器已初始化');
  }
}; 