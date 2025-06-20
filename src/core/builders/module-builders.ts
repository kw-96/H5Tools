// 模块构建器
// 负责构建各种H5模块

/// <reference types="@figma/plugin-typings" />

import { 
  H5Config, 
  ImageInfo, 
  Module, 
  ModuleData, 
  ModuleType, 
  ModuleContent, 
  NineGridContent,
  ActivityContentData,
  SignInContent,
  CollectCardsContent,
  CONSTANTS 
} from '../types';
import { NodeUtils, ColorUtils, ImageNodeBuilder, createTitleContainer } from './figma-utils';

// ==================== 头部模块 ====================

export async function createHeaderModule(
  headerImage: ImageInfo | null, 
  titleUpload: ImageInfo | null
): Promise<FrameNode | null> {
  // 如果只有标题图片没有头图，则跳过头图模块的创建
  if (!headerImage && titleUpload) {
    return null;
  }

  // 如果既没有头图也没有标题图片，也跳过创建
  if (!headerImage && !titleUpload) {
    return null;
  }

  // 固定尺寸为1080x1080px
  const frame = NodeUtils.createFrame("头图", 1080, 1080);
  frame.clipsContent = true; // 打开裁剪内容
  frame.fills = []; // 设置画板填充为透明
  
  // 手动定位
  frame.layoutMode = "NONE";

  let currentY = 0; // 用于垂直排列
  let headerNode: RectangleNode | null = null;
  let titleNode: RectangleNode | null = null;

  // 添加头图
  if (headerImage) {
    try {
      // 直接插入头图，不调整尺寸
      const headerNodeResult = await ImageNodeBuilder.insertImage(headerImage, "头图图片");
      headerNode = headerNodeResult && 'strokeCap' in headerNodeResult ? headerNodeResult : null;
      
      if (headerNode) {
        NodeUtils.safeAppendChild(frame, headerNode, '头图图片添加到画板');
        
        // 设置头图图片的对齐属性：水平居中、上对齐
        headerNode.constraints = { 
          horizontal: "CENTER",  // 水平居中
          vertical: "MIN"        // 上对齐（顶部对齐）
        };
        
        // 手动设置位置：水平居中、顶部对齐
        headerNode.x = (frame.width - headerNode.width) / 2;
        headerNode.y = currentY;
        
        currentY = headerNode.height; // 更新Y位置
      }
    } catch (error) {
      console.error('头图创建失败:', error);
    }
  }

  // 调整头图容器高度
  adjustHeaderFrameHeight(frame, headerNode, titleNode);

  // 1. 在完成头图模块的创建后，对头图图片节点进行添加羽化蒙版
  if (headerNode) {
    try {
      await addFeatherMaskToHeaderImage(headerNode, frame);
    } catch (error) {
      console.error('头图图片添加羽化蒙版失败:', error);
    }
  }

  // 添加标题图片
  if (titleUpload) {
    try {
      // 直接插入标题图片，不调整尺寸
      const titleNodeResult = await ImageNodeBuilder.insertImage(titleUpload, "标题图片");
      titleNode = titleNodeResult && 'strokeCap' in titleNodeResult ? titleNodeResult : null;
      
      if (titleNode) {
        NodeUtils.safeAppendChild(frame, titleNode, '标题图片添加到画板');
        
        // 设置约束条件
        titleNode.constraints = { 
          horizontal: "CENTER",  // 水平居中
          vertical: "MAX"        // 底部对齐
        };
        
        // 手动设置位置：水平居中，底部对齐
        titleNode.x = (frame.width - titleNode.width) / 2;
        titleNode.y = frame.height - titleNode.height; // 底部对齐
        
      }
    } catch (error) {
      console.error('标题图片创建失败:', error);
    }
  }

  return frame;
}

// 调整头图容器高度的辅助函数
function adjustHeaderFrameHeight(
  frame: FrameNode, 
  headerNode: RectangleNode | null, 
  titleNode: RectangleNode | null
): void {
  // 如果只有头图，没有标题图片
  if (headerNode && !titleNode) {
    // 无论头图高度大于或小于1080px，都将容器高度调整为头图高度
    frame.resize(1080, headerNode.height);
  }
  // 如果既有头图又有标题图片
  else if (headerNode && titleNode) {
    // 先将容器高度调整为头图高度
    frame.resize(1080, headerNode.height);
    
    // 重新设置标题图片位置：底部对齐调整后的容器
    titleNode.y = headerNode.height - titleNode.height; // 底部对齐头图高度的容器
    titleNode.constraints = {
      horizontal: "CENTER",
      vertical: "MAX" // 保持底部对齐
    };
  }
  // 注意：不再处理只有标题图片没有头图的情况，因为这种情况下不会创建头图模块
}

// 为头图图片添加羽化蒙版的专用函数
async function addFeatherMaskToHeaderImage(
  headerNode: RectangleNode, 
  frame: FrameNode
): Promise<void> {
  try {
    
    // 检查节点是否仍然存在且有效
    if (!headerNode || !headerNode.parent) {
      console.warn('头图节点不存在或已被删除，跳过羽化蒙版处理');
      return;
    }
    
    // 保存原始信息
    const originalX = headerNode.x;
    const originalY = headerNode.y;
    const originalConstraints = headerNode.constraints;
    const originalWidth = headerNode.width;
    const originalHeight = headerNode.height;
    
    // 1. 复制头图图片节点
    const headerNodeCopy = headerNode.clone();
    headerNodeCopy.name = "头图图片";
    
    // 2. 计算羽化蒙版参数
    const blurRadius = originalWidth * 0.1;
    const rectHeight = originalHeight;
    const adjustedRectHeight = rectHeight - blurRadius;
    const rectWidth = originalWidth + blurRadius * 2 + 25;
    
    // 3. 创建蒙版矩形
    const maskRect = figma.createRectangle();
    maskRect.name = "蒙版";
    maskRect.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    maskRect.resize(rectWidth, adjustedRectHeight);
    
    // 4. 将蒙版矩形添加到frame
    NodeUtils.safeAppendChild(frame, maskRect, '羽化蒙版矩形添加到frame');
    
    // 等待一个微任务确保节点稳定
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // 5. 将蒙版矩形创建羽化蒙版组
    let featherMaskGroup: GroupNode;
    try {
      featherMaskGroup = figma.group([maskRect], frame);
      featherMaskGroup.name = "羽化蒙版";
    } catch (groupError) {
      console.error('创建羽化蒙版组失败:', groupError);
      return;
    }
    
         // 6. 设置模糊效果给羽化蒙版组
     try {
       const blurEffect = {
         type: "LAYER_BLUR" as const,
         radius: blurRadius,
         visible: true
       };
       if (featherMaskGroup.effects !== undefined) {
         featherMaskGroup.effects = [blurEffect as Effect];
       }
     } catch (effectError) {
       console.warn('设置模糊效果失败:', effectError);
     }
    
    // 7. 设置羽化蒙版组为剪切蒙版
    try {
      if ('isMask' in featherMaskGroup) {
        featherMaskGroup.isMask = true;
      }
    } catch (maskError) {
      console.warn('设置剪切蒙版失败:', maskError);
    }
    
    // 8. 创建包含羽化蒙版组和头图节点的组，命名为头图
    let headerGroup: GroupNode;
    try {
      headerGroup = figma.group([featherMaskGroup, headerNode], frame);
      headerGroup.name = "头图";
    } catch (groupError) {
      console.error('创建头图组失败:', groupError);
      return;
    }
    
    // 9. 调整位置：基于Figma官方文档的Container Parent概念
    
    // 🎯 关键理解：
    // 1. 组内元素的坐标相对于"容器父级"（frame），不是相对于组本身
    // 2. 组会自动调整位置和大小以适应其内容
    // 3. 我们应该设置元素的绝对位置，让组自动调整
    
    // 蒙版矩形：在羽化蒙版组内，相对于frame的绝对位置
    const centerOffsetX = (originalWidth - rectWidth) / 2;
    maskRect.x = originalX + centerOffsetX; // 相对于frame的居中位置
    maskRect.y = 0; // 相对于frame，向上扩展模糊半径
    
    // 羽化蒙版组会自动调整以包围蒙版矩形，我们不需要手动设置其位置
    // featherMaskGroup.x 和 featherMaskGroup.y 会自动计算
    
    // 头图节点：保持原始位置（相对于frame）
    headerNode.x = originalX;
    headerNode.y = originalY;
    headerNode.constraints = originalConstraints;
    
    // 头图组也会自动调整以包围其所有子元素
    // headerGroup.x 和 headerGroup.y 会自动计算
    
    // 10. 删除原来的头图图片节点，将复制的头图图片节点放入头图组中
    try {
      if (headerNode && headerNode.parent) {
        headerNode.remove();
      }
    } catch (removeError) {
      console.warn('删除原头图节点失败:', removeError);
    }
    
    // 将复制的头图图片节点添加到头图组中
    try {
      NodeUtils.safeAppendChild(headerGroup, headerNodeCopy, '复制的头图图片节点添加到头图组');
      
      // 🎯 关键：复制节点的位置也是相对于frame（容器父级）
      // 由于Container Parent概念，组内元素坐标相对于frame，不是相对于组
      headerNodeCopy.x = originalX; // 相对于frame的原始位置
      headerNodeCopy.y = originalY; // 相对于frame的原始位置
      headerNodeCopy.constraints = originalConstraints;
    } catch (addError) {
      console.error('将复制的头图图片节点添加到头图组失败:', addError);
    }
    
  } catch (error) {
    console.error('为头图图片添加羽化蒙版失败:', error);
    // 不再抛出错误，而是记录并继续执行
  }
}

// ==================== 游戏信息模块 ====================

export async function createGameInfoModule(config: H5Config): Promise<FrameNode> {
  // 根据按钮版本调整框架高度
  let frameHeight = 210;
  if (config.buttonVersion === 'doubleButton') {
    frameHeight = 250; // 双按钮版需要更多空间    
  }
  
  // 创建游戏信息框架
  const frame = NodeUtils.createFrame("游戏信息", CONSTANTS.H5_WIDTH, frameHeight);
  // 设置框架填充为透明
  frame.fills = [];

  // 创建游戏信息布局管理器
  const layout = new GameInfoLayoutManager(frame, config);
  // 构建游戏信息布局
  await layout.build();

  // 返回创建好的游戏信息模块框架
  return frame;
}

// 游戏信息布局管理器类
class GameInfoLayoutManager {
  // 存储游戏信息框架节点
  private frame: FrameNode;
  // 存储H5配置信息
  private config: H5Config;

  // 构造函数，初始化框架节点和配置信息
  constructor(frame: FrameNode, config: H5Config) {
    this.frame = frame;
    this.config = config;
  }

  async build(): Promise<void> {
    // 只有带icon版才显示游戏图标和游戏信息
    if (this.config.buttonVersion === 'imageButton') {
      // 添加游戏图标
      await this.addGameIcon();
      // 添加游戏信息（如游戏名称和描述）
      await this.addGameInfo();
    }
    
    // 无论是哪种版本，都需要添加按钮
    await this.addButtons();
  }

  // 添加游戏图标
  private async addGameIcon(): Promise<void> {
    // 如果没有配置游戏图标，则直接返回
    if (!this.config.gameIcon) return;

    // 插入游戏图标图片
    const iconImageNode = await ImageNodeBuilder.insertImage(
      this.config.gameIcon, 
      "游戏图标", 
      190, 
      190
    );
    
    // 如果图标插入失败，则直接返回
    if (!iconImageNode) return;

    // 设置图标尺寸
    iconImageNode.resize(190, 190);
    // 设置图标圆角
    if ('cornerRadius' in iconImageNode) {
      iconImageNode.cornerRadius = 40;
    }
    // 设置图标边框样式
    if ('strokes' in iconImageNode) {
      iconImageNode.strokes = [{
        type: 'SOLID',
        color: { r: 1, g: 1, b: 1 },
        opacity: 0.2
      }];
    }
    // 设置边框宽度
    if ('strokeWeight' in iconImageNode) {
      iconImageNode.strokeWeight = 1;
    }
    // 设置图标水平位置
    iconImageNode.x = 70;
    // 设置图标垂直居中
    iconImageNode.y = (this.frame.height - 190) / 2;
    
    // 将图标添加到框架中
    NodeUtils.safeAppendChild(this.frame, iconImageNode, '游戏图标添加');
  }

  // 添加游戏信息（游戏名称和描述）
  private async addGameInfo(): Promise<void> {
    // 设置文本颜色，如果配置中有指定则使用，否则默认为白色
    const textColor = this.config.gameTextColor 
      ? ColorUtils.hexToRgb(this.config.gameTextColor)
      : { r: 1, g: 1, b: 1 };

    // 添加游戏名称
    if (this.config.gameName) {
      // 创建游戏名称文本节点
      const nameText = await NodeUtils.createText(this.config.gameName, 48, 'Medium');
      // 设置文本位置
      nameText.x = 285;
      nameText.y = 49;
      // 设置文本左对齐
      nameText.textAlignHorizontal = "LEFT";
      // 设置文本颜色
      nameText.fills = [ColorUtils.createSolidFill(textColor)];
      // 将文本节点添加到框架中
      NodeUtils.safeAppendChild(this.frame, nameText, '游戏名称文本添加');
    }

    // 添加游戏描述
    if (this.config.gameDesc) {
      // 创建游戏描述文本节点
      const descText = await NodeUtils.createText(this.config.gameDesc, 32, 'Regular');
      // 设置文本位置
      descText.x = 285;
      descText.y = 122;
      // 1. 游戏描述文本节点宽度为300px
      descText.resize(300, descText.height);
      // 2. 布局设为自动高度
      descText.textAutoResize = "HEIGHT";
      // 设置文本左对齐
      descText.textAlignHorizontal = "LEFT";
      // 设置文本颜色
      descText.fills = [ColorUtils.createSolidFill(textColor)];
      // 将文本节点添加到框架中
      NodeUtils.safeAppendChild(this.frame, descText, '游戏描述文本添加');
    }
  }

  // 添加按钮
  private async addButtons(): Promise<void> {
    // 根据配置的按钮版本选择不同的按钮添加方法
    switch (this.config.buttonVersion) {
      case 'imageButton':
        // 添加图标按钮
        await this.addIconButton();
        break;
      case 'singleButton':
        // 添加单个按钮
        await this.addSingleButton();
        break;
      case 'doubleButton':
        // 添加双按钮
        await this.addDoubleButtons();
        break;
    }
  }

  // 添加图标按钮
  private async addIconButton(): Promise<void> {
    // 只有当有按钮底图时才创建按钮框架
    if (!this.config.iconButtonBg) {
      return;
    }

    // 创建按钮框架
    const buttonFrame = NodeUtils.createFrame("下载按钮", 344, 103);
    // 设置按钮位置：距离右边距70px
    buttonFrame.x = 666; // 距离右边距70px
    buttonFrame.y = (this.frame.height - 103) / 2; // 垂直居中

    // 设置按钮框架为透明背景
    buttonFrame.fills = [];

    // 添加按钮底图
    if (this.config.iconButtonBg) {
      try {
        const buttonBgImage = await ImageNodeBuilder.insertImage(
          this.config.iconButtonBg, 
          "按钮底图", 
          344, 
          103
        );
        if (buttonBgImage) {
          buttonBgImage.x = 0;
          buttonBgImage.y = 0;
          NodeUtils.safeAppendChild(buttonFrame, buttonBgImage, '图标按钮底图添加');
        } else {
          // 如果图片插入失败，使用默认背景色
          buttonFrame.fills = [ColorUtils.createSolidFill({ r: 0, g: 0.44, b: 0.89 })];
          buttonFrame.cornerRadius = 30;
        }
      } catch (error) {
        console.error('按钮底图创建失败:', error);
        // 如果底图创建失败，设置默认背景色
        buttonFrame.fills = [ColorUtils.createSolidFill({ r: 0, g: 0.44, b: 0.89 })];
        buttonFrame.cornerRadius = 30;
      }
    } else {
      // 没有底图时使用默认背景色
      buttonFrame.fills = [ColorUtils.createSolidFill({ r: 0, g: 0.44, b: 0.89 })];
      buttonFrame.cornerRadius = 30;
    }

    // 添加按钮文本
    const buttonText = this.config.iconButtonText || "立即下载";
    if (buttonText) {
      const textColor = this.config.iconButtonTextColor 
        ? ColorUtils.hexToRgb(this.config.iconButtonTextColor)
        : { r: 1, g: 1, b: 1 };

      try {
        // 创建文本节点
        const textNode = await NodeUtils.createText(buttonText, 36, 'Bold');
        // 设置文本颜色
        textNode.fills = [ColorUtils.createSolidFill(textColor)];
        // 调整文本大小以适应按钮
        textNode.resize(buttonFrame.width, textNode.height);
        // 设置文本水平居中
        textNode.textAlignHorizontal = "CENTER";
        // 设置文本垂直居中
        textNode.y = (buttonFrame.height - textNode.height) / 2;
        
        // 将文本添加到按钮框架中
        NodeUtils.safeAppendChild(buttonFrame, textNode, '图标按钮文本添加');
      } catch (textError) {
        console.error('创建按钮文本失败:', textError);
      }
    }

    // 将按钮框架添加到主框架中
    NodeUtils.safeAppendChild(this.frame, buttonFrame, '图标按钮框架添加');
  }

  private async addSingleButton(): Promise<void> {
    // 只有当有按钮底图时才创建按钮框架
    if (!this.config.singleButtonBg) {
      return;
    }

    const buttonFrame = NodeUtils.createFrame("单按钮", 600, 80);
    buttonFrame.x = (CONSTANTS.H5_WIDTH - 600) / 2; // 水平居中
    buttonFrame.y = (this.frame.height - 80) / 2; // 垂直居中
    buttonFrame.cornerRadius = 40;

    // 使用上传的底图
    try {
      await ImageNodeBuilder.setImageFill(buttonFrame, this.config.singleButtonBg);
    } catch (error) {
      console.error('单按钮底图设置失败:', error);
      return;
    }

    // 添加按钮文本
    const buttonText = this.config.singleButtonText || "立即下载";
    if (buttonText) {
      const textColor = this.config.singleButtonTextColor 
        ? ColorUtils.hexToRgb(this.config.singleButtonTextColor)
        : { r: 1, g: 1, b: 1 };

      try {
        const textNode = await NodeUtils.createText(buttonText, 32, 'Bold');
        textNode.fills = [ColorUtils.createSolidFill(textColor)];
        textNode.resize(buttonFrame.width, textNode.height);
        textNode.textAlignHorizontal = "CENTER";
        textNode.y = (buttonFrame.height - textNode.height) / 2;
        
        NodeUtils.safeAppendChild(buttonFrame, textNode, '单按钮文本添加');
      } catch (textError) {
        console.error('创建单按钮文本失败:', textError);
      }
    }

    NodeUtils.safeAppendChild(this.frame, buttonFrame, '单按钮框架添加');
  }
  
  private async addDoubleButtons(): Promise<void> {
    // 检查是否至少有一个按钮有底图
    const hasLeftBg = this.config.leftButtonBg;
    const hasRightBg = this.config.rightButtonBg;
    
    if (!hasLeftBg && !hasRightBg) {
      return;
    }

    const spacing = this.config.buttonSpacing || 10;
    const totalButtonsWidth = 800; // 双按钮总宽度
    const buttonWidth = (totalButtonsWidth - spacing) / 2;
    const startX = (CONSTANTS.H5_WIDTH - totalButtonsWidth) / 2;
    const buttonY = (this.frame.height - 80) / 2; // 垂直居中

    // 左侧按钮 - 只有有底图时才创建
    if (hasLeftBg) {
      try {
        const leftButton = await this.createButton(
          "左侧按钮",
          this.config.leftButtonText || "左侧按钮",
          this.config.leftButtonTextColor,
          this.config.leftButtonBg,
          buttonWidth,
          80
        );
        if (leftButton) {
          leftButton.x = startX;
          leftButton.y = buttonY;
          NodeUtils.safeAppendChild(this.frame, leftButton, '左侧按钮添加');
        }
      } catch (leftButtonError) {
        console.error('创建左侧按钮失败:', leftButtonError);
      }
    }

    // 右侧按钮 - 只有有底图时才创建
    if (hasRightBg) {
      try {
        const rightButton = await this.createButton(
          "右侧按钮",
          this.config.rightButtonText || "右侧按钮",
          this.config.rightButtonTextColor,
          this.config.rightButtonBg,
          buttonWidth,
          80
        );
        if (rightButton) {
          rightButton.x = startX + buttonWidth + spacing;
          rightButton.y = buttonY;
          NodeUtils.safeAppendChild(this.frame, rightButton, '右侧按钮添加');
        }
      } catch (rightButtonError) {
        console.error('创建右侧按钮失败:', rightButtonError);
      }
    }
  }
  
  private async createButton(
    name: string,
    text: string,
    textColor: string,
    bgImage: ImageInfo | null,
    width: number,
    height: number
  ): Promise<FrameNode | null> {
    // 只有当有底图时才创建按钮
    if (!bgImage) {
      return null;
    }

    const buttonFrame = NodeUtils.createFrame(name, width, height);
    buttonFrame.cornerRadius = height / 2;

    // 使用上传的底图
    try {
      await ImageNodeBuilder.setImageFill(buttonFrame, bgImage);
    } catch (error) {
      console.error(`${name}底图设置失败:`, error);
      return null;
    }

    // 添加按钮文本
    if (text) {
      try {
        const color = textColor 
          ? ColorUtils.hexToRgb(textColor)
          : { r: 1, g: 1, b: 1 };

        const buttonText = await NodeUtils.createText(text, 24, 'Bold');
        buttonText.fills = [ColorUtils.createSolidFill(color)];
        buttonText.resize(width, buttonText.height);
        buttonText.textAlignHorizontal = "CENTER";
        buttonText.y = (height - buttonText.height) / 2;
        
        NodeUtils.safeAppendChild(buttonFrame, buttonText, `${name}按钮文本添加`);
      } catch (textError) {
        console.error(`创建${name}文本失败:`, textError);
      }
    }

    return buttonFrame;
  }
}

// ==================== 自定义模块 ====================

export async function createCustomModule(module: ModuleData): Promise<FrameNode> {
  const factory = new ModuleFactory();
  return factory.createModule(module as unknown as Module);
}

class ModuleFactory {
  async createModule(module: Module): Promise<FrameNode> {
    try {
      let moduleFrame: FrameNode;
      
      switch (module.type) {
        case ModuleType.ACTIVITY_CONTENT:
          moduleFrame = await this.createActivityContentModule(module.content as ActivityContentData);
          break;
        case ModuleType.SIGN_IN:
          moduleFrame = await this.createSignInModule(module.content as SignInContent);
          break;
        case ModuleType.COLLECT_CARDS:
          moduleFrame = await this.createCollectCardsModule(module.content as CollectCardsContent);
          break;
        case ModuleType.NINE_GRID:
          moduleFrame = await this.createNineGridModule(module.content as NineGridContent);
          break;
        default:
          console.warn(`未知的模块类型: ${module.type}`);
          return this.createErrorModule(module, `未知的模块类型: ${module.type}`);
      }
      
      moduleFrame.name = module.title || `${module.type}模块`;
      return moduleFrame;
    } catch (error) {
      console.error(`创建模块失败: ${module.type}`, error);
      return this.createErrorModule(module, error);
    }
  }

  private async createActivityContentModule(content: ActivityContentData): Promise<FrameNode> {
    const frame = NodeUtils.createFrame('活动内容模块', CONSTANTS.H5_WIDTH, 100);
    frame.fills = [];
    
    const builder = new ActivityContentBuilder(frame, content);
    await builder.build();
    
    return frame;
  }

  private async createSignInModule(content: SignInContent): Promise<FrameNode> {
    const frame = NodeUtils.createFrame('签到模块', CONSTANTS.H5_WIDTH, 460);
    
    const builder = new SignInModuleBuilder(frame, content);
    await builder.build();
    
    return frame;
  }

  private async createCollectCardsModule(content: CollectCardsContent): Promise<FrameNode> {
    const frame = NodeUtils.createFrame('集卡模块', CONSTANTS.H5_WIDTH, 300);
    
    const builder = new CollectCardsModuleBuilder(frame, content);
    await builder.build();
    
    return frame;
  }

  private async createNineGridModule(content: ModuleContent): Promise<FrameNode> {
    const builder = new NineGridModuleBuilder(content as NineGridContent);
    return builder.build();
  }

  private async createErrorModule(module: Module, error: unknown): Promise<FrameNode> {
    const frame = NodeUtils.createFrame(`错误模块-${module.type}`, CONSTANTS.H5_WIDTH, 100);
    frame.fills = [ColorUtils.createSolidFill({ r: 1.0, g: 0.9, b: 0.9 })];
    
    const errorText = await NodeUtils.createText(
      `模块创建失败: ${module.type}\n${error}`, 
      14, 
      'Regular'
    );
    errorText.x = 20;
    errorText.y = 20;
    NodeUtils.safeAppendChild(frame, errorText, '错误信息添加');
    
    return frame;
  }
}

// ==================== 规则模块 ====================

// 活动规则内容接口
interface ActivityRulesContent {
  rulesTitle: string;               // 规则标题
  rulesBgImage: ImageInfo | null;   // 规则标题背景图片
  rulesContent: string;             // 规则内容文本
}

// 页面底部活动规则模块创建器
export async function createRulesModule(config: H5Config): Promise<FrameNode> {
  console.log('开始创建活动规则模块，内容：', {
    rulesTitle: config.rulesTitle,
    rulesBgImage: !!config.rulesBgImage,
    rulesContent: config.rulesContent
  });

  // 创建活动规则模块容器：1080宽，背景透明，高度按实际创建内容来调整
  const frame = NodeUtils.createFrame("活动规则", 1080, 1000);
  frame.fills = []; // 背景填充为透明

  try {
    // 构建活动规则内容数据
    const rulesData: ActivityRulesContent = {
      rulesTitle: config.rulesTitle || '',
      rulesBgImage: config.rulesBgImage,
      rulesContent: config.rulesContent || ''
    };

    // 实例化活动规则模块构建器
    const builder = new ActivityRulesModuleBuilder(frame, rulesData);
    // 调用构建器的build方法来构建活动规则模块
    await builder.build();

    console.log('活动规则模块创建完成，最终高度：', frame.height);

    // 返回构建完成的框架
    return frame;
  } catch (error) {
    console.error('活动规则模块创建失败：', error);
    // 创建一个错误信息显示框
    const errorText = await NodeUtils.createText(`活动规则模块创建失败: ${error instanceof Error ? error.message : '未知错误'}`, 16);
    errorText.x = 20;
    errorText.y = 20;
    errorText.fills = [ColorUtils.createSolidFill({ r: 1, g: 0, b: 0 })];
    NodeUtils.safeAppendChild(frame, errorText, '活动规则模块错误文本添加');
    frame.resize(1080, 100);
    return frame;
  }
}

// 活动规则模块构建器类
class ActivityRulesModuleBuilder {
  private frame: FrameNode; // 存储活动规则模块的框架节点
  private content: ActivityRulesContent; // 存储活动规则模块的内容
  private currentY = 0; // 当前Y位置

  // 构造函数，初始化活动规则模块构建器
  constructor(frame: FrameNode, content: ActivityRulesContent) {
    this.frame = frame; // 设置框架节点
    this.content = content; // 设置内容
  }

  // 构建活动规则模块的主要方法
  async build(): Promise<void> {
    console.log('开始构建活动规则模块');

    try {
      // 检查是否有任何内容需要构建
      const hasRulesTitle = this.content.rulesTitle && this.content.rulesTitle.trim() !== '';
      const hasRulesBgImage = this.content.rulesBgImage !== null && this.content.rulesBgImage !== undefined;
      const hasRulesContent = this.content.rulesContent && this.content.rulesContent.trim() !== '';

      // 如果没有任何内容，直接返回
      if (!hasRulesTitle && !hasRulesBgImage && !hasRulesContent) {
        console.log('活动规则模块：没有任何内容需要构建，跳过');
        this.frame.resize(1080, 0); // 设置高度为0
        return;
      }

      // 添加标题（如果有标题文案或标题背景）
      if (hasRulesTitle || hasRulesBgImage) {
        console.log('添加活动规则标题...');
        await this.addTitle();
      }

      // 添加规则内容（如果有）
      if (hasRulesContent) {
        console.log('添加活动规则内容...');
        await this.addRulesContent();
      }

      // 调整整个模块的高度
      console.log('调整模块高度...');
      this.adjustFrameHeight();

      console.log('活动规则模块构建完成');
    } catch (error) {
      console.error('活动规则模块构建过程中出错：', error);
      throw error;
    }
  }

  // 添加标题
  private async addTitle(): Promise<void> {
    const hasRulesTitle = this.content.rulesTitle && this.content.rulesTitle.trim() !== '';
    const hasRulesBgImage = this.content.rulesBgImage !== null && this.content.rulesBgImage !== undefined;
    
    // 如果既没有标题文案也没有标题背景，直接返回
    if (!hasRulesTitle && !hasRulesBgImage) return;

    // 添加上边距
    this.currentY += 90;

    // 使用统一的标题容器创建函数
    // 如果没有标题文案，使用空字符串，但仍然可以显示背景图片
    const titleText = hasRulesTitle ? this.content.rulesTitle : '';
    
    const titleContainer = await createTitleContainer(
      titleText,
      this.content.rulesBgImage,
      1080,
      120,
      48, // 48px字体大小
      'Bold'
    );
    
    titleContainer.x = 0;
    titleContainer.y = this.currentY;
    
    NodeUtils.safeAppendChild(this.frame, titleContainer, '活动规则标题容器添加');
    this.currentY += 120;
  }

  // 添加规则内容
  private async addRulesContent(): Promise<void> {
    // 如果没有规则内容，直接返回
    if (!this.content.rulesContent) return;

    console.log('添加规则内容...');

    // 添加上边距
    this.currentY += 90;

    // 创建规则内容文本节点，直接插入到活动规则容器中（与活动详情模块的正文文本节点实现方式一致）
    const contentText = await NodeUtils.createText(this.content.rulesContent, 28, 'Regular');
    
    // 设置文本样式（与活动详情模块的正文文本完全一致）
    contentText.fills = [ColorUtils.createSolidFill({ r: 0, g: 0, b: 0 })]; // 黑色文字
    contentText.lineHeight = { value: 40, unit: 'PIXELS' }; // 设置行高40px（与活动详情模块一致）
    contentText.resize(950, contentText.height); // 设置宽度为950px（与活动详情模块一致）
    contentText.textAlignHorizontal = "LEFT"; // 左对齐（与活动详情模块一致）
    
    // 设置文本位置：水平居中，垂直按当前Y位置放置
    contentText.x = (1080 - 950) / 2; // 水平居中（左右各留65px边距）
    contentText.y = this.currentY;

    // 直接将文本节点添加到活动规则容器中
    NodeUtils.safeAppendChild(this.frame, contentText, '活动规则内容文本添加');
    
    // 更新当前Y位置
    this.currentY += contentText.height;
  }

  // 调整整个模块的高度
  private adjustFrameHeight(): void {
    // 添加下边距
    this.currentY += 90;
    // 调整框架高度
    this.frame.resize(1080, this.currentY);
  }
}

// ==================== 底部模块 ====================

export async function createFooterModule(config: H5Config): Promise<FrameNode | null> {
  // 当同时没有LOGO图片和尾版背景图片时，直接跳过创建尾版模块
  if (!config.footerLogo && !config.footerBg) {
    console.log('跳过尾版模块创建：没有LOGO图片和尾版背景图片');
    return null;
  }

  // 创建尾版框架
  const frame = NodeUtils.createFrame("尾版", CONSTANTS.H5_WIDTH, 480);
  
  // 创建FooterBuilder实例并构建尾版内容
  const builder = new FooterBuilder(frame, config);
  await builder.build();
  
  // 返回创建的尾版框架
  return frame;
}

// 尾版构建
class FooterBuilder {
  private frame: FrameNode;
  private config: H5Config;

  // 构造函数，初始化尾版框架和配置
  constructor(frame: FrameNode, config: H5Config) {
    this.frame = frame;
    this.config = config;
  }

  // 构建尾版内容
  async build(): Promise<void> {
    await this.setupBackground();
    await this.addContent();
  }

  // 设置尾版背景
  private async setupBackground(): Promise<void> {
    if (this.config.footerBg) {
      // 如果配置中有尾版背景图，则使用该图片
      await ImageNodeBuilder.setImageFill(this.frame, this.config.footerBg);
    } else {
      // 如果没有背景图，则使用透明背景
      this.frame.fills = [];
    }
  }

  // 添加尾版内容
  private async addContent(): Promise<void> {
    if (this.config.footerLogo) {
      await this.addLogo();
    }
  }

  // 添加Logo
  private async addLogo(): Promise<void> {
    // 检查是否有Logo图片数据
    if (!this.config.footerLogo) {
      console.log('跳过Logo创建：没有上传Logo图片');
      return;
    }

    console.log('开始创建Logo，使用ImageNodeBuilder');

    try {
      // 使用ImageNodeBuilder直接插入Logo图片节点
      const logoImage = await ImageNodeBuilder.insertImage(
        this.config.footerLogo, 
        "LOGO"
      );
      
      if (!logoImage) {
        console.log('Logo图片节点创建失败');
        return;
      }

      // 获取原始图片尺寸
      const originalWidth = logoImage.width;
      const originalHeight = logoImage.height;
      const aspectRatio = originalWidth / originalHeight;
      
      console.log(`Logo原始尺寸: ${originalWidth}x${originalHeight}, 宽高比: ${aspectRatio.toFixed(2)}`);
      
      let finalWidth: number;
      let finalHeight: number;
      
      // 按照要求计算最终尺寸
      // 1. 首先按宽度340px计算高度
      finalWidth = 340;
      finalHeight = finalWidth / aspectRatio;
      
      // 2. 如果高度超过250px，则改为按高度250px计算宽度
      if (finalHeight > 250) {
        finalHeight = 250;
        finalWidth = finalHeight * aspectRatio;
      }
      
      // 设置Logo图片尺寸
      logoImage.resize(finalWidth, finalHeight);
      
      // 设置位置：水平和垂直居中
      logoImage.x = (CONSTANTS.H5_WIDTH - finalWidth) / 2;
      logoImage.y = (this.frame.height - finalHeight) / 2;
      
      // 设置自动约束为缩放
      if ('constraints' in logoImage) {
        logoImage.constraints = {
          horizontal: "SCALE",
          vertical: "SCALE"
        };
      }
      
      // 将Logo图片节点直接添加到尾版框架中
      NodeUtils.safeAppendChild(this.frame, logoImage, '尾版Logo图片添加');
      
      console.log(`Logo创建成功: 最终尺寸=${finalWidth.toFixed(1)}x${finalHeight.toFixed(1)}, 位置=(${logoImage.x.toFixed(1)}, ${logoImage.y.toFixed(1)})`);
      
    } catch (error) {
      console.error('Logo创建失败:', error);
    }
  }
}

// ==================== 九宫格模块构建器 ====================

export class NineGridModuleBuilder {
  private frame: FrameNode;
  private content: NineGridContent; // 使用正确的类型
  private readonly CELL_SIZE = 270; // 每个格子固定大小270x270px
  private readonly CELL_SPACING = 24; // 格子间距24px
  private currentY = 0; // 当前Y位置

  constructor(content: NineGridContent) {
    this.content = content;
    this.frame = NodeUtils.createFrame('九宫格模块', CONSTANTS.MODULE_WIDTH, 100);
  }

  async build(): Promise<FrameNode> {
    try {
      // 设置背景
      await this.setupBackground();
      
      // 添加标题
      await this.addTitle();
      
      // 添加九宫格
      await this.addNineGrid();
      
      // 调整框架高度
      this.adjustFrameHeight();
      
      return this.frame;
    } catch (error) {
      console.error('九宫格模块构建失败:', error);
      throw error;
    }
  }

  private async setupBackground(): Promise<void> {
    if (this.content.gridBgImage) {
      await ImageNodeBuilder.setImageFill(this.frame, this.content.gridBgImage);
    } else {
      this.frame.fills = [ColorUtils.createSolidFill({ r: 0.98, g: 0.98, b: 1 })];
    }
  }

  private async addTitle(): Promise<void> {
    if (this.content.mainTitle) {
      const titleHeight = 80;
      const titleContainer = await createTitleContainer(
        this.content.mainTitle,
        this.content.titleBgImage,
        CONSTANTS.MODULE_WIDTH - 40,
        titleHeight,
        20,
        'Bold'
      );
      
      titleContainer.x = 20;
      titleContainer.y = this.currentY + 20;
      this.frame.appendChild(titleContainer);
      this.currentY += titleHeight + 40;
    }
  }

  private async addNineGrid(): Promise<void> {
    const gridSize = this.CELL_SIZE * 3 + this.CELL_SPACING * 2;
    const startX = (CONSTANTS.MODULE_WIDTH - gridSize) / 2;
    const startY = this.currentY + 20;

    // 创建3x3网格
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + col * (this.CELL_SIZE + this.CELL_SPACING);
        const y = startY + row * (this.CELL_SIZE + this.CELL_SPACING);
        
        if (row === 1 && col === 1) {
          // 中心位置：抽奖按钮
          const drawButton = await this.createDrawButton(x, y);
          this.frame.appendChild(drawButton);
        } else {
          // 外围位置：奖品格子
          const index = this.getPrizeIndex(row, col);
          const prizeCell = await this.createPrizeCell(x, y, index);
          this.frame.appendChild(prizeCell);
        }
      }
    }

    this.currentY = startY + this.CELL_SIZE * 3 + this.CELL_SPACING * 2 + 20;
  }

  private async createDrawButton(x: number, y: number): Promise<FrameNode> {
    const buttonFrame = NodeUtils.createFrame('抽奖按钮', this.CELL_SIZE, this.CELL_SIZE);
    buttonFrame.x = x;
    buttonFrame.y = y;

    // 设置按钮背景
    if (this.content.drawButtonImage) {
      await ImageNodeBuilder.setImageFill(buttonFrame, this.content.drawButtonImage);
    } else {
      await this.addDefaultButtonStyle(buttonFrame);
    }

    return buttonFrame;
  }

  private async addDefaultButtonStyle(buttonFrame: FrameNode): Promise<void> {
    // 默认按钮样式
    buttonFrame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.6, b: 0 })];
    buttonFrame.cornerRadius = 20;
    
    // 添加"抽奖"文字
    const buttonText = await NodeUtils.createText('抽奖', 24, 'Bold');
    buttonText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    buttonText.textAlignHorizontal = 'CENTER';
    buttonText.textAlignVertical = 'CENTER';
    buttonText.x = (this.CELL_SIZE - buttonText.width) / 2;
    buttonText.y = (this.CELL_SIZE - buttonText.height) / 2;
    buttonFrame.appendChild(buttonText);
  }

  private async createPrizeCell(x: number, y: number, index: number): Promise<FrameNode> {
    const cellFrame = NodeUtils.createFrame(`奖品${index + 1}`, this.CELL_SIZE, this.CELL_SIZE);
    cellFrame.x = x;
    cellFrame.y = y;

    // 设置奖品背景
    if (this.content.prizeBgImage) {
      await ImageNodeBuilder.setImageFill(cellFrame, this.content.prizeBgImage);
    } else {
      cellFrame.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 0.95 })];
      cellFrame.cornerRadius = 15;
    }

    // 添加奖品内容
    const prizes = this.content.prizes || [];
    const prize = prizes[index];
    if (prize) {
      let contentY = 20;

      // 奖品图片
      if (prize.image) {
        const prizeImage = await ImageNodeBuilder.insertImage(
          prize.image, 
          `奖品图片${index + 1}`, 
          this.CELL_SIZE - 40, 
          this.CELL_SIZE - 80
        );
        if (prizeImage) {
          prizeImage.x = (this.CELL_SIZE - prizeImage.width) / 2;
          prizeImage.y = contentY;
          cellFrame.appendChild(prizeImage);
          contentY += prizeImage.height + 10;
        }
      }

      // 奖品名称
      if (prize.name) {
        const prizeText = await NodeUtils.createText(prize.name, 14, 'Medium');
        prizeText.fills = [ColorUtils.createSolidFill({ r: 0.2, g: 0.2, b: 0.2 })];
        prizeText.textAlignHorizontal = 'CENTER';
        prizeText.x = (this.CELL_SIZE - prizeText.width) / 2;
        prizeText.y = contentY;
        cellFrame.appendChild(prizeText);
      }
    }

    return cellFrame;
  }

  private getPrizeIndex(row: number, col: number): number {
    // 九宫格位置映射：0-7对应外围8个位置
    const positions = [
      { row: 0, col: 0 }, // 左上
      { row: 0, col: 1 }, // 上中
      { row: 0, col: 2 }, // 右上
      { row: 1, col: 2 }, // 右中
      { row: 2, col: 2 }, // 右下
      { row: 2, col: 1 }, // 下中
      { row: 2, col: 0 }, // 左下
      { row: 1, col: 0 }  // 左中
    ];
    
    return positions.findIndex(pos => pos.row === row && pos.col === col);
  }

  private adjustFrameHeight(): void {
    this.frame.resize(CONSTANTS.MODULE_WIDTH, this.currentY + 20);
  }
}

// ==================== 活动内容构建器 ====================

export class ActivityContentBuilder {
  private frame: FrameNode;
  private content: ActivityContentData;

  constructor(frame: FrameNode, content: ActivityContentData) {
    this.frame = frame;
    this.content = content;
  }

  async build(): Promise<void> {
    try {
      // 设置自动布局
      this.setupAutoLayout();
      
      // 添加大标题
      await this.addMainTitle();
      
      // 添加小标题
      await this.addSubTitle();
      
      // 添加正文
      await this.addTextContent();
      
      // 添加插图
      await this.addImage();
      
    } catch (error) {
      console.error('活动内容模块构建过程中出错：', error);
      throw error;
    }
  }

  private setupAutoLayout(): void {
    NodeUtils.setupAutoLayout(this.frame, 'VERTICAL', 60, 90);
  }

  private async addMainTitle(): Promise<void> {
    if (!this.content.mainTitleBg || !this.content.mainTitle) return;

    const titleContainer = await createTitleContainer(
      this.content.mainTitle,
      this.content.mainTitleBg,
      CONSTANTS.H5_WIDTH,
      120,
      48,
      'Bold'
    );
    
    NodeUtils.safeAppendChild(this.frame, titleContainer, '活动内容大标题容器添加');
  }

  private async addSubTitle(): Promise<void> {
    if (!this.content.subTitleBg || !this.content.subTitle) return;

    const subTitleContainer = await createTitleContainer(
      this.content.subTitle,
      this.content.subTitleBg,
      CONSTANTS.H5_WIDTH,
      100,
      44,
      'Medium'
    );
    
    NodeUtils.safeAppendChild(this.frame, subTitleContainer, '活动内容小标题容器添加');
  }

  private async addTextContent(): Promise<void> {
    if (!this.content.text) return;

    const textNode = await NodeUtils.createText(this.content.text, 40, 'Regular');
    textNode.resize(950, textNode.height);
    textNode.textAlignHorizontal = "CENTER";
    textNode.lineHeight = { unit: 'AUTO' };
    textNode.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];

    NodeUtils.safeAppendChild(this.frame, textNode, '活动内容正文添加');
  }

  private async addImage(): Promise<void> {
    if (!this.content.image) return;

    try {
      const imageNode = await ImageNodeBuilder.insertImage(
        this.content.image,
        "活动内容插图",
        950,
        600
      );
      
      if (imageNode) {
        NodeUtils.safeAppendChild(this.frame, imageNode, '活动内容插图添加');
      }
    } catch (error) {
      console.error('插图创建失败:', error);
    }
  }
}

// ==================== 签到模块构建器 ====================

export class SignInModuleBuilder {
  private frame: FrameNode;
  private content: SignInContent;

  constructor(frame: FrameNode, content: SignInContent) {
    this.frame = frame;
    this.content = content;
  }

  async build(): Promise<void> {
    await this.setupBackground();
    await this.addTitle();
    await this.addSignInDays();
    await this.addSignInButton();
  }

  private async setupBackground(): Promise<void> {
    if (this.content.bgImage) {
      await ImageNodeBuilder.setImageFill(this.frame, this.content.bgImage);
    } else {
      this.frame.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 1 })];
    }
  }

  private async addTitle(): Promise<void> {
    const titleFrame = NodeUtils.createFrame("签到标题", 500, 100);
    titleFrame.x = (CONSTANTS.H5_WIDTH - 500) / 2;
    titleFrame.y = 20;

    if (this.content.titleImage) {
      await ImageNodeBuilder.setImageFill(titleFrame, this.content.titleImage, 'FIT');
    } else {
      await this.addDefaultTitle(titleFrame);
    }

    NodeUtils.safeAppendChild(this.frame, titleFrame, '签到标题添加');
  }

  private async addDefaultTitle(titleFrame: FrameNode): Promise<void> {
    titleFrame.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.5, b: 0.3 })];
    
    const titleText = await NodeUtils.createText("每日签到", 28, 'Bold');
    titleText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    titleText.resize(500, titleText.height);
    titleText.textAlignHorizontal = "CENTER";
    titleText.y = (100 - titleText.height) / 2;
    
    NodeUtils.safeAppendChild(titleFrame, titleText, '签到默认标题文本添加');
  }

  private async addSignInDays(): Promise<void> {
    const daysContainer = NodeUtils.createFrame("签到日期容器", CONSTANTS.H5_WIDTH - 40, 240);
    daysContainer.x = 20;
    daysContainer.y = 140;
    daysContainer.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 }, 0.8)];
    daysContainer.cornerRadius = 10;
    
    NodeUtils.setupAutoLayout(daysContainer, 'HORIZONTAL', 10, 10);

    const daysCount = this.content.daysCount || 7;
    
    for (let i = 0; i < daysCount; i++) {
      const dayItem = await this.createDayItem(i + 1);
      NodeUtils.safeAppendChild(daysContainer, dayItem, `签到第${i + 1}天添加`);
    }

    NodeUtils.safeAppendChild(this.frame, daysContainer, '签到日期容器添加');
  }

  private async createDayItem(dayNumber: number): Promise<FrameNode> {
    const dayItem = NodeUtils.createFrame(`第${dayNumber}天`, 80, 220);
    dayItem.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.95, b: 0.95 })];
    dayItem.cornerRadius = 5;
    
    NodeUtils.setupAutoLayout(dayItem, 'VERTICAL', 10, 10);

    const dayIconFrame = await this.createDayIcon();
    NodeUtils.safeAppendChild(dayItem, dayIconFrame, '签到日期图标添加');

    const dayText = await NodeUtils.createText(`第${dayNumber}天`, 16, 'Medium');
    dayText.resize(80, dayText.height);
    dayText.textAlignHorizontal = "CENTER";
    NodeUtils.safeAppendChild(dayItem, dayText, '签到日期文本添加');

    const rewardText = await NodeUtils.createText("金币 x 100", 14);
    rewardText.fills = [ColorUtils.createSolidFill({ r: 0.5, g: 0.5, b: 0.5 })];
    rewardText.resize(80, rewardText.height);
    rewardText.textAlignHorizontal = "CENTER";
    NodeUtils.safeAppendChild(dayItem, rewardText, '签到奖励描述添加');

    return dayItem;
  }

  private async createDayIcon(): Promise<FrameNode> {
    const dayIconFrame = NodeUtils.createFrame("日期图标", 60, 60);
    
    if (this.content.dayIcon) {
      await ImageNodeBuilder.setImageFill(dayIconFrame, this.content.dayIcon, 'FILL');
    } else {
      dayIconFrame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.8, b: 0.2 })];
      dayIconFrame.cornerRadius = 30;
    }

    return dayIconFrame;
  }

  private async addSignInButton(): Promise<void> {
    const buttonFrame = NodeUtils.createFrame("签到按钮", 200, 60);
    buttonFrame.x = (CONSTANTS.H5_WIDTH - 200) / 2;
    buttonFrame.y = 400;

    if (this.content.signButton) {
      await ImageNodeBuilder.setImageFill(buttonFrame, this.content.signButton, 'FIT');
    } else {
      await this.addDefaultButton(buttonFrame);
    }

    NodeUtils.safeAppendChild(this.frame, buttonFrame, '签到按钮框架添加');
  }

  private async addDefaultButton(buttonFrame: FrameNode): Promise<void> {
    buttonFrame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.4, b: 0.3 })];
    buttonFrame.cornerRadius = 30;

    const buttonText = await NodeUtils.createText("立即签到", 18, 'Bold');
    buttonText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    buttonText.resize(200, buttonText.height);
    buttonText.textAlignHorizontal = "CENTER";
    buttonText.y = (60 - buttonText.height) / 2;

    NodeUtils.safeAppendChild(buttonFrame, buttonText, '签到默认按钮文本添加');
  }
}

// ==================== 集卡模块构建器 ====================

export class CollectCardsModuleBuilder {
  private frame: FrameNode;
  private content: CollectCardsContent;

  constructor(frame: FrameNode, content: CollectCardsContent) {
    this.frame = frame;
    this.content = content;
  }

  async build(): Promise<void> {
    // 设置背景
    if (this.content.bgImage) {
      await ImageNodeBuilder.setImageFill(this.frame, this.content.bgImage);
    } else {
      this.frame.fills = [ColorUtils.createSolidFill({ r: 0.95, g: 0.9, b: 1 })];
    }

    let currentY = 20;

    // 添加标题
    if (this.content.titleImage) {
      const titleFrame = NodeUtils.createFrame("集卡标题", 400, 80);
      titleFrame.x = (CONSTANTS.H5_WIDTH - 400) / 2;
      titleFrame.y = currentY;
      
      await ImageNodeBuilder.setImageFill(titleFrame, this.content.titleImage, 'FIT');
      
      NodeUtils.safeAppendChild(this.frame, titleFrame, '集卡标题添加');
      currentY += 100;
    }

    // 创建卡片容器
    const cardsContainer = NodeUtils.createFrame("卡片容器", CONSTANTS.H5_WIDTH - 40, 200);
    cardsContainer.x = 20;
    cardsContainer.y = currentY;
    cardsContainer.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 }, 0.9)];
    cardsContainer.cornerRadius = 10;
    
    NodeUtils.setupAutoLayout(cardsContainer, 'HORIZONTAL', 10, 10);

    // 添加卡片
    const cardsCount = this.content.cardsCount || 5;
    for (let i = 0; i < cardsCount; i++) {
      const cardFrame = await this.createCardItem(i + 1);
      NodeUtils.safeAppendChild(cardsContainer, cardFrame, `集卡卡片${i + 1}添加`);
    }

    NodeUtils.safeAppendChild(this.frame, cardsContainer, '集卡卡片容器添加');
    currentY += 220;

    // 添加合成按钮
    if (this.content.combineButton) {
      const buttonFrame = NodeUtils.createFrame("合成按钮", 200, 60);
      buttonFrame.x = (CONSTANTS.H5_WIDTH - 200) / 2;
      buttonFrame.y = currentY;
      
      await ImageNodeBuilder.setImageFill(buttonFrame, this.content.combineButton, 'FIT');
      
      NodeUtils.safeAppendChild(this.frame, buttonFrame, '合成按钮添加');
      currentY += 80;
    }

    // 调整frame高度
    this.frame.resize(CONSTANTS.H5_WIDTH, currentY);
  }

  private async createCardItem(cardNumber: number): Promise<FrameNode> {
    const cardSize = 100;
    const cardFrame = NodeUtils.createFrame(`卡片${cardNumber}`, cardSize, cardSize + 30);
    
    // 设置卡片背景
    if (this.content.cardBg) {
      await ImageNodeBuilder.setImageFill(cardFrame, this.content.cardBg, 'FILL');
    } else {
      cardFrame.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
    }

    // 根据卡片样式设置圆角
    switch (this.content.cardStyle) {
      case 'style1':
        cardFrame.cornerRadius = 0;
        break;
      case 'style2':
        cardFrame.cornerRadius = 10;
        break;
      case 'style3':
        cardFrame.cornerRadius = cardSize / 2;
        break;
      default:
        cardFrame.cornerRadius = 5;
    }

    // 添加卡片编号
    const cardText = await NodeUtils.createText(`${cardNumber}`, 16, 'Bold');
    cardText.resize(cardSize, cardText.height);
    cardText.textAlignHorizontal = "CENTER";
    cardText.y = cardSize + 5;
    NodeUtils.safeAppendChild(cardFrame, cardText, '集卡卡片编号添加');

    return cardFrame;
  }
} 