import { StorageService } from './storage.service';

// 主题类型
export type Theme = 'light' | 'dark';

// 主题服务
export class ThemeService {
  private static instance: ThemeService;
  private storage: StorageService;
  
  static readonly THEMES: Theme[] = ['light', 'dark'];
  static readonly THEME_KEY = 'theme';
  static readonly AUTO_THEME_KEY = 'autoTheme';

  private constructor() {
    this.storage = StorageService.getInstance();
  }

  static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService();
    }
    return ThemeService.instance;
  }

  getSystemTheme(): Theme {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }

  getCurrentTheme(): Theme {
    const savedTheme = this.storage.getItem(ThemeService.THEME_KEY);
    const autoTheme = this.storage.getItem(ThemeService.AUTO_THEME_KEY) === 'true';
    
    if (autoTheme) {
      return this.getSystemTheme();
    }
    
    return (savedTheme as Theme) || 'light';
  }

  setTheme(theme: Theme): void {
    this.storage.setItem(ThemeService.THEME_KEY, theme);
    this.storage.setItem(ThemeService.AUTO_THEME_KEY, 'false');
  }

  setAutoTheme(enabled: boolean): void {
    this.storage.setItem(ThemeService.AUTO_THEME_KEY, String(enabled));
    if (enabled) {
      this.setTheme(this.getSystemTheme());
    }
  }

  isAutoThemeEnabled(): boolean {
    return this.storage.getItem(ThemeService.AUTO_THEME_KEY) === 'true';
  }
} 