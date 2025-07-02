import { H5Config, ChannelImageData } from '../types';
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
