import { IStorage } from './types';
export class AppStorage implements IStorage {
  private static instance: AppStorage;
  private storage: Storage;

  private appStorageNameSpace: string = 'GD.MasterWord';

  private constructor() {
    this.storage = window.localStorage;
  }

  public static getInstance(): IStorage {
    if (!AppStorage.instance) {
      AppStorage.instance = new AppStorage();
    }

    return AppStorage.instance;
  }

  private getNSKey(key: string): string {
    return `${this.appStorageNameSpace}::${key}`;
  }

  getNameSpace(): string {
    return this.appStorageNameSpace;
  }
  setNameSpace(ns: string): void {
    this.appStorageNameSpace = ns;
  }

  getItem(key: string): string | null {
    return this.storage.getItem(this.getNSKey(key));
  }

  setItem(key: string, value: string): void {
    this.storage.setItem(this.getNSKey(key), value);
  }

  removeItem(key: string): void {
    this.storage.removeItem(this.getNSKey(key));
  }

  has(key: string): boolean {
    if (this.storage.length === 0) {
      return false;
    }
    return Object.keys(this.storage).indexOf(this.getNSKey(key)) !== -1;
  }

  clear(): void {
    this.storage.clear();
  }

  clearStorage(): void {
    if (this.storage.length > 0) {
      const ns = this.getNSKey('');
      Object.keys(this.storage).forEach((key) => {
        if (key.indexOf(ns) === 0) {
          this.storage.removeItem(key);
        }
      });
    }
  }
}
