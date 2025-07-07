import { H5Config, ImageInfo, ModuleData, NineGridContent, ActivityContentData, SignInContent, CollectCardsContent, CarouselContent, VerticalCarouselContent } from '../types';
export declare function createHeaderModule(headerImage: ImageInfo | null, titleUpload: ImageInfo | null): Promise<FrameNode | null>;
export declare function createGameInfoModule(config: H5Config): Promise<FrameNode>;
export declare function createCustomModule(module: ModuleData, mainContainer?: FrameNode): Promise<FrameNode>;
export declare function createRulesModule(config: H5Config): Promise<FrameNode>;
export declare function createFooterModule(config: H5Config): Promise<FrameNode | null>;
export declare class NineGridModuleBuilder {
    private frame;
    private content;
    private mainContainer;
    private readonly CELL_SIZE;
    private readonly CELL_SPACING;
    private currentY;
    constructor(content: NineGridContent, mainContainer?: FrameNode);
    build(): Promise<FrameNode>;
    private addTitle;
    private addNineGrid;
    private createGridCell;
    private createDrawButton;
    private addDefaultButtonStyle;
    private createPrizeCell;
    private adjustFrameHeight;
}
export declare class CarouselModuleBuilder {
    private frame;
    private content;
    private readonly CAROUSEL_AREA_HEIGHT;
    private readonly CAROUSEL_BG_WIDTH;
    private readonly CAROUSEL_BG_HEIGHT;
    private readonly CAROUSEL_IMAGE_WIDTH;
    private readonly CAROUSEL_IMAGE_HEIGHT;
    private readonly BUTTON_HEIGHT;
    constructor(frame: FrameNode, content: CarouselContent);
    build(): Promise<void>;
    private setupFrameLayout;
    private addTitleContainer;
    private addCarouselPreview;
    private addCarouselArea;
    private addCarouselButtons;
}
export declare class ActivityContentBuilder {
    private frame;
    private content;
    constructor(frame: FrameNode, content: ActivityContentData);
    build(): Promise<void>;
    private setupAutoLayout;
    private addMainTitle;
    private addSubTitle;
    private addTextContent;
    private addImage;
    private adjustFrameHeight;
}
export declare class SignInModuleBuilder {
    private frame;
    private content;
    constructor(frame: FrameNode, content: SignInContent);
    build(): Promise<void>;
    private setupBackground;
    private addTitle;
    private addDefaultTitle;
    private addSignInDays;
    private createDayItem;
    private createDayIcon;
    private addSignInButton;
    private addDefaultButton;
}
export declare class CollectCardsModuleBuilder {
    private frame;
    private content;
    constructor(frame: FrameNode, content: CollectCardsContent);
    build(): Promise<void>;
    private createCardItem;
}
export declare class VerticalCarouselModuleBuilder {
    private frame;
    private content;
    private readonly TITLE_HEIGHT;
    private readonly CAROUSEL_AREA_HEIGHT;
    private readonly MAIN_IMAGE_WIDTH;
    private readonly MAIN_IMAGE_HEIGHT;
    private readonly SIDE_IMAGE_WIDTH;
    private readonly SIDE_IMAGE_HEIGHT;
    private readonly IMAGE_SPACING;
    private readonly CAROUSEL_BUTTON_HEIGHT;
    constructor(frame: FrameNode, content: VerticalCarouselContent);
    build(): Promise<void>;
    private setupFrameLayout;
    private addTitleContainer;
    private addCarouselPreview;
    private addCarouselLayout;
    private addCarouselButtons;
}
