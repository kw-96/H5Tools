import { ChannelImageData } from '../types';
/**
 * 生成渠道特定版本的H5原型
 * @param channel 渠道名称 (oppo, vivo, xiaomi等)
 */
export declare function generateChannelVersion(channel: string, images?: {
    eggBreaking?: ChannelImageData;
    footerStyle?: ChannelImageData;
}): Promise<void>;
