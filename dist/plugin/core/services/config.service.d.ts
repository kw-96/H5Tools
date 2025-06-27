import { H5Config } from '../types';
export declare class ConfigService {
    private static readonly STORAGE_KEY;
    private static storage;
    static saveConfig(config: H5Config): Promise<void>;
    static loadConfig(): Promise<H5Config | null>;
    static clearConfig(): Promise<void>;
    static validateConfig(config: H5Config): {
        isValid: boolean;
        errors: string[];
    };
    static createDefaultConfig(): H5Config;
}
