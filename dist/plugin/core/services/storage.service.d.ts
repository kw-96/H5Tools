export declare class StorageService {
    private static instance;
    private storage;
    private constructor();
    static getInstance(): StorageService;
    setItem(key: string, value: string): void;
    getItem(key: string): string | null;
    removeItem(key: string): void;
    clear(): void;
    keys(): string[];
}
