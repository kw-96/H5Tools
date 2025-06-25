export declare class FeatherMaskUtils {
    /**
     * 为节点创建羽化遮罩效果
     * @param node 目标节点
     * @param parent 父容器（可选）
     * @returns 包含遮罩的组节点
     */
    static createFeatherMask(node: FrameNode | RectangleNode, parent?: BaseNode & ChildrenMixin): FrameNode;
    /**
     * 为节点添加羽化遮罩（简化版本）
     * @param node 目标节点
     * @returns 包含遮罩的组节点，失败时返回null
     */
    static addFeatherMaskToNode(node: FrameNode | RectangleNode): FrameNode | null;
    /**
     * 创建自定义羽化遮罩
     * @param node 目标节点
     * @param parent 父容器
     * @param blurRadius 模糊半径（可选）
     * @param maskHeight 遮罩高度（可选）
     * @param offsetY Y轴偏移（可选）
     * @returns 包含遮罩的组节点
     */
    static createCustomFeatherMask(node: FrameNode | RectangleNode, parent: BaseNode & ChildrenMixin, blurRadius?: number, maskHeight?: number, offsetY?: number): FrameNode;
    /**
     * 为节点添加简单羽化遮罩（直接修改节点）
     * @param node 目标节点
     */
    static addFeatherMaskToNodeSimple(node: FrameNode | RectangleNode): void;
    /**
     * 创建遮罩矩形
     * @param width 宽度
     * @param height 高度
     * @returns 遮罩矩形节点
     */
    private static createMaskRectangle;
    /**
     * 创建自定义遮罩矩形
     * @param width 宽度
     * @param height 高度
     * @param offsetY Y轴偏移
     * @param blurRadius 模糊半径
     * @returns 自定义遮罩矩形节点
     */
    private static createCustomMaskRectangle;
    /**
     * 查找容器中的遮罩矩形
     * @param container 容器节点
     * @returns 遮罩矩形节点或null
     */
    static findMaskRectangle(container: FrameNode): RectangleNode | null;
    /**
     * 移除节点的羽化遮罩
     * @param node 包含遮罩的节点
     * @returns 是否成功移除
     */
    static removeFeatherMask(node: FrameNode): boolean;
    /**
     * 更新羽化遮罩的强度
     * @param node 包含遮罩的节点
     * @param intensity 强度值（0-1）
     * @returns 是否成功更新
     */
    static updateFeatherIntensity(node: FrameNode, intensity: number): boolean;
}
//# sourceMappingURL=feather-mask-utils.d.ts.map