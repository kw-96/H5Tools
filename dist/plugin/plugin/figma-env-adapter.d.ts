declare class FigmaFile {
    data: Uint8Array;
    name: string;
    type: string;
    constructor(data: Uint8Array, name: string, type?: string);
    get size(): number;
}
declare class FigmaFileReader {
    result: string | ArrayBuffer | null;
    error: Error | null;
    onload: ((event: {
        target: {
            result: string | ArrayBuffer | null;
        };
    }) => void) | null;
    onerror: ((event: {
        target: {
            error: Error | null;
        };
    }) => void) | null;
    readAsDataURL(file: FigmaFile): void;
    readAsArrayBuffer(file: FigmaFile): void;
}
export declare const FigmaEnvAdapter: {
    storage: {
        getItem: (key: string) => Promise<any>;
        setItem: (key: string, value: string) => Promise<void>;
        removeItem: (key: string) => Promise<void>;
    };
    File: typeof FigmaFile;
    FileReader: typeof FigmaFileReader;
    URL: {
        createObjectURL: (data: Uint8Array, mimeType?: string) => string;
    };
    atob: (str: string) => string;
    init(): void;
};
export {};
