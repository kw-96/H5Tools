import { H5Config, BatchProcessConfig } from '../types';
export declare class AdvancedFeatures {
    /**
     * 批量处理图片
     * @param config 批处理配置
     * @returns 处理结果
     */
    static batchProcessImages(config: BatchProcessConfig): Promise<{
        success: number;
        failed: number;
        results: Array<{
            index: number;
            success: boolean;
            error?: string;
        }>;
    }>;
    /**
     * 处理单个图片
     * @param imageInfo 图片信息
     * @param operations 操作列表
     */
    private static processImage;
    /**
     * 调整图片尺寸
     * @param imageInfo 图片信息
     * @param params 参数
     */
    private static resizeImage;
    /**
     * 压缩图片
     * @param imageInfo 图片信息
     * @param params 参数
     */
    private static compressImage;
    /**
     * 添加水印
     * @param imageInfo 图片信息
     * @param params 参数
     */
    private static addWatermark;
    /**
     * 调整颜色
     * @param imageInfo 图片信息
     * @param params 参数
     */
    private static adjustColors;
    /**
     * 创建复杂布局
     * @param config H5配置
     * @param layoutType 布局类型
     * @returns 布局容器
     */
    static createComplexLayout(config: H5Config, layoutType: 'magazine' | 'card' | 'timeline' | 'masonry'): Promise<FrameNode>;
    /**
     * 创建杂志风格布局
     * @param container 容器
     * @param config 配置
     * @returns 布局容器
     */
    private static createMagazineLayout;
    /**
     * 创建卡片布局
     * @param container 容器
     * @param config 配置
     * @returns 布局容器
     */
    private static createCardLayout;
    /**
     * 创建时间线布局
     * @param container 容器
     * @param config 配置
     * @returns 布局容器
     */
    private static createTimelineLayout;
    /**
     * 创建瀑布流布局
     * @param container 容器
     * @param config 配置
     * @returns 布局容器
     */
    private static createMasonryLayout;
    /**
     * 添加英雄区域内容
     * @param container 容器
     * @param config 配置
     */
    private static addHeroContent;
    /**
     * 添加内容网格
     * @param container 容器
     * @param _config 配置（未使用）
     */
    private static addContentGrid;
    /**
     * 添加底部内容
     * @param container 容器
     * @param _config 配置（未使用）
     */
    private static addFooterContent;
}
