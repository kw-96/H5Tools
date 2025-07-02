import { ImageInfo } from '../types';
export declare class Utils {
    static delay(ms: number): Promise<void>;
    static extractUint8Array(imageData: ImageInfo | Uint8Array | null): Uint8Array | null;
    static hexToRgb(hex: string): {
        r: number;
        g: number;
        b: number;
    };
    static calculateSliceStrategy(width: number, height: number, maxSize: number): {
        needsSlicing: boolean;
        slices: never[];
        totalWidth?: undefined;
        totalHeight?: undefined;
        sliceWidth?: undefined;
        sliceHeight?: undefined;
        rows?: undefined;
        cols?: undefined;
    } | {
        needsSlicing: boolean;
        slices: {
            x: number;
            y: number;
            width: number;
            height: number;
            row: number;
            col: number;
        }[];
        totalWidth: number;
        totalHeight: number;
        sliceWidth: number;
        sliceHeight: number;
        rows: number;
        cols: number;
    };
    static getPrizePosition(index: number): {
        row: number;
        col: number;
    };
    static safeNumber(value: unknown, defaultValue?: number): number;
    static safeString(value: unknown, defaultValue?: string): string;
    static generateId(): string;
    static deepClone<T>(obj: T): T;
}
export declare class ImageUtils {
    static isValidImageType(type: string): boolean;
    static getImageExtension(type: string): string;
    static calculateScale(originalWidth: number, originalHeight: number, targetWidth: number, targetHeight: number, scaleMode?: 'fit' | 'fill'): {
        scale: number;
        width: number;
        height: number;
    };
    static isOversized(width: number, height: number, maxSize?: number): boolean;
    static calculateSliceStrategy(width: number, height: number, maxSize?: number): {
        direction: "horizontal" | "vertical" | "both" | "none";
        sliceWidth: number;
        sliceHeight: number;
        slicesCount: number;
        description: string;
        cols: number;
        rows: number;
        totalSlices: number;
    };
}
export declare class ColorUtilsBase {
    static hexToRgb(hex: string): {
        r: number;
        g: number;
        b: number;
    } | null;
    static rgbToHex(r: number, g: number, b: number): string;
    static getContrastColor(hex: string): string;
    static adjustBrightness(hex: string, percent: number): string;
}
export declare class FileUtils {
    static readFileAsArrayBuffer(file: File): Promise<ArrayBuffer>;
    static readFileAsDataURL(file: File): Promise<string>;
    static formatFileSize(bytes: number): string;
    static validateFileSize(file: File, maxSizeMB: number): boolean;
}
export declare class ValidationUtils {
    static validateRequired(value: unknown, fieldName: string): string | null;
    static validateNumberRange(value: number, min: number, max: number, fieldName: string): string | null;
    static validateStringLength(value: string, minLength: number, maxLength: number, fieldName: string): string | null;
    static validateColor(color: string): boolean;
    static validateUrl(url: string): boolean;
    static isValidImageInfo(imageInfo: ImageInfo): boolean;
    static isValidChannelType(channelType: string): boolean;
}
