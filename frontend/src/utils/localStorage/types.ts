export interface IStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  has(key: string): boolean;
  clear(): void;
  clearStorage(): void;

  getNameSpace(): string;
  setNameSpace(ns: string): void;
}
