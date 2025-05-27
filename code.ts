// 这个文件实现了渠道美术-H5延展工具的核心逻辑
/// <reference types="@figma/plugin-typings" />

// 常量定义
const MODULE_WIDTH = 950;   // 模块宽度，减小以适应更小的界面

// 创建一个接口以定义H5原型的配置内容
interface H5Config {
  // 基础设置
  pageTitle: string;             // 页面标题
  pageBgColor: string;           // 页面底色
  pageBgImage: Uint8Array | null;// 页面背景图
  
  // 头图设置
  headerImage: Uint8Array | null;// 头图
  
  // 游戏设置
  gameIcon: Uint8Array | null;   // 游戏图标
  gameName: string;              // 游戏名称
  gameDesc: string;              // 游戏描述
  buttonVersion: string;         // 按钮版本
  buttonText: string;            // 按钮文本
  buttonBgColor: string;         // 按钮底色
  
  // 自定义模块列表
  modules: Module[];
  
  // 活动规则
  rulesTitle: string;            // 规则标题
  rulesBgImage: Uint8Array | null;// 规则标题背景
  rulesContent: string;          // 规则内容
  
  // 尾版
  footerLogo: Uint8Array | null; // 尾版LOGO
  footerBg: Uint8Array | null;   // 尾版背景
}

// 定义模块接口
interface Module {
  id: string;                    // 模块唯一ID
  type: string;                  // 模块类型
  title: string;                 // 模块标题
  content: ActivityRulesContent | SignInContent | CollectCardsContent | NineGridContent;  // 模块内容（根据类型不同而不同）
}


// 九宫格抽奖模块配置
interface NineGridContent {
  mainTitle: string;              // 大标题
  titleBgImage: Uint8Array | null;// 大标题背景
  gridBgImage: Uint8Array | null; // 九宫格背景
  drawButtonImage: Uint8Array | null; // 抽奖按钮
  prizeBgImage: Uint8Array | null;// 奖品背景
  prizes: PrizeItem[];            // 奖品列表（最多9个）
}

// 签到模块配置
interface SignInContent {
  titleImage: Uint8Array | null;  // 标题图片
  bgImage: Uint8Array | null;     // 背景图片
  daysCount: number;              // 签到天数
  dayIcon: Uint8Array | null;     // 日期图标
  signButton: Uint8Array | null;  // 签到按钮
}

// 集卡模块配置
interface CollectCardsContent {
  titleImage: Uint8Array | null;  // 集卡标题
  bgImage: Uint8Array | null;     // 背景图片
  cardsCount: number;             // 卡片数量
  cardStyle: string;              // 卡片样式 style1(方形), style2(圆角), style3(自定义)
  cardBg: Uint8Array | null;      // 卡片背景
  combineButton: Uint8Array | null;// 合成按钮
}

// 奖品项
interface PrizeItem {
  image: Uint8Array | null;       // 奖品图片
  name: string;                   // 奖品名称
}

// 活动内容模块配置
interface ActivityRulesContent {
  mainTitle: string;              // 大标题
  mainTitleBg: Uint8Array | null; // 大标题背景
  subTitle: string;               // 小标题
  subTitleBg: Uint8Array | null;  // 小标题背景
  text: string;                   // 正文内容
  image: Uint8Array | null;       // 图片
}

// 统一加载常用字体函数定义
async function loadCommonFonts(): Promise<void> {
  const fonts = [
    { family: "Inter", style: "Regular" },
    { family: "Inter", style: "Medium" }, 
    { family: "Inter", style: "Bold" }
  ] as const;

  // 逐个加载字体，确保单个字体失败不影响其他字体
  const loadPromises = fonts.map(async (font) => {
    try {
      await figma.loadFontAsync(font);
      return { success: true, font };
    } catch (error) {
      return { success: false, font, error };
    }
  });

  // 等待所有字体加载完成（无论成功还是失败）
  const results = await Promise.all(loadPromises);
  
  // 统计加载结果
  const failureCount = results.filter(result => !result.success).length;
  
  // 如果有字体加载失败，记录但不阻塞插件运行
  if (failureCount > 0) {
    // 部分字体加载失败，但插件将继续运行
  }
}

// 主函数
figma.showUI(__html__, { 
  width: 360, 
  height: 700,  // 增加高度以显示更多内容
  themeColors: true 
});

// 设置一些初始数据
const initialData = {
  version: '1.0.0',
  moduleTypes: [
    { id: 'nineGrid', name: '九宫格抽奖' },
    { id: 'signIn', name: '每日签到' },
    { id: 'collectCards', name: '集卡活动' },
    { id: 'activityRules', name: '活动内容' }
  ]
};

// 初始化UI
figma.ui.postMessage({ 
  type: 'init',
  data: initialData
});

// 处理来自UI的消息
interface PluginMessage {
  type: string;
  config?: H5Config;
  [key: string]: unknown; // 允许其他任意属性
}

figma.ui.onmessage = async (msg: PluginMessage) => {
  // 当接收到创建原型的消息
  if (msg.type === 'create-prototype') {
    try {
      // 接收到创建原型请求
      
      // 检查 config 是否有效
      if (!msg.config) {
        throw new Error('配置数据为空');
      }

      // 预加载常用字体并捕获任何可能的错误
      try {
        await loadCommonFonts();
      } catch (fontError) {
        // 加载字体时出错，但继续执行
        // 继续执行，个别字体问题可能不是致命的
      }

      // 创建H5原型
      await createH5Prototype(msg.config as H5Config);
      
      // 通知UI创建成功
      figma.ui.postMessage({ 
        type: 'creation-success',
        message: '原型创建成功！'
      });
    } catch (error) {
      // 创建原型时出错，通过UI消息通知用户
      
      // 通知UI创建失败
      figma.ui.postMessage({ 
        type: 'creation-error',
        message: `创建失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  }
  
  // 处理保存配置的消息
  else if (msg.type === 'save-config') {
    try {
      // 这里可以添加保存配置到客户端存储的代码
      figma.clientStorage.setAsync('h5-config', JSON.stringify(msg.config))
        .then(() => {
          figma.ui.postMessage({
            type: 'save-success',
            message: '配置已保存'
          });
        })
        .catch((err: Error) => {
          figma.ui.postMessage({
            type: 'save-error',
            message: `保存失败: ${err.message || '未知错误'}`
          });
        });
    } catch (error) {
      // 保存配置时出错，通过UI消息通知用户
      figma.ui.postMessage({
        type: 'save-error',
        message: `保存失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  }
  
  // 处理加载配置的消息
  else if (msg.type === 'load-config') {
    try {
      figma.clientStorage.getAsync('h5-config')
        .then((configStr: string) => {
          const config = configStr ? JSON.parse(configStr) : null;
          figma.ui.postMessage({
            type: 'load-config-success',
            config: config
          });
        })
        .catch((err: Error) => {
          figma.ui.postMessage({
            type: 'load-config-error',
            message: `加载配置失败: ${err.message || '未知错误'}`
          });
        });
    } catch (error) {
      // 加载配置时出错，通过UI消息通知用户
      figma.ui.postMessage({
        type: 'load-config-error',
        message: `加载配置失败: ${error instanceof Error ? error.message : '未知错误'}`
      });
    }
  }
  
  // 处理关闭插件的消息
  else if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};

// 创建H5原型的函数
async function createH5Prototype(config: H5Config) {
  try {
    // 设置常量
    const H5_WIDTH = 1080;      // H5画板宽度
    const PADDING = 0;         // 内边距
    
    // 预先加载常用字体，避免后续文本操作失败
    await loadCommonFonts();
    
    // 创建页面和画布
    const currentPage = figma.currentPage;
    
    // 创建外层背景画板
    const outerFrame = figma.createFrame();
    outerFrame.name = `H5原型`;
    outerFrame.resize(H5_WIDTH, 100); // 宽度设置为1080，高度暂时设置为100，后面会根据内容调整
    
    // 设置外层背景
    if (config.pageBgImage) {
      // 如果配置中有背景图片，创建图片填充
      const bgFill = await createImageFill(config.pageBgImage);
      outerFrame.fills = [bgFill];
    } else if (config.pageBgColor) {
      // 如果配置中有背景颜色，创建纯色填充
      outerFrame.fills = [{
        type: 'SOLID',
        color: hexToRgb(config.pageBgColor)
      }];
    } else {
      // 如果没有指定背景图片或背景颜色，则使用默认的白色背景
      outerFrame.fills = [{
        type: 'SOLID',
        color: { r: 255, g: 255, b: 255 } // 设置为白色（RGB值：255,255,255）
      }];
    }
    
    // 创建主H5画板
    const h5Frame = figma.createFrame();
    h5Frame.name = '自适应模块';  // 设置画板名称
    h5Frame.resize(H5_WIDTH, 100);  // 设置画板宽度为H5_WIDTH，高度暂时设为100（后续会根据内容调整）
    h5Frame.x = 0;  // 设置画板的水平位置
    h5Frame.y = 0;  // 设置画板的垂直位置
    
    // 添加自动布局属性
    h5Frame.layoutMode = "VERTICAL";  // 设置为垂直自动布局
    h5Frame.primaryAxisSizingMode = "AUTO";  // 主轴(垂直方向)尺寸随内容自动调整
    h5Frame.counterAxisSizingMode = "FIXED";  // 副轴(水平方向)尺寸固定
    h5Frame.itemSpacing = 0;  // 初始组件间距为0，后面会根据需要为各组件添加间距
    h5Frame.paddingTop = 0;
    h5Frame.paddingBottom = 0;
    h5Frame.paddingLeft = 0;
    h5Frame.paddingRight = 0;
    
    // 设置H5背景为白色
    h5Frame.fills = [{
      type: 'SOLID',
      color: { r: 1, g: 1, b: 1 }
    }];
    
    // 添加H5画板到外层画板
    outerFrame.appendChild(h5Frame);
    
    // 1. 添加头图模块
    if (config.headerImage) {
      const headerFrame = await createHeaderModule(config.headerImage);
      // 设置为自适应宽度
      headerFrame.layoutAlign = "STRETCH";
      h5Frame.appendChild(headerFrame);
    }
    
    // 2. 添加游戏信息模块
    if (config.gameName || config.gameDesc || config.gameIcon) {
      const gameInfoFrame = await createGameInfoModule(config);
      // 设置模块水平居中
      gameInfoFrame.layoutAlign = "CENTER";
      // 添加上下间距
      const spacerBefore = figma.createFrame();
      spacerBefore.name = "间距";
      spacerBefore.resize(1, PADDING);
      spacerBefore.fills = [];
      h5Frame.appendChild(spacerBefore);
      
      h5Frame.appendChild(gameInfoFrame);
      
      const spacerAfter = figma.createFrame();
      spacerAfter.name = "间距";
      spacerAfter.resize(1, PADDING);
      spacerAfter.fills = [];
      h5Frame.appendChild(spacerAfter);
    }
    
    // 3. 添加自定义模块
    if (config.modules && config.modules.length > 0) {
      for (const module of config.modules) {
        const moduleFrame = await createCustomModule(module);
        // 设置模块水平居中
        moduleFrame.layoutAlign = "CENTER";
        
        // 添加间距
        const spacerBefore = figma.createFrame();
        spacerBefore.name = "间距";
        spacerBefore.resize(1, PADDING);
        spacerBefore.fills = [];
        h5Frame.appendChild(spacerBefore);
        
        h5Frame.appendChild(moduleFrame);
        
        const spacerAfter = figma.createFrame();
        spacerAfter.name = "间距";
        spacerAfter.resize(1, PADDING);
        spacerAfter.fills = [];
        h5Frame.appendChild(spacerAfter);
      }
    }
    
    // 4. 添加活动规则模块
    if (config.rulesContent) {
      const rulesFrame = await createRulesModule(config);
      // 设置模块水平居中
      rulesFrame.layoutAlign = "CENTER";
      
      // 添加间距
      const spacerBefore = figma.createFrame();
      spacerBefore.name = "间距";
      spacerBefore.resize(1, PADDING);
      spacerBefore.fills = [];
      h5Frame.appendChild(spacerBefore);
      
      h5Frame.appendChild(rulesFrame);
      
      const spacerAfter = figma.createFrame();
      spacerAfter.name = "间距";
      spacerAfter.resize(1, PADDING);
      spacerAfter.fills = [];
      h5Frame.appendChild(spacerAfter);
    }
    
    // 5. 添加尾版模块
    const footerFrame = await createFooterModule(config);
    // 设置为自适应宽度
    footerFrame.layoutAlign = "STRETCH";
    h5Frame.appendChild(footerFrame);
    
    // 调整外层背景画板高度适应内容
    outerFrame.resize(H5_WIDTH, h5Frame.height);
    
    // 将外层背景画板添加到当前页面并居中显示
    currentPage.appendChild(outerFrame);
    
    // 居中视图到创建的画板
    figma.viewport.scrollAndZoomIntoView([outerFrame]);
    
    return outerFrame;
  } catch (error) {
    // 创建H5原型时出错，通过notify和抛出异常处理
    figma.notify(`创建失败: ${error instanceof Error ? error.message : '未知错误'}`, {timeout: 5000});
    throw error;
  }
}

// 这里开始实现创建图片的函数
async function createImageFill(bytes: Uint8Array): Promise<SolidPaint | ImagePaint> {
  try {
    const image = await createImage(bytes);
    
    if (image) {
      return {
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FILL'
      } as ImagePaint;
    } else {
      // 图片创建失败，返回灰色填充
      return {
        type: 'SOLID',
        color: { r: 0.9, g: 0.9, b: 0.9 }
      } as SolidPaint;
    }
  } catch (error) {
    // 创建图片填充失败，返回默认灰色填充
    
    // 图片创建失败，返回灰色填充
    return {
      type: 'SOLID',
      color: { r: 0.9, g: 0.9, b: 0.9 }
    } as SolidPaint;
  }
}

// 创建活动规则模块 (已简化为与UI HTML一致的结构)
async function createRulesModule(config: H5Config): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = "活动规则";
  frame.resize(MODULE_WIDTH, 0); // 高度后面调整
  
  // 设置白色背景
  frame.fills = [{
    type: 'SOLID',
    color: { r: 1, g: 1, b: 1 }
  }];
  
  // 当前垂直位置
  let yPos = 20;
  
  // 添加规则标题
  if (config.rulesTitle) {
    const titleContainer = figma.createFrame();
    titleContainer.name = "规则标题";
    titleContainer.resize(MODULE_WIDTH, 60);
    titleContainer.x = 0;
    titleContainer.y = yPos;
    
    // 设置标题背景
    titleContainer.fills = [{
      type: 'SOLID',
      color: { r: 0.95, g: 0.95, b: 0.95 }
    }];
    
    // 添加标题文本
    const titleText = figma.createText();
    titleText.characters = config.rulesTitle;
    titleText.fontSize = 24;
    titleText.fontName = { family: "Inter", style: "Bold" };
    
    // 加载字体
    await figma.loadFontAsync(titleText.fontName);
    
    // 调整文本位置居中
    titleText.resize(MODULE_WIDTH, titleText.height);
    titleText.textAlignHorizontal = "CENTER";
    titleText.x = 0;
    titleText.y = (60 - titleText.height) / 2;
    
    titleContainer.appendChild(titleText);
    frame.appendChild(titleContainer);
    
    yPos += 80;
  }
  
  // 添加规则正文
  if (config.rulesContent) {
    const contentContainer = figma.createFrame();
    contentContainer.name = "规则内容";
    contentContainer.resize(MODULE_WIDTH - 40, 0); // 高度后面调整
    contentContainer.x = 20;
    contentContainer.y = yPos;
    
    // 设置透明背景
    contentContainer.fills = [];
    
    // 添加正文文本
    const contentText = figma.createText();
    contentText.characters = config.rulesContent;
    contentText.fontSize = 16;
    contentText.fontName = { family: "Inter", style: "Regular" };
    contentText.lineHeight = { value: 24, unit: 'PIXELS' };
    
    // 加载字体
    await figma.loadFontAsync(contentText.fontName);
    
    // 设置宽度以便换行
    contentText.resize(MODULE_WIDTH - 40, contentText.height);
    contentText.x = 0;
    contentText.y = 0;
    
    contentContainer.appendChild(contentText);
    contentContainer.resize(MODULE_WIDTH - 40, contentText.height);
    frame.appendChild(contentContainer);
    
    yPos += contentContainer.height + 30;
  } else {
    // 添加默认文本
    const defaultText = figma.createText();
    defaultText.characters = "暂无活动规则";
    defaultText.fontSize = 16;
    defaultText.fontName = { family: "Inter", style: "Regular" };
    
    // 加载字体
    await figma.loadFontAsync(defaultText.fontName);
    
    // 调整文本位置
    defaultText.x = 20;
    defaultText.y = yPos;
    
    frame.appendChild(defaultText);
    yPos += defaultText.height + 30;
  }
  
  // 调整模块高度
  frame.resize(MODULE_WIDTH, Math.max(yPos, 150));
  
  return frame;
}

// 创建头图模块
async function createHeaderModule(headerImage: Uint8Array): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = "头图";
  
  if (headerImage) {
    // 使用图片创建背景
    const image = await createImage(headerImage);
    if (image) {
      // Figma Image 对象没有 height 属性，使用默认尺寸
      frame.resize(1080, 300); // 使用默认高度
      frame.fills = [{
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FILL'
      }];
    } else {
      // 默认大小
      frame.resize(1080, 200);
      frame.fills = [{
        type: 'SOLID',
        color: { r: 0.9, g: 0.9, b: 0.9 }
      }];
    }
  } else {
    // 默认大小
    frame.resize(1080, 200);
    frame.fills = [{
      type: 'SOLID',
      color: { r: 0.9, g: 0.9, b: 0.9 }
    }];
  }
  
  return frame;
}

// 创建游戏信息模块
async function createGameInfoModule(config: H5Config): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = "游戏信息";
  frame.resize(MODULE_WIDTH, 140);
  frame.fills = [{
    type: 'SOLID',
    color: { r: 1, g: 1, b: 1 }
  }];
  
  // 添加游戏图标
  let xPos = 20;
  let yPos = 20;
  
  if (config.gameIcon) {
    const iconFrame = figma.createFrame();
    iconFrame.name = "游戏图标";
    iconFrame.resize(100, 100);
    iconFrame.x = xPos;
    iconFrame.y = yPos;
    
    // 设置图标图片
    const image = await createImage(config.gameIcon);
    if (image) {
      iconFrame.fills = [{
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FILL'
      }];
      
      // 圆角处理
      iconFrame.cornerRadius = 10;
    }
    
    frame.appendChild(iconFrame);
    xPos += iconFrame.width + 20;
  }
  
  // 添加游戏名称
  if (config.gameName) {
    const nameText = figma.createText();
    nameText.characters = config.gameName;
    nameText.x = xPos;
    nameText.y = yPos;
    nameText.fontSize = 24;
    nameText.fontName = { family: "Inter", style: "Bold" };
    
    // 加载字体
    await figma.loadFontAsync(nameText.fontName);
    
    frame.appendChild(nameText);
    yPos += nameText.height + 12;
  }
  
  // 添加游戏描述
  if (config.gameDesc) {
    const descText = figma.createText();
    descText.characters = config.gameDesc;
    descText.x = xPos;
    descText.y = yPos;
    descText.fontSize = 16;
    descText.fontName = { family: "Inter", style: "Regular" };
    
    // 加载字体
    await figma.loadFontAsync(descText.fontName);
    
    frame.appendChild(descText);
  }
  
  // 添加按钮
  if (config.buttonText) {
    const buttonFrame = figma.createFrame();
    buttonFrame.name = "下载按钮";
    buttonFrame.resize(200, 60);
    buttonFrame.x = MODULE_WIDTH - 220;
    buttonFrame.y = 40;
    
    // 设置按钮背景色
    if (config.buttonBgColor) {
      buttonFrame.fills = [{
        type: 'SOLID',
        color: hexToRgb(config.buttonBgColor)
      }];
    } else {
      buttonFrame.fills = [{
        type: 'SOLID',
        color: { r: 0, g: 0.5, b: 1 }
      }];
    }
    
    // 按钮圆角
    buttonFrame.cornerRadius = 30;
    
    // 添加按钮文本
    const buttonText = figma.createText();
    buttonText.characters = config.buttonText || "立即下载";
    buttonText.fontSize = 20;
    buttonText.fontName = { family: "Inter", style: "Bold" };
    buttonText.fills = [{
      type: 'SOLID',
      color: { r: 1, g: 1, b: 1 }
    }];
    
    // 加载字体
    await figma.loadFontAsync(buttonText.fontName);
    
    // 调整文本位置居中
    buttonText.resize(buttonFrame.width, buttonText.height);
    buttonText.textAlignHorizontal = "CENTER";
    buttonText.x = 0;
    buttonText.y = (buttonFrame.height - buttonText.height) / 2;
    
    buttonFrame.appendChild(buttonText);
    frame.appendChild(buttonFrame);
  }
  
  return frame;
}

// 创建自定义模块
async function createCustomModule(module: Module): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = module.title || module.type;
  frame.resize(MODULE_WIDTH, 100); // 初始高度，后面调整
  
  // 设置白色背景
  frame.fills = [{
    type: 'SOLID',
    color: { r: 1, g: 1, b: 1 }
  }];
  
  // 预先加载常用字体，以避免加载错误
  try {
    await loadCommonFonts();
  } catch (fontError) {
    // 在创建模块前加载字体时出错，继续执行
    // 继续执行，我们将在创建具体文本元素时再次尝试加载字体
  }
  
  // 根据模块类型创建不同的内容
  let moduleContent: FrameNode;
  
  try {
    switch (module.type) {
      case 'activityRules':
        moduleContent = await createActivityContentModule(module.content as ActivityRulesContent);
        break;
      case 'signIn':
        moduleContent = await createSignInModule(module.content as SignInContent);
        break;
      case 'collectCards':
        moduleContent = await createCollectCardsModule(module.content as CollectCardsContent);
        break;
      case 'nineGrid':
        moduleContent = await createNineGridModule(module.content as NineGridContent);
        break;
      default:
        moduleContent = figma.createFrame();
        moduleContent.name = "空模块";
        moduleContent.resize(MODULE_WIDTH, 100);
    }
  } catch (error) {
    // 创建模块时出错，返回错误提示模块
    
    // 返回一个错误提示模块
    moduleContent = figma.createFrame();
    moduleContent.name = "模块创建失败";
    moduleContent.resize(MODULE_WIDTH, 100);
    
    // 加载字体并显示错误信息
    const errorText = figma.createText();
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    errorText.characters = `模块创建失败: ${error instanceof Error ? error.message : '未知错误'}`;
    errorText.fontSize = 16;
    errorText.x = 20;
    errorText.y = 40;
    moduleContent.appendChild(errorText);
  }
  
  // 添加模块内容
  frame.appendChild(moduleContent);
  
  // 调整模块大小以适应内容
  frame.resize(MODULE_WIDTH, moduleContent.height);
  
  return frame;
}


// 创建活动内容模块
async function createActivityContentModule(content: ActivityRulesContent): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = "活动内容";
  
  // 设置白色背景
  frame.fills = [{
    type: 'SOLID',
    color: { r: 1, g: 1, b: 1 }
  }];
  
  // 当前垂直位置
  let yPos = 30;
  
  // 添加大标题
  if (content.mainTitle) {
    const titleContainer = figma.createFrame();
    titleContainer.name = "大标题容器";
    titleContainer.resize(MODULE_WIDTH, 60);
    titleContainer.x = 0;
    titleContainer.y = yPos;
    
    // 设置标题背景
    if (content.mainTitleBg) {
      const bgFill = await createImageFill(content.mainTitleBg);
      titleContainer.fills = [bgFill];
    } else {
      titleContainer.fills = [{
        type: 'SOLID',
        color: { r: 0.95, g: 0.95, b: 0.95 }
      }];
    }
    
    // 添加标题文本
    const titleText = figma.createText();
    titleText.characters = content.mainTitle;
    titleText.fontSize = 24;
    titleText.fontName = { family: "Inter", style: "Bold" };
    
    // 加载字体
    await figma.loadFontAsync(titleText.fontName);
    
    // 调整文本位置居中
    titleText.resize(MODULE_WIDTH, titleText.height);
    titleText.textAlignHorizontal = "CENTER";
    titleText.x = 0;
    titleText.y = (60 - titleText.height) / 2;
    
    titleContainer.appendChild(titleText);
    frame.appendChild(titleContainer);
    
    yPos += 80;
  }
  
  // 添加小标题
  if (content.subTitle) {
    const subTitleContainer = figma.createFrame();
    subTitleContainer.name = "小标题容器";
    subTitleContainer.resize(MODULE_WIDTH, 50);
    subTitleContainer.x = 0;
    subTitleContainer.y = yPos;
    
    // 设置小标题背景
    if (content.subTitleBg) {
      const bgFill = await createImageFill(content.subTitleBg);
      subTitleContainer.fills = [bgFill];
    } else {
      subTitleContainer.fills = [{
        type: 'SOLID',
        color: { r: 0.98, g: 0.98, b: 0.98 }
      }];
    }
    
    // 添加小标题文本
    const subTitleText = figma.createText();
    subTitleText.characters = content.subTitle;
    subTitleText.fontSize = 20;
    subTitleText.fontName = { family: "Inter", style: "Medium" };
    
    // 加载字体
    await figma.loadFontAsync(subTitleText.fontName);
    
    // 调整文本位置
    subTitleText.x = 20;
    subTitleText.y = (50 - subTitleText.height) / 2;
    
    subTitleContainer.appendChild(subTitleText);
    frame.appendChild(subTitleContainer);
    
    yPos += 70;
  }
  
  // 添加正文
  if (content.text) {
    const contentContainer = figma.createFrame();
    contentContainer.name = "正文容器";
    contentContainer.resize(MODULE_WIDTH - 40, 0); // 高度后面调整
    contentContainer.x = 20;
    contentContainer.y = yPos;
    
    // 设置透明背景
    contentContainer.fills = [];
    
    // 添加正文文本
    const contentText = figma.createText();
    contentText.characters = content.text;
    contentText.fontSize = 16;
    contentText.fontName = { family: "Inter", style: "Regular" };
    contentText.lineHeight = { value: 24, unit: 'PIXELS' };
    
    // 加载字体
    await figma.loadFontAsync(contentText.fontName);
    
    // 设置宽度以便换行
    contentText.resize(MODULE_WIDTH - 40, contentText.height);
    contentText.x = 0;
    contentText.y = 0;
    
    contentContainer.appendChild(contentText);
    contentContainer.resize(MODULE_WIDTH - 40, contentText.height);
    frame.appendChild(contentContainer);
    
    yPos += contentContainer.height + 30;
  }
  
  // 添加图片（如果有）
  if (content.image) {
    const imageFrame = figma.createFrame();
    imageFrame.name = "内容图片";
    imageFrame.resize(MODULE_WIDTH - 40, 200); // 默认高度
    imageFrame.x = 20;
    imageFrame.y = yPos;
    
    const image = await createImage(content.image);
    if (image) {
      imageFrame.fills = [{
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FIT'
      }];
      
      frame.appendChild(imageFrame);
      yPos += 220; // 图片高度 + 间距
    }
  }
  
  // 如果没有任何内容，显示默认文本
  if (!content.mainTitle && !content.subTitle && !content.text && !content.image) {
    const defaultText = figma.createText();
    defaultText.characters = "暂无活动内容";
    defaultText.fontSize = 16;
    defaultText.fontName = { family: "Inter", style: "Regular" };
    
    // 加载字体
    await figma.loadFontAsync(defaultText.fontName);
    
    // 调整文本位置
    defaultText.x = 20;
    defaultText.y = yPos;
    
    frame.appendChild(defaultText);
    yPos += defaultText.height + 30;
  }
  
  // 调整模块高度
  frame.resize(MODULE_WIDTH, Math.max(yPos, 150));
  
  return frame;
}

// 创建尾版模块
async function createFooterModule(config: H5Config): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = "尾版";
  frame.resize(1080, 180);
  
  try {
    // 设置尾版背景
    if (config.footerBg) {
      const bgFill = await createImageFill(config.footerBg);
      frame.fills = [bgFill];
    } else {
      frame.fills = [{
        type: 'SOLID',
        color: { r: 0.1, g: 0.1, b: 0.1 }
      }];
    }
    
    // 添加LOGO
    if (config.footerLogo) {
      const logoFrame = figma.createFrame();
      logoFrame.name = "LOGO";
      logoFrame.resize(200, 80);
      
      // 设置LOGO图片
      const image = await createImage(config.footerLogo);
      if (image) {
        logoFrame.fills = [{
          type: 'IMAGE',
          imageHash: image.hash,
          scaleMode: 'FIT'
        }];
      }
      
      logoFrame.x = (1080 - 200) / 2;
      logoFrame.y = 30;
      frame.appendChild(logoFrame);
      
      // 添加版权信息
      const copyrightText = figma.createText();
      copyrightText.characters = "© 2023 版权所有";
      copyrightText.fontSize = 14;
      copyrightText.fontName = { family: "Inter", style: "Regular" };
      copyrightText.fills = [{
        type: 'SOLID',
        color: { r: 0.7, g: 0.7, b: 0.7 }
      }];
      
      // 加载字体
      await figma.loadFontAsync(copyrightText.fontName);
      
      // 调整文本位置居中
      copyrightText.resize(1080, copyrightText.height);
      copyrightText.textAlignHorizontal = "CENTER";
      copyrightText.x = 0;
      copyrightText.y = 130;
      
      frame.appendChild(copyrightText);
    } else {
      // 添加默认版权信息
      const copyrightText = figma.createText();
      copyrightText.characters = "© 2023 版权所有";
      copyrightText.fontSize = 16;
      copyrightText.fontName = { family: "Inter", style: "Regular" };
      copyrightText.fills = [{
        type: 'SOLID',
        color: { r: 0.7, g: 0.7, b: 0.7 }
      }];
      
      // 加载字体
      await figma.loadFontAsync(copyrightText.fontName);
      
      // 调整文本位置居中
      copyrightText.resize(1080, copyrightText.height);
      copyrightText.textAlignHorizontal = "CENTER";
      copyrightText.x = 0;
      copyrightText.y = (180 - copyrightText.height) / 2;
      
      frame.appendChild(copyrightText);
    }
  } catch (error) {
    // 创建尾版模块时出错，返回基本框架
    // 如果出错，至少返回一个基本的框架
  }
  
  return frame;
}

// 工具函数：将十六进制颜色转换为RGB
function hexToRgb(hex: string): RGB {
  // 如果是缩写形式（如 #fff），则扩展为完整形式
  if (hex.length === 4) {
    hex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
  }
  
  // 移除'#'前缀
  hex = hex.replace('#', '');
  
  // 解析RGB值
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  return { r, g, b };
}

// 实现创建图片的函数
async function createImage(bytes: Uint8Array): Promise<Image | null> {
  try {
    return figma.createImage(bytes);
  } catch (error) {
    // 创建图片时出错，返回null
    return null;
  }
}

// 创建签到模块
async function createSignInModule(content: SignInContent): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = "每日签到";
  frame.resize(MODULE_WIDTH, 460); // 默认高度
  
  // 设置背景
  if (content.bgImage) {
    const bgFill = await createImageFill(content.bgImage);
    frame.fills = [bgFill];
  } else {
    frame.fills = [{
      type: 'SOLID',
      color: { r: 0.95, g: 0.95, b: 1 }
    }];
  }
  
  // 添加标题
  if (content.titleImage) {
    const titleFrame = figma.createFrame();
    titleFrame.name = "签到标题";
    titleFrame.resize(500, 100);
    
    // 设置标题图片
    const image = await createImage(content.titleImage);
    if (image) {
      titleFrame.fills = [{
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FIT'
      }];
    } else {
      titleFrame.fills = [{
        type: 'SOLID',
        color: { r: 0.9, g: 0.5, b: 0.3 }
      }];
      
      // 添加默认标题文本
      const titleText = figma.createText();
      titleText.characters = "每日签到";
      titleText.fontSize = 28;
      titleText.fontName = { family: "Inter", style: "Bold" };
      titleText.fills = [{
        type: 'SOLID',
        color: { r: 1, g: 1, b: 1 }
      }];
      
      // 加载字体
      await figma.loadFontAsync(titleText.fontName);
      
      // 调整文本位置居中
      titleText.resize(500, titleText.height);
      titleText.textAlignHorizontal = "CENTER";
      titleText.x = 0;
      titleText.y = (100 - titleText.height) / 2;
      
      titleFrame.appendChild(titleText);
    }
    
    titleFrame.x = (MODULE_WIDTH - 500) / 2;
    titleFrame.y = 20;
    frame.appendChild(titleFrame);
  }
  
  // 创建签到日期容器
  const daysContainer = figma.createFrame();
  daysContainer.name = "签到日期容器";
  daysContainer.layoutMode = "HORIZONTAL";
  daysContainer.primaryAxisSizingMode = "FIXED";
  daysContainer.counterAxisSizingMode = "AUTO";
  daysContainer.itemSpacing = 10;
  daysContainer.paddingLeft = 10;
  daysContainer.paddingRight = 10;
  daysContainer.paddingTop = 10;
  daysContainer.paddingBottom = 10;
  
  // 计算容器位置和大小
  const containerWidth = MODULE_WIDTH - 40;
  daysContainer.resize(containerWidth, 240);
  daysContainer.x = 20;
  daysContainer.y = 140;
  
  // 设置容器背景
  daysContainer.fills = [{
    type: 'SOLID',
    color: { r: 1, g: 1, b: 1 }, // RGB 不包含 alpha 通道
    opacity: 0.8 // 使用 opacity 属性设置透明度
  }];
  daysContainer.cornerRadius = 10;
  
  // 获取签到天数
  const daysCount = content.daysCount || 7; // 默认7天
  
  // 创建签到日期项
  for (let i = 0; i < daysCount; i++) {
    const dayItem = figma.createFrame();
    dayItem.name = `第${i+1}天`;
    dayItem.resize(80, 220);
    dayItem.layoutMode = "VERTICAL";
    dayItem.primaryAxisSizingMode = "AUTO";
    dayItem.counterAxisSizingMode = "FIXED";
    dayItem.itemSpacing = 10;
    dayItem.paddingTop = 10;
    dayItem.paddingBottom = 10;
    dayItem.cornerRadius = 5;
    
    // 设置日期项背景
    dayItem.fills = [{
      type: 'SOLID',
      color: { r: 0.95, g: 0.95, b: 0.95 }
    }];
    
    // 添加日期图标
    const dayIconFrame = figma.createFrame();
    dayIconFrame.name = "日期图标";
    dayIconFrame.resize(60, 60);
    
    // 设置日期图标
    if (content.dayIcon) {
      const image = await createImage(content.dayIcon);
      if (image) {
        dayIconFrame.fills = [{
          type: 'IMAGE',
          imageHash: image.hash,
          scaleMode: 'FILL'
        }];
      }
    } else {
      dayIconFrame.fills = [{
        type: 'SOLID',
        color: { r: 1, g: 0.8, b: 0.2 }
      }];
      dayIconFrame.cornerRadius = 30;
    }
    
    // 日期文本
    const dayText = figma.createText();
    dayText.characters = `第${i+1}天`;
    dayText.fontSize = 16;
    dayText.fontName = { family: "Inter", style: "Medium" };
    
    // 加载字体
    await figma.loadFontAsync(dayText.fontName);
    
    // 调整文本位置居中
    dayText.resize(80, dayText.height);
    dayText.textAlignHorizontal = "CENTER";
    
    // 奖励描述
    const rewardText = figma.createText();
    rewardText.characters = "金币 x 100";
    rewardText.fontSize = 14;
    rewardText.fontName = { family: "Inter", style: "Regular" };
    rewardText.fills = [{
      type: 'SOLID',
      color: { r: 0.5, g: 0.5, b: 0.5 }
    }];
    
    // 加载字体
    await figma.loadFontAsync(rewardText.fontName);
    
    // 调整文本位置居中
    rewardText.resize(80, rewardText.height);
    rewardText.textAlignHorizontal = "CENTER";
    
    // 将元素添加到日期项
    dayItem.appendChild(dayIconFrame);
    dayItem.appendChild(dayText);
    dayItem.appendChild(rewardText);
    
    daysContainer.appendChild(dayItem);
  }
  
  frame.appendChild(daysContainer);
  
  // 添加签到按钮
  const buttonFrame = figma.createFrame();
  buttonFrame.name = "签到按钮";
  buttonFrame.resize(200, 60);
  
  // 设置按钮图片或默认样式
  if (content.signButton) {
    const image = await createImage(content.signButton);
    if (image) {
      buttonFrame.fills = [{
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FIT'
      }];
    }
  } else {
    buttonFrame.fills = [{
      type: 'SOLID',
      color: { r: 1, g: 0.4, b: 0.3 }
    }];
    buttonFrame.cornerRadius = 30;
    
    // 添加按钮文本
    const buttonText = figma.createText();
    buttonText.characters = "立即签到";
    buttonText.fontSize = 18;
    buttonText.fontName = { family: "Inter", style: "Bold" };
    buttonText.fills = [{
      type: 'SOLID',
      color: { r: 1, g: 1, b: 1 }
    }];
    
    // 加载字体
    await figma.loadFontAsync(buttonText.fontName);
    
    // 调整文本位置居中
    buttonText.resize(200, buttonText.height);
    buttonText.textAlignHorizontal = "CENTER";
    buttonText.x = 0;
    buttonText.y = (60 - buttonText.height) / 2;
    
    buttonFrame.appendChild(buttonText);
  }
  
  buttonFrame.x = (MODULE_WIDTH - 200) / 2;
  buttonFrame.y = 400;
  frame.appendChild(buttonFrame);
  
  return frame;
}

// 创建九宫格抽奖模块
async function createNineGridModule(content: NineGridContent): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = "九宫格抽奖";
  frame.resize(MODULE_WIDTH, 680); // 设置足够的高度来显示九宫格
  
  // 设置背景
  if (content.gridBgImage) {
    const bgFill = await createImageFill(content.gridBgImage);
    frame.fills = [bgFill];
  } else {
    frame.fills = [{
      type: 'SOLID',
      color: { r: 0.95, g: 0.9, b: 0.8 }
    }];
  }
  
  // 添加标题文本（如果有）
  if (content.mainTitle) {
    const titleContainer = figma.createFrame();
    titleContainer.name = "大标题容器";
    titleContainer.resize(MODULE_WIDTH, 60);
    titleContainer.x = 0;
    titleContainer.y = 20;
    
    // 设置标题背景
    if (content.titleBgImage) {
      const bgFill = await createImageFill(content.titleBgImage);
      titleContainer.fills = [bgFill];
    } else {
      titleContainer.fills = [{
        type: 'SOLID',
        color: { r: 0.9, g: 0.8, b: 0.7 }
      }];
    }
    
    // 添加标题文本
    const titleText = figma.createText();
    titleText.characters = content.mainTitle;
    titleText.fontSize = 24;
    titleText.fontName = { family: "Inter", style: "Bold" };
    
    // 加载字体
    await figma.loadFontAsync(titleText.fontName);
    
    // 调整文本位置居中
    titleText.resize(MODULE_WIDTH, titleText.height);
    titleText.textAlignHorizontal = "CENTER";
    titleText.x = 0;
    titleText.y = (60 - titleText.height) / 2;
    
    titleContainer.appendChild(titleText);
    frame.appendChild(titleContainer);
  }
  
  // 创建九宫格容器
  const gridContainer = figma.createFrame();
  gridContainer.name = "九宫格容器";
  gridContainer.resize(MODULE_WIDTH - 40, MODULE_WIDTH - 40);
  gridContainer.x = 20;
  gridContainer.y = 100;
  
  // 设置九宫格背景
  gridContainer.fills = [{
    type: 'SOLID',
    color: { r: 1, g: 1, b: 1 },
    opacity: 0.9
  }];
  gridContainer.cornerRadius = 10;
  
  // 计算单元格大小和间距
  const cellSize = (MODULE_WIDTH - 40 - 40) / 3; // 考虑内边距
  
  // 创建九宫格
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const index = i * 3 + j;
      // 当是中间位置时（即index=4），放置抽奖按钮
      if (index === 4) {
        const buttonFrame = figma.createFrame();
        buttonFrame.name = "抽奖按钮";
        buttonFrame.resize(cellSize, cellSize);
        buttonFrame.x = j * (cellSize + 10) + 10; // 间距10
        buttonFrame.y = i * (cellSize + 10) + 10;
        
        // 设置按钮背景
        if (content.drawButtonImage) {
          const image = await createImage(content.drawButtonImage);
          if (image) {
            buttonFrame.fills = [{
              type: 'IMAGE',
              imageHash: image.hash,
              scaleMode: 'FILL'
            }];
          }
        } else {
          buttonFrame.fills = [{
            type: 'SOLID',
            color: { r: 1, g: 0.3, b: 0.3 }
          }];
          buttonFrame.cornerRadius = 10;
          
          // 添加按钮文本
          const buttonText = figma.createText();
          buttonText.characters = "抽奖";
          buttonText.fontSize = 24;
          buttonText.fontName = { family: "Inter", style: "Bold" };
          buttonText.fills = [{
            type: 'SOLID',
            color: { r: 1, g: 1, b: 1 }
          }];
          
          // 加载字体
          await figma.loadFontAsync(buttonText.fontName);
          
          // 调整文本位置居中
          buttonText.resize(cellSize, buttonText.height);
          buttonText.textAlignHorizontal = "CENTER";
          buttonText.x = 0;
          buttonText.y = (cellSize - buttonText.height) / 2;
          
          buttonFrame.appendChild(buttonText);
        }
        
        gridContainer.appendChild(buttonFrame);
      } else {
        // 创建奖品格子
        const prizeBox = figma.createFrame();
        prizeBox.name = (index < content.prizes?.length && content.prizes[index]?.name) ? 
          content.prizes[index].name : `奖品${index+1}`;
        prizeBox.resize(cellSize, cellSize);
        prizeBox.x = j * (cellSize + 10) + 10;
        prizeBox.y = i * (cellSize + 10) + 10;
        
        // 设置奖品格子背景
        if (content.prizeBgImage) {
          const bgFill = await createImageFill(content.prizeBgImage);
          prizeBox.fills = [bgFill];
        } else {
          prizeBox.fills = [{
            type: 'SOLID',
            color: { r: 1, g: 1, b: 0.9 }
          }];
        }
        prizeBox.cornerRadius = 10;
        
        // 如果有奖品，则添加奖品图片
        if (index < content.prizes?.length && content.prizes[index]?.image) {
          const prizeImage = figma.createFrame();
          prizeImage.name = "奖品图片";
          prizeImage.resize(cellSize * 0.7, cellSize * 0.7);
          
          const image = await createImage(content.prizes[index].image);
          if (image) {
            prizeImage.fills = [{
              type: 'IMAGE',
              imageHash: image.hash,
              scaleMode: 'FILL'
            }];
          }
          
          prizeImage.x = (cellSize - prizeImage.width) / 2;
          prizeImage.y = 5;
          prizeBox.appendChild(prizeImage);
          
          // 添加奖品名称
          if (content.prizes[index].name) {
            const prizeText = figma.createText();
            prizeText.characters = content.prizes[index].name;
            prizeText.fontSize = 14;
            prizeText.fontName = { family: "Inter", style: "Regular" };
            
            // 加载字体
            await figma.loadFontAsync(prizeText.fontName);
            
            // 调整文本位置居中
            prizeText.resize(cellSize, prizeText.height);
            prizeText.textAlignHorizontal = "CENTER";
            prizeText.x = 0;
            prizeText.y = prizeImage.height + 10;
            
            prizeBox.appendChild(prizeText);
          }
        }
        
        gridContainer.appendChild(prizeBox);
      }
    }
  }
  
  frame.appendChild(gridContainer);
  
  return frame;
}

// 创建集卡模块
async function createCollectCardsModule(content: CollectCardsContent): Promise<FrameNode> {
  const frame = figma.createFrame();
  frame.name = "集卡活动";
  frame.resize(MODULE_WIDTH, 620); // 默认高度
  
  // 设置背景
  if (content.bgImage) {
    const bgFill = await createImageFill(content.bgImage);
    frame.fills = [bgFill];
  } else {
    frame.fills = [{
      type: 'SOLID',
      color: { r: 0.95, g: 0.97, b: 1 }
    }];
  }
  
  // 添加标题
  if (content.titleImage) {
    const titleFrame = figma.createFrame();
    titleFrame.name = "集卡标题";
    titleFrame.resize(500, 100);
    
    // 设置标题图片
    const image = await createImage(content.titleImage);
    if (image) {
      titleFrame.fills = [{
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FIT'
      }];
    } else {
      titleFrame.fills = [{
        type: 'SOLID',
        color: { r: 0.3, g: 0.6, b: 0.9 }
      }];
      
      // 添加默认标题文本
      const titleText = figma.createText();
      titleText.characters = "集卡活动";
      titleText.fontSize = 28;
      titleText.fontName = { family: "Inter", style: "Bold" };
      titleText.fills = [{
        type: 'SOLID',
        color: { r: 1, g: 1, b: 1 }
      }];
      
      // 加载字体
      await figma.loadFontAsync(titleText.fontName);
      
      // 调整文本位置居中
      titleText.resize(500, titleText.height);
      titleText.textAlignHorizontal = "CENTER";
      titleText.x = 0;
      titleText.y = (100 - titleText.height) / 2;
      
      titleFrame.appendChild(titleText);
    }
    
    titleFrame.x = (MODULE_WIDTH - 500) / 2;
    titleFrame.y = 20;
    frame.appendChild(titleFrame);
  }
  
  // 创建卡片容器
  const cardsContainer = figma.createFrame();
  cardsContainer.name = "卡片容器";
  cardsContainer.layoutMode = "HORIZONTAL";
  cardsContainer.primaryAxisSizingMode = "FIXED";
  cardsContainer.counterAxisSizingMode = "AUTO";
  cardsContainer.itemSpacing = 20;
  cardsContainer.paddingLeft = 20;
  cardsContainer.paddingRight = 20;
  cardsContainer.paddingTop = 20;
  cardsContainer.paddingBottom = 20;
  
  // 计算容器位置和大小
  const containerWidth = MODULE_WIDTH - 40;
  cardsContainer.resize(containerWidth, 300);
  cardsContainer.x = 20;
  cardsContainer.y = 140;
  
  // 设置容器背景
  cardsContainer.fills = [{
    type: 'SOLID',
    color: { r: 1, g: 1, b: 1 }, // RGB 不包含 alpha 通道
    opacity: 0.8 // 使用 opacity 属性设置透明度
  }];
  cardsContainer.cornerRadius = 10;
  
  // 获取卡片数量
  const cardsCount = content.cardsCount || 5; // 默认5张卡
  
  // 创建卡片
  for (let i = 0; i < cardsCount; i++) {
    const cardItem = figma.createFrame();
    cardItem.name = `卡片${i+1}`;
    cardItem.resize(120, 260);
    
    // 设置卡片样式
    if (content.cardStyle === 'style2') {
      cardItem.cornerRadius = 10; // 圆角
    } else if (content.cardStyle === 'style3') {
      cardItem.cornerRadius = 60; // 自定义（这里用更大的圆角代表）
    }
    // style1是方形，默认不做任何处理
    
    // 设置卡片背景
    if (content.cardBg) {
      const image = await createImage(content.cardBg);
      if (image) {
        cardItem.fills = [{
          type: 'IMAGE',
          imageHash: image.hash,
          scaleMode: 'FILL'
        }];
      }
    } else {
      // 使用渐变色背景
      cardItem.fills = [{
        type: 'GRADIENT_LINEAR',
        gradientStops: [
          { position: 0, color: { r: 0.8, g: 0.8, b: 1, a: 1 } },
          { position: 1, color: { r: 0.5, g: 0.5, b: 0.9, a: 1 } }
        ],
        gradientTransform: [[1, 0, 0], [0, 1, 0]]
      }];
    }
    
    // 添加卡片标题
    const cardTitle = figma.createText();
    cardTitle.characters = `${String.fromCharCode(65 + i)}`;
    cardTitle.fontSize = 36;
    cardTitle.fontName = { family: "Inter", style: "Bold" };
    cardTitle.fills = [{
      type: 'SOLID',
      color: { r: 1, g: 1, b: 1 }
    }];
    
    // 加载字体
    await figma.loadFontAsync(cardTitle.fontName);
    
    // 调整文本位置居中
    cardTitle.resize(120, cardTitle.height);
    cardTitle.textAlignHorizontal = "CENTER";
    cardTitle.x = 0;
    cardTitle.y = 100;
    
    cardItem.appendChild(cardTitle);
    cardsContainer.appendChild(cardItem);
  }
  
  frame.appendChild(cardsContainer);
  
  // 添加合成按钮
  const buttonFrame = figma.createFrame();
  buttonFrame.name = "合成按钮";
  buttonFrame.resize(220, 70);
  
  // 设置按钮图片或默认样式
  if (content.combineButton) {
    const image = await createImage(content.combineButton);
    if (image) {
      buttonFrame.fills = [{
        type: 'IMAGE',
        imageHash: image.hash,
        scaleMode: 'FIT'
      }];
    }
  } else {
    buttonFrame.fills = [{
      type: 'SOLID',
      color: { r: 0.2, g: 0.6, b: 0.8 }
    }];
    buttonFrame.cornerRadius = 35;
    
    // 添加按钮文本
    const buttonText = figma.createText();
    buttonText.characters = "立即合成";
    buttonText.fontSize = 20;
    buttonText.fontName = { family: "Inter", style: "Bold" };
    buttonText.fills = [{
      type: 'SOLID',
      color: { r: 1, g: 1, b: 1 }
    }];
    
    // 加载字体
    await figma.loadFontAsync(buttonText.fontName);
    
    // 调整文本位置居中
    buttonText.resize(220, buttonText.height);
    buttonText.textAlignHorizontal = "CENTER";
    buttonText.x = 0;
    buttonText.y = (70 - buttonText.height) / 2;
    
    buttonFrame.appendChild(buttonText);
  }
  
  buttonFrame.x = (MODULE_WIDTH - 220) / 2;
  buttonFrame.y = 480;
  frame.appendChild(buttonFrame);
  
  return frame;
}

// 生成唯一ID函数 - 保留供将来使用，当需要生成模块或元素的唯一ID时使用
// function generateUniqueId(): string {
//   return Date.now().toString(36) + Math.random().toString(36).substring(2);
// }