// 渠道美术-H5延展工具 - 羽化遮罩工具
import { NodeUtils } from './figma-utils';
// ==================== 羽化遮罩工具类 ====================
export class FeatherMaskUtils {
    /**
     * 为节点创建羽化遮罩效果
     * @param node 目标节点
     * @param parent 父容器（可选）
     * @returns 包含遮罩的组节点
     */
    static createFeatherMask(node, parent) {
        try {
            // 创建遮罩容器
            const maskContainer = figma.createFrame();
            maskContainer.name = `${node.name}_羽化遮罩`;
            maskContainer.resize(node.width, node.height);
            maskContainer.x = node.x;
            maskContainer.y = node.y;
            // 复制原节点
            const clonedNode = node.clone();
            clonedNode.x = 0;
            clonedNode.y = 0;
            // 创建羽化遮罩矩形
            const maskRect = this.createMaskRectangle(node.width, node.height);
            // 设置遮罩关系
            maskContainer.appendChild(clonedNode);
            maskContainer.appendChild(maskRect);
            // 应用遮罩
            clonedNode.isMask = false;
            maskRect.isMask = true;
            // 添加到父容器
            if (parent) {
                NodeUtils.safeAppendChild(parent, maskContainer, '羽化遮罩容器添加');
            }
            // 移除原节点
            if (node.parent) {
                NodeUtils.safeRemoveNode(node, '原节点移除');
            }
            return maskContainer;
        }
        catch (error) {
            console.error('创建羽化遮罩失败:', error);
            throw error;
        }
    }
    /**
     * 为节点添加羽化遮罩（简化版本）
     * @param node 目标节点
     * @returns 包含遮罩的组节点，失败时返回null
     */
    static addFeatherMaskToNode(node) {
        try {
            const parent = node.parent;
            if (!parent) {
                console.warn('节点没有父容器，无法添加羽化遮罩');
                return null;
            }
            return this.createFeatherMask(node, parent);
        }
        catch (error) {
            console.error('添加羽化遮罩失败:', error);
            return null;
        }
    }
    /**
     * 创建自定义羽化遮罩
     * @param node 目标节点
     * @param parent 父容器
     * @param blurRadius 模糊半径（可选）
     * @param maskHeight 遮罩高度（可选）
     * @param offsetY Y轴偏移（可选）
     * @returns 包含遮罩的组节点
     */
    static createCustomFeatherMask(node, parent, blurRadius, maskHeight, offsetY) {
        try {
            const actualBlurRadius = blurRadius || 20;
            const actualMaskHeight = maskHeight || node.height * 0.3;
            const actualOffsetY = offsetY || node.height - actualMaskHeight;
            // 创建遮罩容器
            const maskContainer = figma.createFrame();
            maskContainer.name = `${node.name}_自定义羽化遮罩`;
            maskContainer.resize(node.width, node.height);
            maskContainer.x = node.x;
            maskContainer.y = node.y;
            // 复制原节点
            const clonedNode = node.clone();
            clonedNode.x = 0;
            clonedNode.y = 0;
            // 创建自定义遮罩矩形
            const maskRect = this.createCustomMaskRectangle(node.width, actualMaskHeight, actualOffsetY, actualBlurRadius);
            // 设置遮罩关系
            maskContainer.appendChild(clonedNode);
            maskContainer.appendChild(maskRect);
            clonedNode.isMask = false;
            maskRect.isMask = true;
            // 添加到父容器
            NodeUtils.safeAppendChild(parent, maskContainer, '自定义羽化遮罩容器添加');
            // 移除原节点
            if (node.parent) {
                NodeUtils.safeRemoveNode(node, '原节点移除');
            }
            return maskContainer;
        }
        catch (error) {
            console.error('创建自定义羽化遮罩失败:', error);
            throw error;
        }
    }
    /**
     * 为节点添加简单羽化遮罩（直接修改节点）
     * @param node 目标节点
     */
    static addFeatherMaskToNodeSimple(node) {
        try {
            // 创建渐变填充实现羽化效果
            const gradientFill = {
                type: 'GRADIENT_LINEAR',
                gradientTransform: [
                    [1, 0, 0],
                    [0, 1, 0]
                ],
                gradientStops: [
                    { position: 0, color: { r: 1, g: 1, b: 1, a: 1 } },
                    { position: 0.7, color: { r: 1, g: 1, b: 1, a: 1 } },
                    { position: 1, color: { r: 1, g: 1, b: 1, a: 0 } }
                ]
            };
            // 创建遮罩矩形
            const maskRect = figma.createRectangle();
            maskRect.name = '羽化遮罩';
            maskRect.resize(node.width, node.height);
            maskRect.fills = [gradientFill];
            maskRect.isMask = true;
            // 添加遮罩到节点
            if (node.parent) {
                const parent = node.parent;
                parent.insertChild(parent.children.indexOf(node) + 1, maskRect);
            }
        }
        catch (error) {
            console.error('添加简单羽化遮罩失败:', error);
        }
    }
    /**
     * 创建遮罩矩形
     * @param width 宽度
     * @param height 高度
     * @returns 遮罩矩形节点
     */
    static createMaskRectangle(width, height) {
        const maskRect = figma.createRectangle();
        maskRect.name = '羽化遮罩';
        maskRect.resize(width, height);
        // 创建渐变填充
        const gradientFill = {
            type: 'GRADIENT_LINEAR',
            gradientTransform: [
                [1, 0, 0],
                [0, 1, 0]
            ],
            gradientStops: [
                { position: 0, color: { r: 1, g: 1, b: 1, a: 1 } },
                { position: 0.6, color: { r: 1, g: 1, b: 1, a: 1 } },
                { position: 1, color: { r: 1, g: 1, b: 1, a: 0 } }
            ]
        };
        maskRect.fills = [gradientFill];
        return maskRect;
    }
    /**
     * 创建自定义遮罩矩形
     * @param width 宽度
     * @param height 高度
     * @param offsetY Y轴偏移
     * @param blurRadius 模糊半径
     * @returns 自定义遮罩矩形节点
     */
    static createCustomMaskRectangle(width, height, offsetY, blurRadius) {
        const maskRect = figma.createRectangle();
        maskRect.name = '自定义羽化遮罩';
        maskRect.resize(width, height);
        maskRect.y = offsetY;
        // 计算渐变位置
        const fadeStart = Math.max(0, 1 - (blurRadius / height));
        // 创建自定义渐变填充
        const gradientFill = {
            type: 'GRADIENT_LINEAR',
            gradientTransform: [
                [0, 1, 0],
                [-1, 0, 1]
            ],
            gradientStops: [
                { position: 0, color: { r: 1, g: 1, b: 1, a: 1 } },
                { position: fadeStart, color: { r: 1, g: 1, b: 1, a: 1 } },
                { position: 1, color: { r: 1, g: 1, b: 1, a: 0 } }
            ]
        };
        maskRect.fills = [gradientFill];
        return maskRect;
    }
    /**
     * 查找容器中的遮罩矩形
     * @param container 容器节点
     * @returns 遮罩矩形节点或null
     */
    static findMaskRectangle(container) {
        const findMask = (node) => {
            if (node.type === 'RECTANGLE' && node.isMask) {
                return node;
            }
            if ('children' in node) {
                for (const child of node.children) {
                    const mask = findMask(child);
                    if (mask)
                        return mask;
                }
            }
            return null;
        };
        return findMask(container);
    }
    /**
     * 移除节点的羽化遮罩
     * @param node 包含遮罩的节点
     * @returns 是否成功移除
     */
    static removeFeatherMask(node) {
        try {
            const maskRect = this.findMaskRectangle(node);
            if (maskRect) {
                NodeUtils.safeRemoveNode(maskRect, '羽化遮罩移除');
                return true;
            }
            return false;
        }
        catch (error) {
            console.error('移除羽化遮罩失败:', error);
            return false;
        }
    }
    /**
     * 更新羽化遮罩的强度
     * @param node 包含遮罩的节点
     * @param intensity 强度值（0-1）
     * @returns 是否成功更新
     */
    static updateFeatherIntensity(node, intensity) {
        try {
            const maskRect = this.findMaskRectangle(node);
            if (!maskRect)
                return false;
            const clampedIntensity = Math.max(0, Math.min(1, intensity));
            const fadePosition = 1 - clampedIntensity * 0.4; // 调整渐变位置
            // 更新渐变填充
            const gradientFill = {
                type: 'GRADIENT_LINEAR',
                gradientTransform: [
                    [1, 0, 0],
                    [0, 1, 0]
                ],
                gradientStops: [
                    { position: 0, color: { r: 1, g: 1, b: 1, a: 1 } },
                    { position: fadePosition, color: { r: 1, g: 1, b: 1, a: 1 } },
                    { position: 1, color: { r: 1, g: 1, b: 1, a: 0 } }
                ]
            };
            maskRect.fills = [gradientFill];
            return true;
        }
        catch (error) {
            console.error('更新羽化强度失败:', error);
            return false;
        }
    }
}
//# sourceMappingURL=feather-mask-utils.js.map