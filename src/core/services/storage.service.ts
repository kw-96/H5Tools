// 存储服务
export class StorageService {
  private static instance: StorageService;
  private storage: Storage | null;

  private constructor() {
    this.storage = typeof window !== 'undefined' ? window.localStorage : null;
  }

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  setItem(key: string, value: string): void {
    if (this.storage) {
      this.storage.setItem(key, value);
    }
  }

  getItem(key: string): string | null {
    if (this.storage) {
      return this.storage.getItem(key);
    }
    return null;
  }

  removeItem(key: string): void {
    if (this.storage) {
      this.storage.removeItem(key);
    }
  }

  clear(): void {
    if (this.storage) {
      this.storage.clear();
    }
  }

  keys(): string[] {
    if (this.storage) {
      return Object.keys(this.storage);
    }
    return [];
  }
} 