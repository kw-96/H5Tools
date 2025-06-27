import { H5Config, ChannelImages, ChannelImageData } from '../types';
export declare class ConfigService {
    private static readonly STORAGE_KEY;
    static saveConfig(config: H5Config): Promise<void>;
    static loadConfig(): Promise<H5Config | null>;
    static clearConfig(): Promise<void>;
    static validateConfig(config: H5Config): {
        isValid: boolean;
        errors: string[];
    };
    static createDefaultConfig(): H5Config;
}
export declare class ThemeService {
    private static readonly THEME_KEY;
    private static readonly THEMES;
    static saveTheme(theme: string): Promise<void>;
    static loadTheme(): Promise<string>;
    static detectSystemTheme(): 'light' | 'dark';
    static getCurrentTheme(): Promise<'light' | 'dark'>;
    private static isValidTheme;
}
export declare class ChannelImageService {
    private static readonly STORAGE_KEY;
    private static readonly MAX_STORAGE_SIZE;
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
export declare class ValidationService {
    static validateH5Config(config: Partial<H5Config>): {
        isValid: boolean;
        errors: string[];
    };
    static validateImageData(imageData: ChannelImageData): {
        isValid: boolean;
        errors: string[];
    };
    static validateChannelName(channel: string): boolean;
}
export * from './storage.service';
export * from './theme.service';
export * from './plugin-service';
export * from './config.service';
export * from './channel-image.service';
export * from './validation.service';
export declare class ServiceManager {
    static readonly config: {
        loadConfig: () => Promise<H5Config | null>;
    };
    static readonly theme: {
        getInstance: () => Promise<import("./theme.service").ThemeService>;
    };
    static readonly channelImage: {
        clearExpiredChannelImages: () => Promise<void>;
        getStorageUsage: () => Promise<{
            used: number;
            max: number;
            percentage: number;
        }>;
    };
    static readonly validation: {
        validateH5Config: (config: any) => Promise<{
            isValid: boolean;
            errors: string[];
        }>;
    };
    static initialize(): Promise<void>;
    static getSystemStatus(): Promise<{
        configLoaded: boolean;
        theme: string;
        storageUsage: {
            used: number;
            max: number;
            percentage: number;
        };
    }>;
}
