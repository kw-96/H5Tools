export declare const CONSTANTS: {
    readonly H5_WIDTH: 1080;
    readonly MODULE_WIDTH: 950;
    readonly PADDING: 0;
    readonly GRID_SIZE: 3;
    readonly DEFAULT_SPACING: 20;
};
export interface ImageInfo {
    data: Uint8Array;
    width: number;
    height: number;
    name: string;
    type: string;
    fileSize?: number;
    format?: string;
}
export declare enum ModuleType {
    HEADER = "header",
    GAME_INFO = "gameInfo",
    FOOTER = "footer",
    ACTIVITY_CONTENT = "activityContent",
    SIGN_IN = "signIn",
    COLLECT_CARDS = "collectCards",
    NINE_GRID = "nineGrid",
    CAROUSEL = "carousel",
    VERTICAL_CAROUSEL = "verticalCarousel",
    RULES = "rules",
    CUSTOM = "custom"
}
export interface ModuleData {
    id: string;
    title: string;
    type: string;
    content: Record<string, unknown>;
}
export interface Module {
    id: string;
    type: ModuleType;
    title: string;
    content: ModuleContent;
}
export type ModuleContent = ActivityContentData | SignInContent | CollectCardsContent | NineGridContent | CarouselContent | VerticalCarouselContent;
export interface ActivityContentData {
    mainTitle: string;
    mainTitleBg: ImageInfo | null;
    subTitle: string;
    subTitleBg: ImageInfo | null;
    text: string;
    image: Uint8Array | ImageInfo | null;
}
export interface SignInContent {
    title: string;
    titleImage: ImageInfo | null;
    bgImage: ImageInfo | null;
    daysCount: number;
    dayIcon: ImageInfo | null;
    signButton: ImageInfo | null;
}
export interface CollectCardsContent {
    title: string;
    titleImage: ImageInfo | null;
    bgImage: ImageInfo | null;
    cardsCount: number;
    cardStyle: 'style1' | 'style2' | 'style3';
    cardBg: Uint8Array | null;
    combineButton: Uint8Array | null;
}
export interface NineGridContent {
    mainTitle: string;
    titleBgImage: ImageInfo | null;
    gridBgImage: ImageInfo | null;
    drawButtonImage: ImageInfo | null;
    prizeBgImage: ImageInfo | null;
    prizes: PrizeItem[];
}
export interface CarouselContent {
    title: string;
    titleBackground: ImageInfo | null;
    carouselImage: ImageInfo | null;
    carouselBackground: ImageInfo | null;
}
export interface VerticalCarouselContent {
    title: string;
    titleBackground: ImageInfo | null;
    carouselImages: [ImageInfo | null, ImageInfo | null, ImageInfo | null];
}
export interface PrizeItem {
    image: Uint8Array | ImageInfo | null;
    name: string;
}
export interface SliceStrategy {
    direction: 'horizontal' | 'vertical' | 'both' | 'none';
    sliceWidth: number;
    sliceHeight: number;
    slicesCount: number;
    description: string;
}
export interface SliceData {
    bytes: ArrayBuffer;
    width: number;
    height: number;
    x: number;
    y: number;
}
export interface ChannelImageData {
    data: number[] | string;
    width: number;
    height: number;
    name: string;
    type: string;
    size: number;
    timestamp: number;
}
export interface ChannelImages {
    [channel: string]: {
        [imageType: string]: ChannelImageData;
    };
}
export type PluginMessageType = 'create-prototype' | 'save-config' | 'load-config' | 'close-plugin' | 'reset-complete' | 'ping' | 'slice-image-response' | 'generate' | 'channel-generate' | 'channel-image-upload' | 'storage-set' | 'storage-get' | 'storage-delete' | 'ui-loaded' | 'ui-ready';
export interface BasePluginMessage {
    type: PluginMessageType;
}
export interface CreatePrototypeMessage extends BasePluginMessage {
    type: 'create-prototype' | 'generate';
    config: H5Config;
}
export interface ConfigMessage extends BasePluginMessage {
    type: 'save-config' | 'load-config';
    config?: H5Config;
}
export interface ChannelImageMessage extends BasePluginMessage {
    type: 'channel-image-upload';
    channel: string;
    imageType: string;
    imageData: ChannelImageData;
}
export interface ChannelGenerateMessage {
    type: 'channel-generate';
    channel: string;
    images?: {
        eggBreaking?: ChannelImageData;
        footerStyle?: ChannelImageData;
    };
}
export interface SimpleMessage extends BasePluginMessage {
    type: 'close-plugin' | 'reset-complete' | 'ping' | 'slice-image-response';
}
export type StorageMessage = {
    type: 'storage-set' | 'storage-get' | 'storage-delete';
    key: string;
    value?: unknown;
    _messageId?: string;
};
export type PluginMessage = {
    type: 'create-prototype' | 'generate' | 'save-config' | 'load-config' | 'channel-image-upload' | 'channel-generate' | 'close-plugin' | 'reset-complete' | 'ping' | 'slice-image-response' | 'storage-set' | 'storage-get' | 'storage-delete' | 'ui-loaded' | 'ui-ready';
    config?: H5Config;
    message?: string;
    data?: Record<string, unknown>;
    key?: string;
    value?: unknown;
    _messageId?: string;
};
export interface H5Config {
    pageTitle: string;
    pageBgColor: string;
    pageBgImage: ImageInfo | null;
    headerImage: ImageInfo | null;
    titleUpload: ImageInfo | null;
    gameIcon: ImageInfo | null;
    gameName: string;
    gameDesc: string;
    gameTextColor: string;
    buttonVersion: string;
    iconButtonText: string;
    iconButtonTextColor: string;
    iconButtonBg: ImageInfo | null;
    singleButtonText: string;
    singleButtonTextColor: string;
    singleButtonBg: ImageInfo | null;
    leftButtonText: string;
    leftButtonTextColor: string;
    leftButtonBg: ImageInfo | null;
    rightButtonText: string;
    rightButtonTextColor: string;
    rightButtonBg: ImageInfo | null;
    buttonSpacing: number;
    modules: ModuleData[];
    rulesTitle: string;
    rulesBgImage: ImageInfo | null;
    rulesContent: string;
    footerLogo: ImageInfo | null;
    footerBg: ImageInfo | null;
    canvasWidth: number;
    canvasHeight: number;
    title?: string;
    channelType?: ChannelType;
    channelConfig?: ChannelConfig;
}
export interface ChannelConfig {
    name: string;
    maxWidth: number;
    maxHeight: number;
    aspectRatio: number;
    supportedFormats: string[];
    maxFileSize: number;
    requirements: {
        minWidth: number;
        minHeight: number;
        preferredWidth: number;
        preferredHeight: number;
    };
}
export interface ActivityRulesContent {
    rulesTitle: string;
    rulesBgImage: ImageInfo | null;
    rulesContent: string;
}
export interface NineGridConfig {
    name?: string;
    totalWidth: number;
    totalHeight: number;
    gap: number;
    backgroundColor?: RGB;
    images?: ImageInfo[];
    cellConfig?: Record<string, unknown>;
}
export interface BatchProcessConfig {
    images: ImageInfo[];
    operations: Array<{
        type: string;
        params: Record<string, unknown>;
    }>;
}
export declare enum ChannelType {
    OPPO = "oppo",
    VIVO = "vivo",
    HUAWEI = "huawei",
    XIAOMI = "xiaomi"
}
export interface ChannelAdapterConfig {
    channelType: ChannelType;
    targetWidth: number;
    targetHeight: number;
    quality: number;
    format: 'jpg' | 'png' | 'webp';
    enableOptimization: boolean;
    compressionLevel: number;
    customSettings: Record<string, unknown>;
}
