import { StorageService } from './storage.service';
// 主题服务
export class ThemeService {
    constructor() {
        this.storage = StorageService.getInstance();
    }
    static getInstance() {
        if (!ThemeService.instance) {
            ThemeService.instance = new ThemeService();
        }
        return ThemeService.instance;
    }
    getSystemTheme() {
        if (typeof window !== 'undefined' && window.matchMedia) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    }
    getCurrentTheme() {
        const savedTheme = this.storage.getItem(ThemeService.THEME_KEY);
        const autoTheme = this.storage.getItem(ThemeService.AUTO_THEME_KEY) === 'true';
        if (autoTheme) {
            return this.getSystemTheme();
        }
        return savedTheme || 'light';
    }
    setTheme(theme) {
        this.storage.setItem(ThemeService.THEME_KEY, theme);
        this.storage.setItem(ThemeService.AUTO_THEME_KEY, 'false');
    }
    setAutoTheme(enabled) {
        this.storage.setItem(ThemeService.AUTO_THEME_KEY, String(enabled));
        if (enabled) {
            this.setTheme(this.getSystemTheme());
        }
    }
    isAutoThemeEnabled() {
        return this.storage.getItem(ThemeService.AUTO_THEME_KEY) === 'true';
    }
}
ThemeService.THEMES = ['light', 'dark'];
ThemeService.THEME_KEY = 'theme';
ThemeService.AUTO_THEME_KEY = 'autoTheme';
//# sourceMappingURL=theme.service.js.map