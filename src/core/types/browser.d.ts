// 浏览器API类型声明
declare interface Window {
  matchMedia(query: string): MediaQueryList;
  localStorage: Storage;
  storageAdapter: StorageAdapter; // 使用具体的类型
}

declare interface MediaQueryList {
  matches: boolean;
  media: string;
  onchange: ((this: MediaQueryList, ev: MediaQueryListEvent) => void) | null;
  addListener(listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => void)): void;
  removeListener(listener: ((this: MediaQueryList, ev: MediaQueryListEvent) => void)): void;
}

declare interface MediaQueryListEvent {
  matches: boolean;
  media: string;
}

// 全局函数
declare function btoa(data: string): string;
declare function atob(data: string): string;

// 文件相关类型
declare class FileReader {
  readAsArrayBuffer(blob: Blob): void;
  readAsDataURL(blob: Blob): void;
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null;
  result: string | ArrayBuffer | null;
  error: DOMException | null;
}

declare interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
  readonly webkitRelativePath: string;
  readonly size: number;
  readonly type: string;
}

// URL类型
declare class URL {
  constructor(url: string, base?: string | URL);
  toString(): string;
  href: string;
  origin: string;
  protocol: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  
  static createObjectURL(blob: Blob): string;
  static revokeObjectURL(url: string): void;
}

// 存储适配器类型
declare interface StorageAdapter {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
} 