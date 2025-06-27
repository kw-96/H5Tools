// 存储服务
export class StorageService {
    constructor() {
        this.storage = typeof window !== 'undefined' ? window.localStorage : null;
    }
    static getInstance() {
        if (!StorageService.instance) {
            StorageService.instance = new StorageService();
        }
        return StorageService.instance;
    }
    setItem(key, value) {
        if (this.storage) {
            this.storage.setItem(key, value);
        }
    }
    getItem(key) {
        if (this.storage) {
            return this.storage.getItem(key);
        }
        return null;
    }
    removeItem(key) {
        if (this.storage) {
            this.storage.removeItem(key);
        }
    }
    clear() {
        if (this.storage) {
            this.storage.clear();
        }
    }
    keys() {
        if (this.storage) {
            return Object.keys(this.storage);
        }
        return [];
    }
}
//# sourceMappingURL=storage.service.js.map