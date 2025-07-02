export type Theme = 'light' | 'dark';
export declare class ThemeService {
    private static instance;
    private storage;
    static readonly THEMES: Theme[];
    static readonly THEME_KEY = "theme";
    static readonly AUTO_THEME_KEY = "autoTheme";
    private constructor();
    static getInstance(): ThemeService;
    getSystemTheme(): Theme;
    getCurrentTheme(): Theme;
    setTheme(theme: Theme): void;
    setAutoTheme(enabled: boolean): void;
    isAutoThemeEnabled(): boolean;
}
