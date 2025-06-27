var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { StorageService } from './storage.service';
// 渠道图片服务
export class ChannelImageService {
    // 保存渠道图片
    static saveChannelImage(channel, imageType, imageData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 加载现有数据
                const allImages = yield this.loadAllChannelImages();
                // 更新数据
                if (!allImages[channel]) {
                    allImages[channel] = {};
                }
                allImages[channel][imageType] = Object.assign(Object.assign({}, imageData), { timestamp: Date.now() });
                // 检查存储大小
                const storageSize = this.calculateStorageSize(allImages);
                if (storageSize > this.MAX_STORAGE_SIZE) {
                    yield this.clearExpiredChannelImages();
                }
                // 保存数据
                const jsonData = JSON.stringify(allImages);
                this.storage.setItem(this.STORAGE_KEY, jsonData);
            }
            catch (error) {
                console.error('保存渠道图片失败:', error);
                throw new Error('保存渠道图片失败');
            }
        });
    }
    // 加载所有渠道图片
    static loadAllChannelImages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const jsonData = this.storage.getItem(this.STORAGE_KEY);
                if (!jsonData)
                    return {};
                return JSON.parse(jsonData);
            }
            catch (error) {
                console.error('加载渠道图片失败:', error);
                return {};
            }
        });
    }
    // 加载指定渠道的图片
    static loadChannelImages(channel) {
        return __awaiter(this, void 0, void 0, function* () {
            const allImages = yield this.loadAllChannelImages();
            return allImages[channel] || {};
        });
    }
    // 删除渠道图片
    static deleteChannelImage(channel, imageType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allImages = yield this.loadAllChannelImages();
                if (allImages[channel] && allImages[channel][imageType]) {
                    delete allImages[channel][imageType];
                    // 如果渠道没有图片了，删除渠道
                    if (Object.keys(allImages[channel]).length === 0) {
                        delete allImages[channel];
                    }
                    const jsonData = JSON.stringify(allImages);
                    this.storage.setItem(this.STORAGE_KEY, jsonData);
                }
            }
            catch (error) {
                console.error('删除渠道图片失败:', error);
            }
        });
    }
    // 清除所有渠道图片
    static clearAllChannelImages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.storage.removeItem(this.STORAGE_KEY);
            }
            catch (error) {
                console.error('清除所有渠道图片失败:', error);
            }
        });
    }
    // 清除过期的渠道图片
    static clearExpiredChannelImages() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allImages = yield this.loadAllChannelImages();
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
            }
            catch (error) {
                console.error('清除过期渠道图片失败:', error);
            }
        });
    }
    // 计算存储大小
    static calculateStorageSize(data) {
        return new Blob([JSON.stringify(data)]).size;
    }
    // 获取存储使用情况
    static getStorageUsage() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const allImages = yield this.loadAllChannelImages();
                const used = this.calculateStorageSize(allImages);
                const percentage = (used / this.MAX_STORAGE_SIZE) * 100;
                return {
                    used,
                    max: this.MAX_STORAGE_SIZE,
                    percentage
                };
            }
            catch (error) {
                console.error('获取存储使用情况失败:', error);
                return {
                    used: 0,
                    max: this.MAX_STORAGE_SIZE,
                    percentage: 0
                };
            }
        });
    }
}
ChannelImageService.STORAGE_KEY = 'h5-tools-channel-images';
ChannelImageService.MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
ChannelImageService.storage = StorageService.getInstance();
//# sourceMappingURL=channel-image.service.js.map