import { ChannelImages, ChannelImageData } from '../types';
export declare class ChannelImageService {
    private static readonly STORAGE_KEY;
    private static readonly MAX_STORAGE_SIZE;
    private static storage;
    static saveChannelImage(channel: string, imageType: string, imageData: ChannelImageData): Promise<void>;
    static loadAllChannelImages(): Promise<ChannelImages>;
    static loadChannelImages(channel: string): Promise<ChannelImages[string]>;
    static deleteChannelImage(channel: string, imageType: string): Promise<void>;
    static clearAllChannelImages(): Promise<void>;
    static clearExpiredChannelImages(): Promise<void>;
    private static calculateStorageSize;
    static getStorageUsage(): Promise<{
        used: number;
        max: number;
        percentage: number;
    }>;
}
