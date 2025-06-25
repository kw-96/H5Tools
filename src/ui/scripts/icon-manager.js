/**
 * icon-manager.js
 * 统一管理所有SVG图标
 */

// SVG图标管理器
class IconManager {
  // 标签页图标
  static TAB_ICONS = {
    // 创建原型图标
    prototype: `<svg fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M9.438 8C10.3 8 11 8.7 11 9.563v8.875C11 19.3 10.3 20 9.438 20H1.561C.7 20 0 19.3 0 18.438V9.563C0 8.7.7 8 1.563 8zm9 0C19.3 8 20 8.7 20 9.563v8.875C20 19.3 19.3 20 18.438 20h-3.875C13.7 20 13 19.3 13 18.438V9.563C13 8.7 13.7 8 14.563 8zm0-8C19.3 0 20 .7 20 1.563v3.125c0 .862-.7 1.562-1.562 1.562H1.563C.7 6.25 0 5.55 0 4.688V1.563C0 .7.7 0 1.563 0z"/></svg>`,

    // 延展渠道图标
    extension: `<svg fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M18.438 0C19.3 0 20 .7 20 1.563v3.125c0 .862-.7 1.562-1.562 1.562H1.563C.7 6.25 0 5.55 0 4.688V1.563C0 .7.7 0 1.563 0zm0 8C19.3 8 20 8.7 20 9.563v3.124c0 .863-.7 1.563-1.562 1.563H1.563C.7 14.25 0 13.55 0 12.688V9.562C0 8.7.7 8 1.563 8zm0 8C19.3 16 20 16.7 20 17.563v.875C20 19.3 19.3 20 18.438 20H1.563C.7 20 0 19.3 0 18.438v-.875C0 16.7.7 16 1.563 16z"/></svg>`,

    // 工具集图标
    tools: `<svg fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M11.293 2.293a1 1 0 0 1 1.414 0l5 5a1 1 0 0 1 0 1.414l-9 9a1 1 0 0 1-1.414 0l-5-5a1 1 0 0 1 0-1.414zM10 5.414 5.414 10 10 14.586 14.586 10z" clip-rule="evenodd"/></svg>`,

    // 设置图标
    settings: `<svg fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M11.49 2.356a.367.367 0 0 0-.366-.371H8.876a.367.367 0 0 0-.365.37v1.623a.38.38 0 0 1-.262.358 5.4 5.4 0 0 0-1.465.69.34.34 0 0 1-.424-.042L5.233 3.857a.37.37 0 0 0-.522 0L3.102 5.466a.37.37 0 0 0 0 .521L4.23 7.114c.113.113.13.29.043.424-.3.445-.533.937-.69 1.465a.38.38 0 0 1-.358.262H1.6a.367.367 0 0 0-.37.365v2.248c0 .204.166.366.37.366h1.623c.163 0 .307.105.358.262.157.528.39 1.02.69 1.464a.34.34 0 0 1-.043.425l-1.127 1.127a.37.37 0 0 0 0 .521l1.61 1.61a.37.37 0 0 0 .52 0l1.128-1.128a.34.34 0 0 1 .424-.042c.444.299.937.533 1.465.69.156.05.262.194.262.358v1.622c0 .204.16.37.365.37h2.248a.367.367 0 0 0 .365-.37v-1.622c0-.164.106-.308.262-.358a5.4 5.4 0 0 0 1.465-.69.34.34 0 0 1 .424.042l1.127 1.127a.37.37 0 0 0 .522 0l1.609-1.609a.37.37 0 0 0 0-.521l-1.127-1.127a.34.34 0 0 1-.043-.425c.3-.444.533-.936.69-1.464a.38.38 0 0 1 .358-.262H18.4c.204 0 .37-.162.37-.366V9.63a.367.367 0 0 0-.37-.365h-1.623a.38.38 0 0 1-.358-.262 5.4 5.4 0 0 0-.69-1.465.34.34 0 0 1 .043-.424l1.127-1.127a.37.37 0 0 0 0-.521l-1.61-1.61a.37.37 0 0 0-.52 0L13.64 4.985a.34.34 0 0 1-.424.042 5.4 5.4 0 0 0-1.465-.69.38.38 0 0 1-.262-.358zM10 13.754A3.757 3.757 0 0 0 13.754 10 3.76 3.76 0 0 0 10 6.246 3.76 3.76 0 0 0 6.246 10 3.76 3.76 0 0 0 10 13.754" clip-rule="evenodd"/></svg>`
  };

  // 模块控制图标
  static MODULE_CONTROL_ICONS = {
    // 上移图标
    moveUp: `<svg fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5"/></svg>`,

    // 下移图标
    moveDown: `<svg width="16" height="16" fill="currentColor" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1"/></svg>`,

    // 折叠图标
    collapse: `<svg fill="currentColor" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"/></svg>`,

    // 删除图标
    delete: `<svg width="16" height="16" fill="currentColor" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3V2h11v1z"/></svg>`
  };

  // 其他图标
  static OTHER_ICONS = {
    // 返回图标
    back: `<svg fill="none" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 12 6 8l4-4"/></svg>`,

    // 空状态图标
    empty: `<svg fill="currentColor" class="empty-icon" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M7.752.066a.5.5 0 0 1 .496 0l3.75 2.143a.5.5 0 0 1 .252.434v3.995l3.498 2A.5.5 0 0 1 16 9.07v4.286a.5.5 0 0 1-.252.434l-3.75 2.143a.5.5 0 0 1-.496 0l-3.502-2-3.502 2a.5.5 0 0 1-.496 0L.252 13.79A.5.5 0 0 1 0 13.357V9.071a.5.5 0 0 1 .252-.434L3.75 6.638V2.643a.5.5 0 0 1 .252-.434zM4.25 7.504 1.508 9.071l2.742 1.567 2.742-1.567zM7.5 9.933l-2.75 1.571v3.134l2.75-1.571zm1 3.134 2.75 1.571v-3.134L8.5 9.933zm.508-3.996 2.742 1.567 2.742-1.567-2.742-1.567zm2.242-2.433V3.504L8.5 5.076V8.21zM7.5 8.21V5.076L4.75 3.504v3.134zM5.258 2.643 8 4.21l2.742-1.567L8 1.076zM15 9.933l-2.75 1.571v3.134L15 13.067zM3.75 14.638v-3.134L1 9.933v3.134z"/></svg>`,

    // 折叠箭头图标
    chevron: `<svg class="chevron-icon" preserveAspectRatio="xMidYMid meet" viewBox="0 0 16 11"><path d="m.13 2.33 7.312 7.577c.23.23.594.244.84.04l.044-.04 7.542-7.576a.17.17 0 0 0 .049-.117V.91a.167.167 0 0 0-.285-.118L7.909 8.55.37.8a.167.167 0 0 0-.286.116v1.298c0 .043.017.085.047.116"/></svg>`
  };

  // 初始化图标
  static init() {
    // 替换所有带data-icon属性的元素
    document.querySelectorAll('[data-icon]').forEach(element => {
      const iconPath = element.getAttribute('data-icon');
      const iconParts = iconPath.split('.');
      let icon = IconManager;
      
      // 遍历路径获取图标
      iconParts.forEach(part => {
        icon = icon[part];
      });

      if (icon) {
        element.innerHTML = icon;
      }
    });
  }
}

// 页面加载完成后初始化图标
document.addEventListener('DOMContentLoaded', () => {
  IconManager.init();
});