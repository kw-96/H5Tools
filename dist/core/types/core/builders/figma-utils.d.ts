import { ImageInfo } from '../types';
export declare class FontManager {
    private static readonly fonts;
    static loadAll(): Promise<void>;
    static loadSingle(fontName: FontName): Promise<void>;
    /**
     * 加载Inter字体系列（别名方法）
     * @returns Promise<void>
     */
    static loadInterFonts(): Promise<void>;
}
export declare class ColorUtils {
    static hexToRgb(hex: string): RGB;
    static createSolidFill(color: RGB, opacity?: number): SolidPaint;
}
export declare class NodeUtils {
    static createFrame(name: string, width: number, height: number): FrameNode;
    static createText(text: string, fontSize: number, fontWeight?: 'Regular' | 'Medium' | 'Bold'): Promise<TextNode>;
    static setupAutoLayout(frame: FrameNode, direction?: 'HORIZONTAL' | 'VERTICAL', spacing?: number, padding?: number): void;
    /**
     * 安全地将子节点添加到父节点
     * @param parent 父节点
     * @param child 子节点
     * @param operationName 操作名称，用于日志记录
     * @returns 是否成功添加
     */
    static safeAppendChild(parent: BaseNode & ChildrenMixin, child: SceneNode, operationName?: string): boolean;
    /**
     * 批量安全添加子节点
     * @param parent 父节点
     * @param children 子节点数组
     * @param operationName 操作名称
     * @returns 成功添加的节点数量
     */
    static safeBatchAppendChildren(parent: BaseNode & ChildrenMixin, children: (SceneNode | null)[], operationName?: string): number;
    /**
     * 安全地移除节点
     * @param node 要移除的节点
     * @param operationName 操作名称
     * @returns 是否成功移除
     */
    static safeRemoveNode(node: SceneNode, operationName?: string): boolean;
}
export declare class ImageNodeBuilder {
    static createImage(bytes: Uint8Array): Promise<Image | null>;
    static createLargeImage(bytes: Uint8Array, width: number, height: number, name?: string): Promise<RectangleNode | null>;
    static fillTheSelection(node: RectangleNode, bytes: Uint8Array): Promise<void>;
    static createImageFill(bytes: Uint8Array, scaleMode?: 'FILL' | 'FIT'): Promise<SolidPaint | ImagePaint>;
    static insertImage(imageData: ImageInfo | Uint8Array, name: string, defaultWidth?: number, defaultHeight?: number): Promise<RectangleNode | GroupNode | null>;
    private static handleOversizedImage;
    private static assembleSlicedImage;
    private static createPlaceholderRect;
    static setImageFill(node: FrameNode | RectangleNode, imageData: ImageInfo | Uint8Array | null, scaleMode?: 'FILL' | 'FIT'): Promise<void>;
}
export declare function createTitleContainer(title: string, bgImage: Uint8Array | ImageInfo | null, width: number, height: number, fontSize?: number, fontWeight?: 'Regular' | 'Medium' | 'Bold'): Promise<FrameNode>;
/**
 * 递归查找"游戏信息"Frame下的"按钮底图"节点并克隆
 * @param nineGridFrame 九宫格Frame节点（其parent应为自适应模块Frame）
 * @returns 克隆的按钮底图RectangleNode，找不到则返回null
 */
export declare function findAndCloneButtonImageFromGameInfo(nineGridFrame: FrameNode): Promise<RectangleNode | null>;
/**
 * 从游戏信息容器获取下载按钮的文本样式
 * @param nineGridFrame 九宫格Frame节点（其parent应为自适应模块Frame）
 * @returns 包含fontName和fills的样式对象，找不到则返回null
 */
export declare function getDownloadButtonTextStyle(nineGridFrame: FrameNode): {
    fontName: FontName;
    fills: Paint[];
} | null;
/**
 * 通用按钮容器创建函数
 * @param mainContainer 主容器
 * @param nineGridFrame 九宫格Frame（用于递归查找按钮底图和样式）
 * @param options  { name, text, x, y, width, height, textFontSize }
 * @returns 创建的按钮容器FrameNode
 */
export declare function createButtonContainer(mainContainer: FrameNode, nineGridFrame: FrameNode, options: {
    name: string;
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    textFontSize?: number;
}): Promise<FrameNode>;
