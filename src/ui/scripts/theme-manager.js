// ==================== 主题管理器模块 ====================

class ThemeManager {
  init() {
    this.checkSystemTheme();
    this.bindThemeButtons();
    this.watchSystemTheme();
  }
  
  checkSystemTheme() {
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    this.applyTheme(prefersDark ? 'dark' : 'light');
  }
  
  applyTheme(theme) {
    document.body.className = document.body.className.replace(/\b(light|dark)-theme\b/g, '');
    document.body.classList.add(`${theme}-theme`);
    
    this.updateThemeButtons(theme);
  }
  
  updateThemeButtons(theme) {
    const lightBtn = document.getElementById('lightTheme');
    const darkBtn = document.getElementById('darkTheme');
    
    if (lightBtn && darkBtn) {
      lightBtn.classList.toggle('active', theme === 'light');
      darkBtn.classList.toggle('active', theme === 'dark');
    }
  }
  
  bindThemeButtons() {
    const lightBtn = document.getElementById('lightTheme');
    const darkBtn = document.getElementById('darkTheme');
    
    if (lightBtn) {
      lightBtn.addEventListener('click', () => this.applyTheme('light'));
    }
    
    if (darkBtn) {
      darkBtn.addEventListener('click', () => this.applyTheme('dark'));
    }
  }
  
  watchSystemTheme() {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', () => this.checkSystemTheme());
    }
  }
}

// 创建全局主题管理器实例
const themeManager = new ThemeManager();

// 导出供其他模块使用
window.themeManager = themeManager; 