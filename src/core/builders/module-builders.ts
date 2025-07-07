// 模块构建器
// 负责构建各种H5模块

/// <reference types="@figma/plugin-typings" />

import { createButtonContainer } from './figma-utils';

import { 
  H5Config, 
  ImageInfo, 
  Module, 
  ModuleData, 
  ModuleType, 
  NineGridContent,
  ActivityContentData,
  SignInContent,
  CollectCardsContent,
  CarouselContent,
  VerticalCarouselContent,
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
          // 调整图片尺寸
          if (buttonBgImage.height > 103) {
            // 如果高度超过103，先按高度等比例缩放
            const scale = 103 / buttonBgImage.height;
            buttonBgImage.resize(buttonBgImage.width * scale, 103);
          }

          // 如果调整后宽度超过344，再按宽度等比例缩放
          if (buttonBgImage.width > 344) {
            const scale = 344 / buttonBgImage.width;
            buttonBgImage.resize(344, buttonBgImage.height * scale);
          }

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

export async function createCustomModule(module: ModuleData, mainContainer?: FrameNode): Promise<FrameNode> {
  const factory = new ModuleFactory();
  return factory.createModule(module as unknown as Module, mainContainer);
}

// 模块工厂类，用于创建不同类型的模块
class ModuleFactory {
  async createModule(module: Module, mainContainer?: FrameNode): Promise<FrameNode> {
    try {
      let moduleFrame: FrameNode;
      
      // 🚨 关键修复：正确处理字符串类型的模块类型
      const moduleType = typeof module.type === 'string' ? module.type : module.type;
      
      console.log('🏭 [模块工厂] 开始创建模块:', {
        模块ID: module.id,
        模块类型: moduleType,
        模块标题: module.title,
        内容键: Object.keys(module.content || {})
      });
      
      switch (moduleType) {
        // 活动详情模块创建函数
        case 'activityContent':
        case ModuleType.ACTIVITY_CONTENT:
          moduleFrame = await this.createActivityContentModule(module.content as ActivityContentData);
          break;
        // 签到模块创建函数
        case 'signIn':
        case ModuleType.SIGN_IN:
          moduleFrame = await this.createSignInModule(module.content as SignInContent);
          break;
        // 集卡模块创建函数
        case 'collectCards':
        case ModuleType.COLLECT_CARDS:
          moduleFrame = await this.createCollectCardsModule(module.content as CollectCardsContent);
          break;
        // 九宫格模块创建函数
        case 'nineGrid':
        case ModuleType.NINE_GRID:
          moduleFrame = await this.createNineGridModule(module.content as NineGridContent, mainContainer);
          break;
        // 图片轮播模块创建函数
        case 'carousel':
        case ModuleType.CAROUSEL:
          moduleFrame = await this.createCarouselModule(module.content as CarouselContent);
          break;
        // 图片轮播模块（竖版）创建函数
        case 'verticalCarousel':
        case ModuleType.VERTICAL_CAROUSEL:
          moduleFrame = await this.createVerticalCarouselModule(module.content as VerticalCarouselContent);
          break;
        
        default:
          console.warn(`未知的模块类型: ${moduleType}`);
          return this.createErrorModule(module, `未知的模块类型: ${moduleType}`);
      }
      
      moduleFrame.name = module.title || `${moduleType}模块`;
      
      console.log('✅ [模块工厂] 模块创建成功:', {
        模块名称: moduleFrame.name,
        模块大小: `${moduleFrame.width}x${moduleFrame.height}`
      });
      
      return moduleFrame;
    } catch (error) {
      console.error(`❌ [模块工厂] 创建模块失败: ${module.type}`, error);
      return this.createErrorModule(module, error);
    }
  }

  private async createActivityContentModule(content: ActivityContentData): Promise<FrameNode> {
    console.log('🎭 [活动内容模块] 开始创建:', {
      主标题: content.mainTitle,
      副标题: content.subTitle,
      正文内容: content.text,
      主标题背景: !!content.mainTitleBg,
      副标题背景: !!content.subTitleBg,
      插图: !!content.image
    });
    
    // 创建整个活动内容模块容器：1080宽，背景透明
    const frame = NodeUtils.createFrame('活动内容模块', CONSTANTS.H5_WIDTH, 1000);
    frame.fills = []; // 背景填充为透明
    
    // 实例化活动内容模块构建器
    const builder = new ActivityContentBuilder(frame, content);
    // 调用构建器的build方法来构建活动内容模块
    await builder.build();
    
    console.log('✅ [活动内容模块] 创建完成，最终高度：', frame.height);
    
    // 返回构建完成的框架
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

  private async createNineGridModule(content: NineGridContent, mainContainer?: FrameNode): Promise<FrameNode> {
    const builder = new NineGridModuleBuilder(content, mainContainer);
    return builder.build();
  }

  /**
   * 创建图片轮播（横版）模块
   * @param content 轮播内容数据
   * @returns 返回创建的轮播模块框架节点
   */
  private async createCarouselModule(content: CarouselContent): Promise<FrameNode> {
    // 创建模块容器
    const frame = NodeUtils.createFrame("图片轮播（横版）", 1080, 957);
    frame.fills = []; // 透明背景

    // 创建并构建轮播模块
    const builder = new CarouselModuleBuilder(frame, content);
    // 调用构建器的build方法来构建轮播模块
    await builder.build();
    console.log('图片轮播（横版）模块创建完成，最终高度：', frame.height);
    // 返回构建完成的框架
    return frame;
  }

  /**
   * 创建图片轮播（竖版）模块
   * @param content 竖版轮播内容数据
   * @returns 返回创建的竖版轮播模块框架节点
   */
  private async createVerticalCarouselModule(content: VerticalCarouselContent): Promise<FrameNode> {
    // 创建模块容器
    const frame = NodeUtils.createFrame("图片轮播（竖版）", 1080, 1405);
    frame.fills = []; // 透明背景

    // 创建并构建竖版轮播模块
    const builder = new VerticalCarouselModuleBuilder(frame, content);
    // 调用构建器的build方法来构建竖版轮播模块
    await builder.build();
    console.log('图片轮播（竖版）模块创建完成，最终高度：', frame.height);
    // 返回构建完成的框架
    return frame;
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

// ==================== 活动规则模块创建器 ====================

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

  // 添加活动规则标题
  private async addTitle(): Promise<void> {
    const result = await createTitleContainer(
      this.content.rulesTitle,
      this.content.rulesBgImage ?? undefined, // 如果规则标题背景图片为空，则使用undefined
      1080,
      120,
      this.currentY,
      {
        fontSize: 48,
        fontWeight: 'Bold',
        textColor: { r: 1, g: 1, b: 1 },
        frameName: '活动规则标题容器'
      }
    );
    if (result) {
      NodeUtils.safeAppendChild(this.frame, result.container, '活动规则标题容器添加');
      this.currentY = result.newY;
    }
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
    contentText.lineHeight = { unit: 'AUTO' }; // 设置行高40px（与活动详情模块一致）
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



// ==================== 九宫格抽奖模块构建器 ====================

export class NineGridModuleBuilder {
  private frame: FrameNode;
  private content: NineGridContent; // 使用正确的类型
  private mainContainer: FrameNode; // 新增：主容器参数
  private readonly CELL_SIZE = 270; // 每个格子固定大小270x270px
  private readonly CELL_SPACING = 24; // 格子间距24px
  private currentY = 0; // 当前Y位置

  constructor(content: NineGridContent, mainContainer?: FrameNode) {
    this.content = content;
    // 如果没有传递主容器，创建一个临时容器用于查找
    this.mainContainer = mainContainer || NodeUtils.createFrame('临时容器', 1080, 1000);
    this.frame = NodeUtils.createFrame('九宫格抽奖', CONSTANTS.H5_WIDTH, 1000);
    this.frame.fills = []; // 背景填充为透明
  }

  async build(): Promise<FrameNode> {
    try {
      // 添加标题
      await this.addTitle();
      
      // 添加九宫格主体
      await this.addNineGrid();

      // 添加间距
      this.currentY += 90;

      // 创建我的奖品容器 - 父节点应为this.frame，查找样式用mainContainer
      await createButtonContainer(this.frame, this.mainContainer, {
        name: '我的奖品',
        text: '我的奖品',
        x: 102,
        y: this.currentY,
        width: 398,
        height: 112,
        textFontSize: 50
      });
      
      // 创建活动规则容器 - 父节点应为this.frame，查找样式用mainContainer
      await createButtonContainer(this.frame, this.mainContainer, {
        name: '活动规则',
        text: '活动规则',
        x: 580,
        y: this.currentY,
        width: 398,
        height: 112,
        textFontSize: 50
      });
      
      // 更新currentY以包含按钮高度
      this.currentY += 112;
      
      // 调整整个模块的高度
      this.adjustFrameHeight();
      
      return this.frame;
    } catch (error) {
      console.error('九宫格模块构建过程中出错：', error);
      throw error;
    }
  }

  // 添加九宫格标题
  private async addTitle(): Promise<void> {
    const result = await createTitleContainer(
      this.content.mainTitle,
      this.content.titleBgImage ?? undefined, // null转undefined，防止类型报错
      1080,
      120,
      this.currentY,
      {
        fontSize: 48,
        fontWeight: 'Bold',
        textColor: { r: 1, g: 1, b: 1 },
        frameName: '九宫格标题容器'
      }
    );
    if (result) {
      NodeUtils.safeAppendChild(this.frame, result.container, '九宫格标题容器添加');
      this.currentY = result.newY;
    }
  }

  // 添加九宫格主体
  private async addNineGrid(): Promise<void> {
    // 计算九宫格主体容器高度：3行格子 + 间距 + 上下边距
    const gridHeight = 3 * this.CELL_SIZE + 4 * this.CELL_SPACING + 180; // 上下各90px边距
    
    // 创建九宫格主体容器：1080宽，高度按创建成功后的高度来
    const gridContainer = NodeUtils.createFrame("九宫格主体", CONSTANTS.H5_WIDTH, gridHeight);
    gridContainer.x = 0;
    gridContainer.y = this.currentY + 90;
    gridContainer.fills = []; // 填充为透明

    // 添加九宫格背景图片节点（930x930px，上下左右居中对齐）
    if (this.content.gridBgImage) {
      try {
        const backgroundNode = await ImageNodeBuilder.insertImage(
          this.content.gridBgImage,
          "九宫格背景",
          930,
          930
        );
        
        if (backgroundNode) {
          backgroundNode.x = (CONSTANTS.H5_WIDTH - 930) / 2; // 水平居中
          backgroundNode.y = (gridHeight - 930) / 2; // 垂直居中
          NodeUtils.safeAppendChild(gridContainer, backgroundNode, '九宫格背景图片添加');
        }
      } catch (error) {
        console.error('九宫格背景图片创建失败:', error);
      }
    }

    // 创建九个格子容器
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const index = row * 3 + col;
        const cell = await this.createGridCell(row, col, index);
        NodeUtils.safeAppendChild(gridContainer, cell, `九宫格单元格${index + 1}添加`);
      }
    }

    NodeUtils.safeAppendChild(this.frame, gridContainer, '九宫格容器添加');
    this.currentY += gridHeight;
  }

  private async createGridCell(row: number, col: number, index: number): Promise<FrameNode> {
    // 计算九宫格总宽度：3个格子 + 2个间距
    const gridTotalWidth = 3 * this.CELL_SIZE + 2 * this.CELL_SPACING;
    
    // 计算格子位置：在H5_WIDTH容器中居中，加上90px上边距
    const startX = (CONSTANTS.H5_WIDTH - gridTotalWidth) / 2; // 在1080px容器中居中
    const x = startX + col * (this.CELL_SIZE + this.CELL_SPACING);
    const y = 90 + this.CELL_SPACING + row * (this.CELL_SIZE + this.CELL_SPACING); // 添加90px上边距

    // 中间位置创建抽奖按钮
    if (index === 4) {
      return this.createDrawButton(x, y);
    }

    // 其他位置创建奖品格子
    return this.createPrizeCell(x, y, index);
  }

  private async createDrawButton(x: number, y: number): Promise<FrameNode> {
    // 创建抽奖按钮容器（270x270px）
    const buttonFrame = NodeUtils.createFrame("抽奖按钮容器", this.CELL_SIZE, this.CELL_SIZE);
    buttonFrame.x = x;
    buttonFrame.y = y;
    buttonFrame.fills = []; // 容器填充为透明

    try {
      // 直接插入抽奖按钮图片节点
      if (this.content.drawButtonImage) {
        try {
          const buttonImage = await ImageNodeBuilder.insertImage(
            this.content.drawButtonImage,
            "抽奖按钮图片",
            this.CELL_SIZE,
            this.CELL_SIZE
          );
          
          if (buttonImage) {
            buttonImage.x = 0;
            buttonImage.y = 0;
            NodeUtils.safeAppendChild(buttonFrame, buttonImage, '抽奖按钮图片添加');
          } else {
            console.warn('抽奖按钮图片插入失败，使用默认样式');
            await this.addDefaultButtonStyle(buttonFrame);
          }
        } catch (error) {
          console.error('抽奖按钮图片创建失败：', error);
          await this.addDefaultButtonStyle(buttonFrame);
        }
      } else {
        // 默认按钮样式
        await this.addDefaultButtonStyle(buttonFrame);
      }
    } catch (error) {
      console.error('创建抽奖按钮失败：', error);
      await this.addDefaultButtonStyle(buttonFrame);
    }

    return buttonFrame;
  }

  private async addDefaultButtonStyle(buttonFrame: FrameNode): Promise<void> {
    // 默认按钮样式
    buttonFrame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.3, b: 0.3 })];
    buttonFrame.cornerRadius = 10;

    const buttonText = await NodeUtils.createText("抽奖", 24, 'Bold');
    buttonText.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    buttonText.resize(this.CELL_SIZE, buttonText.height);
    buttonText.textAlignHorizontal = "CENTER";
    buttonText.y = (this.CELL_SIZE - buttonText.height) / 2;
    NodeUtils.safeAppendChild(buttonFrame, buttonText, '抽奖按钮默认文本添加');
  }

  private async createPrizeCell(x: number, y: number, index: number): Promise<FrameNode> {
    // 🎯 修复奖品索引映射 - 前端3-2-3布局到后端3x3九宫格的正确映射
    // 前端HTML结构（按index 0-7顺序）：
    // 第一行3个：奖品01(0), 奖品02(1), 奖品03(2)
    // 第二行2个：奖品04(3), 奖品05(4)  
    // 第三行3个：奖品06(5), 奖品07(6), 谢谢参与(7)
    // 
    // 后端九宫格位置(row*3+col)：
    // 0  1  2
    // 3  4  5   (位置4是抽奖按钮)
    // 6  7  8
    //
    // 正确映射关系：九宫格位置 → 前端奖品索引
    // 0→0, 1→1, 2→2, 3→3, 5→4, 6→5, 7→6, 8→7
    let prizeIndex: number;
    
    if (index <= 3) {
      // 位置0,1,2,3直接对应前端奖品0,1,2,3 (奖品01,02,03,04)
      prizeIndex = index;
    } else if (index === 4) {
      // 位置4是抽奖按钮，不应该调用此方法
      throw new Error('位置4是抽奖按钮位置，不应创建奖品格子');
    } else if (index === 5) {
      // 位置5对应前端奖品4 (奖品05)
      prizeIndex = 4;
    } else if (index === 6) {
      // 位置6对应前端奖品5 (奖品06)
      prizeIndex = 5;
    } else if (index === 7) {
      // 位置7对应前端奖品6 (奖品07)
      prizeIndex = 6;
    } else if (index === 8) {
      // 位置8对应前端奖品7 (谢谢参与)
      prizeIndex = 7;
    } else {
      throw new Error(`无效的九宫格位置: ${index}`);
    }
    
    const prize = this.content.prizes?.[prizeIndex];
    
    // 🎯 修复奖品名称显示逻辑，与前端保持一致
    let defaultPrizeName: string;
    if (prizeIndex === 7) {
      // 第8个奖品（索引7）显示"谢谢参与"
      defaultPrizeName = "谢谢参与";
    } else {
      // 其他奖品显示"奖品01"到"奖品07"（从1开始计数，使用两位数格式）
      const prizeNumber = (prizeIndex + 1).toString().padStart(2, '0');
      defaultPrizeName = `奖品${prizeNumber}`;
    }
    
    const prizeName = prize?.name || defaultPrizeName;
    
    // 添加详细调试日志，帮助验证映射正确性
    console.log(`🎯 [奖品映射调试] 九宫格位置${index} → 奖品索引${prizeIndex} → "${prizeName}" (默认: "${defaultPrizeName}")`);
        
    // 创建奖品容器（270x270px）
    const prizeBox = NodeUtils.createFrame(prizeName, this.CELL_SIZE, this.CELL_SIZE);
    prizeBox.x = x;
    prizeBox.y = y;
    prizeBox.fills = []; // 容器填充为透明

    try {
      // 直接插入奖品背景图片节点（270x270px）
      if (this.content.prizeBgImage) {
        try {
          const prizeBgImage = await ImageNodeBuilder.insertImage(
            this.content.prizeBgImage,
            "奖品背景图片",
            this.CELL_SIZE,
            this.CELL_SIZE
          );
          
          if (prizeBgImage) {
            prizeBgImage.x = 0;
            prizeBgImage.y = 0;
            NodeUtils.safeAppendChild(prizeBox, prizeBgImage, '奖品背景图片添加');
          }
        } catch (error) {
          console.error('奖品背景图片创建失败:', error);
        }
      }

      // 插入奖品图图片节点（180x180px，坐标为x45px，y11px）
      if (prize?.image) {
        try {
          const prizeImage = await ImageNodeBuilder.insertImage(
            prize.image,
            "奖品图片",
            180,
            180
          );
          
          if (prizeImage) {
            prizeImage.x = 45;
            prizeImage.y = 11;
            NodeUtils.safeAppendChild(prizeBox, prizeImage, '奖品图片添加');
          }
        } catch (error) {
          console.error('奖品图片创建失败:', error);
          // 如果奖品图片创建失败，添加占位符
          const placeholder = NodeUtils.createFrame("占位符", 180, 180);
          placeholder.x = 45;
          placeholder.y = 11;
          placeholder.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
          placeholder.cornerRadius = 10;
          NodeUtils.safeAppendChild(prizeBox, placeholder, '奖品占位符添加');
        }
      } else {
        // 如果没有奖品图片，添加占位符
        const placeholder = NodeUtils.createFrame("占位符", 180, 180);
        placeholder.x = 45;
        placeholder.y = 11;
        placeholder.fills = [ColorUtils.createSolidFill({ r: 0.9, g: 0.9, b: 0.9 })];
        placeholder.cornerRadius = 10;
        NodeUtils.safeAppendChild(prizeBox, placeholder, '奖品默认占位符添加');
      }

      // 插入文本节点（大小26，Medium，居中对齐，距离容器顶部190px）
      const displayName = prize?.name || prizeName;
      if (displayName) {
        const prizeText = await NodeUtils.createText(displayName, 26, 'Medium');
        prizeText.resize(this.CELL_SIZE, prizeText.height);
        prizeText.textAlignHorizontal = "CENTER";
        prizeText.x = 0;
        prizeText.y = 190;
        prizeText.fills = [ColorUtils.createSolidFill({ r: 0, g: 0, b: 0 })]; // 设置黑色文字
        NodeUtils.safeAppendChild(prizeBox, prizeText, '奖品名称文本添加');
      }
    } catch (error) {
      console.error(`创建奖品格子失败 ${prizeIndex}:`, error);
    }

    return prizeBox;
  }

  private adjustFrameHeight(): void {
    this.frame.resize(CONSTANTS.H5_WIDTH, this.currentY + 90);
  }
}



// ==================== 图片轮播（横版）模块构建器 ====================

// 图片轮播（横版）模块构建器类
export class CarouselModuleBuilder {
  private frame: FrameNode;
  private content: CarouselContent;
  
  // 根据Figma设计的精确尺寸
  private readonly CAROUSEL_AREA_HEIGHT = 607; // 轮播区域高度
  private readonly CAROUSEL_BG_WIDTH = 1000;   // 轮播图背景宽度
  private readonly CAROUSEL_BG_HEIGHT = 540;   // 轮播图背景高度
  private readonly CAROUSEL_IMAGE_WIDTH = 960;  // 轮播图宽度
  private readonly CAROUSEL_IMAGE_HEIGHT = 500; // 轮播图高度
  private readonly BUTTON_HEIGHT = 20;         // 轮播按钮高度

  constructor(frame: FrameNode, content: CarouselContent) {
    this.frame = frame;
    this.content = content;
  }

  async build(): Promise<void> {
    console.log('开始构建图片轮播（横版）模块');
    
    try {
      // 设置自动布局
      this.setupFrameLayout();
      
      // 添加标题容器
      await this.addTitleContainer();
      // 添加轮播预览区域
      await this.addCarouselPreview();
      
      console.log('图片轮播（横版）模块构建完成');
    } catch (error) {
      console.error('图片轮播（横版）模块构建过程中出错：', error);
      throw error;
    }
  }

  // 设置框架布局 - 按Figma设计：垂直布局，间距30px，内边距90px
  private setupFrameLayout(): void {
    NodeUtils.setupAutoLayout(this.frame, 'VERTICAL', 30, 90);
  }

  // 添加标题容器
  private async addTitleContainer(): Promise<void> {
    if (!this.content.title && !this.content.titleBackground) return;
  
    console.log('添加标题容器 - 1080x120px');
  
    const result = await createTitleContainer(
      this.content.title,
      this.content.titleBackground ?? undefined,
      1080,
      120,
      0, // 假设有currentY用于布局链
      {
        fontSize: 48,
        fontWeight: 'Bold',
        textColor: { r: 1, g: 1, b: 1 },
        frameName: '标题容器'
      }
    );
    if (result) {
      NodeUtils.safeAppendChild(this.frame, result.container, '标题容器添加');
    }
  }

  // 添加轮播预览区域 - 精确按Figma设计实现
  private async addCarouselPreview(): Promise<void> {
    console.log('添加轮播预览区域');

    // 创建轮播预览容器
    const carouselPreview = NodeUtils.createFrame("轮播图预览", 1080, this.CAROUSEL_AREA_HEIGHT);
    carouselPreview.fills = []; // 透明背景
    NodeUtils.setupAutoLayout(carouselPreview, 'VERTICAL', 0, 0);

    // 添加轮播区域
    await this.addCarouselArea(carouselPreview);
    
    // 添加轮播按钮
    await this.addCarouselButtons(carouselPreview);

    NodeUtils.safeAppendChild(this.frame, carouselPreview, '轮播预览区域添加');
  }

  // 添加轮播区域 - 包含轮播图背景和轮播图
  private async addCarouselArea(parent: FrameNode): Promise<void> {
    console.log('添加轮播区域 - 1080x607px');

    // 创建轮播区域容器
    const carouselArea = NodeUtils.createFrame("轮播区域", 1080, this.CAROUSEL_AREA_HEIGHT);
    carouselArea.fills = []; // 透明背景

    // 添加轮播图背景 - 1000x540px，白色，居中
    const carouselBg = NodeUtils.createFrame("轮播图背景", this.CAROUSEL_BG_WIDTH, this.CAROUSEL_BG_HEIGHT);
    
    if (this.content.carouselBackground) {
      // 使用用户上传的背景图片
      try {
        const bgImage = await ImageNodeBuilder.insertImage(
          this.content.carouselBackground,
          "轮播图背景图片",
          this.CAROUSEL_BG_WIDTH,
          this.CAROUSEL_BG_HEIGHT
        );
        
        if (bgImage) {
          bgImage.x = 0;
          bgImage.y = 0;
          NodeUtils.safeAppendChild(carouselBg, bgImage, '轮播图背景图片添加');
        }
      } catch (error) {
        console.error('轮播图背景图片创建失败:', error);
        // 失败时使用默认白色背景
        carouselBg.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
      }
    } else {
      // 默认白色背景
      carouselBg.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
    }

    // 轮播图背景居中定位
    carouselBg.x = (1080 - this.CAROUSEL_BG_WIDTH) / 2; // 水平居中
    carouselBg.y = (this.CAROUSEL_AREA_HEIGHT - this.CAROUSEL_BG_HEIGHT) / 2 + 0.5; // 垂直居中偏移0.5px

    NodeUtils.safeAppendChild(carouselArea, carouselBg, '轮播图背景添加');

    // 添加轮播图 - 960x500px，居中在背景上
    if (this.content.carouselImage) {
      try {
        const carouselImageNode = await ImageNodeBuilder.insertImage(
          this.content.carouselImage,
          "轮播图",
          this.CAROUSEL_IMAGE_WIDTH,
          this.CAROUSEL_IMAGE_HEIGHT
        );

        if (carouselImageNode) {
          // 轮播图居中定位
          carouselImageNode.x = (1080 - this.CAROUSEL_IMAGE_WIDTH) / 2; // 水平居中
          carouselImageNode.y = (this.CAROUSEL_AREA_HEIGHT - this.CAROUSEL_IMAGE_HEIGHT) / 2 + 0.5; // 垂直居中偏移0.5px
          
          NodeUtils.safeAppendChild(carouselArea, carouselImageNode, '轮播图添加');
        }
      } catch (error) {
        console.error('轮播图创建失败:', error);
        // 创建红色占位矩形
        const placeholder = figma.createRectangle();
        placeholder.name = "轮播图";
        placeholder.resize(this.CAROUSEL_IMAGE_WIDTH, this.CAROUSEL_IMAGE_HEIGHT);
        placeholder.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.3, b: 0.3 })]; // 红色占位
        placeholder.x = (1080 - this.CAROUSEL_IMAGE_WIDTH) / 2;
        placeholder.y = (this.CAROUSEL_AREA_HEIGHT - this.CAROUSEL_IMAGE_HEIGHT) / 2 + 0.5;
        
        NodeUtils.safeAppendChild(carouselArea, placeholder, '轮播图占位添加');
      }
    }

    NodeUtils.safeAppendChild(parent, carouselArea, '轮播区域添加');
  }

  // 添加轮播按钮 - 按Figma设计：5个圆形按钮，第一个为长椭圆
  private async addCarouselButtons(parent: FrameNode): Promise<void> {
    console.log('添加轮播按钮');

    // 创建轮播按钮容器
    const buttonsContainer = NodeUtils.createFrame("轮播按钮", 300, this.BUTTON_HEIGHT);
    buttonsContainer.fills = []; // 透明背景
    NodeUtils.setupAutoLayout(buttonsContainer, 'HORIZONTAL', 24, 0); // 水平布局，间距24px

    // 第一个按钮 - 长椭圆形，活跃状态
    const activeButton = figma.createEllipse();
    activeButton.name = "活跃按钮";
    activeButton.resize(60, this.BUTTON_HEIGHT);
    activeButton.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })]; // 白色填充
    NodeUtils.safeAppendChild(buttonsContainer, activeButton, '活跃按钮添加');

    // 其他4个按钮 - 圆形，非活跃状态
    for (let i = 1; i < 5; i++) {
      const button = figma.createEllipse();
      button.name = `按钮${i + 1}`;
      button.resize(this.BUTTON_HEIGHT, this.BUTTON_HEIGHT);
      button.fills = []; // 透明填充
      button.strokes = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })]; // 白色边框
      button.strokeWeight = 2;
      
      NodeUtils.safeAppendChild(buttonsContainer, button, `按钮${i + 1}添加`);
    }

    // 按钮容器居中
    buttonsContainer.x = (1080 - buttonsContainer.width) / 2;

    NodeUtils.safeAppendChild(parent, buttonsContainer, '轮播按钮容器添加');
  }
}

// ==================== 活动详情模块构建器 ====================

export class ActivityContentBuilder {
  private frame: FrameNode;
  private content: ActivityContentData;

  constructor(frame: FrameNode, content: ActivityContentData) {
    this.frame = frame;
    this.content = content;
  }

  async build(): Promise<void> {
    console.log('开始构建活动详情模块');
    
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
      
      // 调整整个模块的高度
      this.adjustFrameHeight();
      
      console.log('活动详情模块构建完成');
    } catch (error) {
      console.error('活动详情模块构建过程中出错：', error);
      throw error;
    }
  }

  // 设置自动布局
  private setupAutoLayout(): void {
    NodeUtils.setupAutoLayout(this.frame, 'VERTICAL', 60, 90); // 垂直布局，间距60px，上下边距90px
  }

  // 添加大标题
  private async addMainTitle(): Promise<number | undefined> {
    // 如果没有大标题背景或大标题文本，则不创建大标题容器
    if (!this.content.mainTitleBg || !this.content.mainTitle) return;
  
    console.log('添加大标题...');
  
    const result = await createTitleContainer(
      this.content.mainTitle,
      this.content.mainTitleBg ?? undefined,
      1080,
      120,
      0, // 没有currentY，直接传0
      {
        fontSize: 48,
        fontWeight: 'Bold',
        textColor: { r: 1, g: 1, b: 1 },
        frameName: '活动内容大标题容器'
      }
    );
    if (result) {
      NodeUtils.safeAppendChild(this.frame, result.container, '活动内容标题容器添加');
      // 如有后续内容需要链式布局，可用 result.newY
      return result.newY;
    }
    return;
  }

  // 添加小标题
  private async addSubTitle(startY: number = 0): Promise<void> {
    // 如果没有小标题背景或小标题文本，则不创建小标题容器
    if (!this.content.subTitleBg || !this.content.subTitle) return;
  
    console.log('添加小标题...');
  
    const result = await createTitleContainer(
      this.content.subTitle,
      this.content.subTitleBg ?? undefined,
      1080,
      100,
      startY, // 让小标题紧贴大标题容器
      {
        fontSize: 44,
        fontWeight: 'Medium',
        textColor: { r: 1, g: 1, b: 1 },
        frameName: '活动内容小标题容器'
      }
    );
    if (result) {
      NodeUtils.safeAppendChild(this.frame, result.container, '小标题容器添加');
    }
  }

  // 添加正文
  private async addTextContent(): Promise<void> {
    // 如果没有输入内容，则不创建
    if (!this.content.text) return;

    console.log('添加正文...');

    // 直接插入正文文本节点，宽度为950，高度按实际输入内容
    const textNode = await NodeUtils.createText(this.content.text, 40, 'Regular');
    textNode.resize(950, textNode.height);
    textNode.textAlignHorizontal = "CENTER"; // 设置文本水平居中对齐
    textNode.lineHeight = { unit: 'AUTO' }; // 自动行高
    textNode.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })]; // 设置文字颜色为白色

    // 将文本节点安全地添加到框架中
    NodeUtils.safeAppendChild(this.frame, textNode, '活动内容正文添加');
  }

  // 添加插图
  private async addImage(): Promise<void> {
    // 如果没有上传图片，则不插入图片节点
    if (!this.content.image) return;

    console.log('添加插图...');

    try {
      // 直接插入插图图片节点至活动内容模块容器，宽度为950
      const imageNode = await ImageNodeBuilder.insertImage(
        this.content.image,
        "活动内容插图",
        950,
        600 // 默认高度，会根据实际图片调整
      );
      
      if (imageNode) {
        NodeUtils.safeAppendChild(this.frame, imageNode, '活动内容插图添加');
      }
    } catch (error) {
      console.error('插图创建失败:', error);
    }
  }

  // 调整整个模块的高度
  private adjustFrameHeight(): void {
    // 自动布局会自动调整高度，无需手动设置
    // 框架会根据内容自动调整到合适的高度
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
    // 如果没有标题图片且没有标题文本，则不创建标题容器
    if (!this.content.title && !this.content.titleImage) return;
  
    const result = await createTitleContainer(
      this.content.title,                // 标题文本
      this.content.titleImage ?? undefined,           // 标题背景（图片）
      1080,                                           // 宽度
      120,                                            // 高度
      0,                                              // currentY
      {
        fontSize: 48,
        fontWeight: 'Bold',
        textColor: { r: 1, g: 1, b: 1 },
        frameName: '标题容器'
      }
    );
    if (result) {
      NodeUtils.safeAppendChild(this.frame, result.container, '标题容器添加');
      // 如有后续内容需要链式布局，可用 result.newY
    }
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

    // 添加标题容器
    if (this.content.titleImage || this.content.title) {
      const result = await createTitleContainer(
        this.content.title,      // 标题文本
        this.content.titleImage ?? undefined, // 标题背景（图片）
        1080,                                 // 宽度
        120,                                  // 高度
        currentY,                            // 当前Y坐标
        {
          fontSize: 48,                      // 可根据UI风格调整
          fontWeight: 'Bold',
          textColor: { r: 1, g: 1, b: 1 },
          frameName: '标题容器'
        }
      );
      if (result) {
        NodeUtils.safeAppendChild(this.frame, result.container, '标题容器添加');
        currentY = result.newY;
      }
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

// ==================== 图片轮播（竖版）模块构建器 ====================

export class VerticalCarouselModuleBuilder {
  private frame: FrameNode;
  private content: VerticalCarouselContent;

  // 布局常量
  private readonly TITLE_HEIGHT = 120;                // 标题容器高度
  private readonly CAROUSEL_AREA_HEIGHT = 1285;       // 轮播区域高度
  private readonly MAIN_IMAGE_WIDTH = 554;            // 主图宽度
  private readonly MAIN_IMAGE_HEIGHT = 1097;          // 主图高度
  private readonly SIDE_IMAGE_WIDTH = 247;            // 侧边图片宽度
  private readonly SIDE_IMAGE_HEIGHT = 533;           // 侧边图片高度
  private readonly IMAGE_SPACING = 20;                // 图片间距
  private readonly CAROUSEL_BUTTON_HEIGHT = 16;       // 轮播按钮高度

  constructor(frame: FrameNode, content: VerticalCarouselContent) {
    this.frame = frame;
    this.content = content;
  }

  async build(): Promise<void> {
    console.log('开始构建图片轮播（竖版）模块');
    
    try {
      // 设置框架布局
      this.setupFrameLayout();
      
      // 添加标题容器
      await this.addTitleContainer();
      
      // 添加轮播预览
      await this.addCarouselPreview();
      
      console.log('✅ 图片轮播（竖版）模块构建成功');
    } catch (error) {
      console.error('❌ 图片轮播（竖版）模块构建失败:', error);
      
      // 创建错误信息框
      const errorFrame = NodeUtils.createFrame("构建错误", 1080, 200);
      errorFrame.fills = [ColorUtils.createSolidFill({ r: 1, g: 0.8, b: 0.8 })];
      const errorText = await NodeUtils.createText(`构建失败: ${error}`, 24, 'Regular');
      errorText.fills = [ColorUtils.createSolidFill({ r: 0.8, g: 0, b: 0 })];
      NodeUtils.safeAppendChild(errorFrame, errorText, '错误信息添加');
      NodeUtils.safeAppendChild(this.frame, errorFrame, '错误信息框添加');
      
      throw error;
    }
  }

  // 设置框架布局
  private setupFrameLayout(): void {
    this.frame.name = "图片轮播（竖版）";
    this.frame.resize(1080, this.TITLE_HEIGHT + this.CAROUSEL_AREA_HEIGHT);
    this.frame.fills = []; // 透明背景
  }

  // 添加标题容器
  private async addTitleContainer(): Promise<void> {
    console.log('添加轮播标题容器...');
  
    const result = await createTitleContainer(
      this.content.title ?? undefined,             // 标题文本
      this.content.titleBackground ?? undefined,   // 标题背景图片
      1080,                                       // 宽度
      120,                                        // 高度
      0,                                          // currentY
      {
        fontSize: 48,
        fontWeight: 'Bold',
        textColor: { r: 1, g: 1, b: 1 },
        frameName: '轮播标题容器'
      }
    );
    if (result) {
      NodeUtils.safeAppendChild(this.frame, result.container, '标题容器添加');
      // 如有后续内容需要链式布局，可用 result.newY
    }
  }

  // 添加轮播预览
  private async addCarouselPreview(): Promise<void> {
    console.log('添加轮播预览区域...');
    
    const carouselContainer = NodeUtils.createFrame("轮播预览容器", 1080, this.CAROUSEL_AREA_HEIGHT);
    carouselContainer.x = 0;
    carouselContainer.y = this.TITLE_HEIGHT;
    carouselContainer.fills = []; // 透明背景

    // 添加轮播图片布局
    await this.addCarouselLayout(carouselContainer);
    
    // 添加轮播按钮
    await this.addCarouselButtons(carouselContainer);

    NodeUtils.safeAppendChild(this.frame, carouselContainer, '轮播预览容器添加');
  }

  // 添加轮播图片布局
  private async addCarouselLayout(parent: FrameNode): Promise<void> {
    console.log('添加轮播图片布局...');
    
    // 计算布局位置
    const totalWidth = this.MAIN_IMAGE_WIDTH + this.IMAGE_SPACING + this.SIDE_IMAGE_WIDTH;
    const startX = (1080 - totalWidth) / 2;
    const imageY = (this.CAROUSEL_AREA_HEIGHT - this.CAROUSEL_BUTTON_HEIGHT - this.MAIN_IMAGE_HEIGHT) / 2;

    // 添加主图 (carouselImages[0])
    if (this.content.carouselImages[0]) {
      try {
        const mainImage = await ImageNodeBuilder.insertImage(
          this.content.carouselImages[0],
          "轮播主图",
          this.MAIN_IMAGE_WIDTH,
          this.MAIN_IMAGE_HEIGHT
        );
        
        if (mainImage) {
          mainImage.x = startX;
          mainImage.y = imageY;
          NodeUtils.safeAppendChild(parent, mainImage, '轮播主图添加');
        }
      } catch (error) {
        console.error('轮播主图创建失败:', error);
      }
    }

    // 添加右侧图片容器 (carouselImages[1])
    const rightContainer = NodeUtils.createFrame("右侧图片容器", this.SIDE_IMAGE_WIDTH, this.MAIN_IMAGE_HEIGHT);
    rightContainer.x = startX + this.MAIN_IMAGE_WIDTH + this.IMAGE_SPACING;
    rightContainer.y = imageY;
    rightContainer.fills = []; // 透明背景

    // 右上图片
    if (this.content.carouselImages[1]) {
      try {
        const rightTopImage = await ImageNodeBuilder.insertImage(
          this.content.carouselImages[1],
          "轮播右上图",
          this.SIDE_IMAGE_WIDTH,
          this.SIDE_IMAGE_HEIGHT
        );
        
        if (rightTopImage) {
          rightTopImage.x = 0;
          rightTopImage.y = 0;
          NodeUtils.safeAppendChild(rightContainer, rightTopImage, '轮播右上图添加');
        }
      } catch (error) {
        console.error('轮播右上图创建失败:', error);
      }
    }

    // 右下图片 (carouselImages[2])
    if (this.content.carouselImages[2]) {
      try {
        const rightBottomImage = await ImageNodeBuilder.insertImage(
          this.content.carouselImages[2],
          "轮播右下图",
          this.SIDE_IMAGE_WIDTH,
          this.SIDE_IMAGE_HEIGHT
        );
        
        if (rightBottomImage) {
          rightBottomImage.x = 0;
          rightBottomImage.y = this.SIDE_IMAGE_HEIGHT + this.IMAGE_SPACING;
          NodeUtils.safeAppendChild(rightContainer, rightBottomImage, '轮播右下图添加');
        }
      } catch (error) {
        console.error('轮播右下图创建失败:', error);
      }
    }

    NodeUtils.safeAppendChild(parent, rightContainer, '右侧图片容器添加');
  }

  // 添加轮播按钮
  private async addCarouselButtons(parent: FrameNode): Promise<void> {
    console.log('添加轮播按钮...');
    
    const buttonContainer = NodeUtils.createFrame("轮播按钮容器", 120, this.CAROUSEL_BUTTON_HEIGHT);
    buttonContainer.x = (1080 - 120) / 2;
    buttonContainer.y = this.CAROUSEL_AREA_HEIGHT - this.CAROUSEL_BUTTON_HEIGHT - 20;
    buttonContainer.fills = []; // 透明背景

    // 创建3个轮播按钮
    for (let i = 0; i < 3; i++) {
      const button = figma.createEllipse();
      button.name = `轮播按钮${i + 1}`;
      button.resize(this.CAROUSEL_BUTTON_HEIGHT, this.CAROUSEL_BUTTON_HEIGHT);
      button.x = i * (this.CAROUSEL_BUTTON_HEIGHT + 10);
      button.y = 0;
      
      // 第一个按钮设为激活状态（白色），其他为非激活状态（半透明白色）
      if (i === 0) {
        button.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 })];
      } else {
        button.fills = [ColorUtils.createSolidFill({ r: 1, g: 1, b: 1 }, 0.5)];
      }
      
      NodeUtils.safeAppendChild(buttonContainer, button, `轮播按钮${i + 1}添加`);
    }

    NodeUtils.safeAppendChild(parent, buttonContainer, '轮播按钮容器添加');
  }
}

