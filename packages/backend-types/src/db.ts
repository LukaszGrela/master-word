export interface IDictionaryEntry {
  language: string;
  length: number;
  letter: string;
  words?: string[];
}

export interface IUnknownWordWordsItem {
  language: string;
  word: string;
  length: number;
}
export interface IUnknownWordEntry {
  date: Date;
  words: IUnknownWordWordsItem[];
}
export interface IConfigEntry {
  /**
   * Configuration key
   */
  key: string;
  /**
   * JSON stringified value of the configuration
   */
  value: string;
  /**
   * List of application ids that this config applies to
   * Note: empty list means config turned off
   */
  appId: string[];
}
