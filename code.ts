/// <reference types="@figma/plugin-typings" />

type Message = {
  type: 'create-rectangle' | 'create-text' | 'export-selection'
}

// Figma插件主逻辑

figma.showUI(__html__, { width: 360, height: 600 });

// 消息处理核心
figma.ui.onmessage = async (msg: Message) => {
  try {
    switch (msg.type) {
      case 'create-rectangle': {
        const rect = figma.createRectangle();
        rect.resize(200, 100);
        rect.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.5, b: 1 } }];
        figma.currentPage.appendChild(rect);
        break;
      }

      case 'create-text': {
        const text = figma.createText();
        // 创建文本时使用预加载字体
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
        
        // 文件底部预加载字体
        figma.loadFontAsync({ family: "Inter", style: "Regular" });
        text.characters = 'Hello Figma!';
        text.x = 100;
        text.y = 100;
        break;
      }

      case 'export-selection': {
        if (figma.currentPage.selection.length === 0) {
          figma.notify('请先选择要导出的元素');
          return;
        }
        const nodes = figma.currentPage.selection
          .filter(node => node.exportSettings)
          .map(node => ({
            id: node.id,
            name: node.name,
            exportSettings: node.exportSettings
          }));
        figma.ui.postMessage({ type: 'EXPORT_DATA', data: nodes });
        break;
      }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    console.error('插件执行错误:', error);
    figma.notify(`操作失败: ${errorMessage}`);
  } finally {
    figma.closePlugin();
  }
};

// 初始化加载字体
figma.loadFontAsync({ family: "Inter", style: "Regular" });