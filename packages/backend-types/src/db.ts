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
  key: TConfigEntryKey;
  /**
   * JSON stringified value of the configuration
   */
  value: string;
  /**
   * List of application ids that this config applies to
   * Note: empty list means config turned off
   */
  appId: string[];

  /**
   * Object describing data type of the value
   */
  validation: {
    type: string;
    /**
     * JSON stringified default value
     */
    defaultsTo?: string;
  };
}

export type TConfigEntryKey =
  | /* list of all langauges */ 'supportedLanguages'
  | /* list of all allowed attempts */ 'supportedAttempts'
  | /* list of all allowed word lenght */ 'supportedLength'
  | /* frontend enabled */ 'enabledLanguages'
  | /* frontend enabled */ 'enabledAttempts'
  | /* frontend enabled */ 'enabledLength';

export const guardTConfigEntryKey = (
  test: unknown,
): test is TConfigEntryKey => {
  return (
    [
      'supportedLanguages',
      'supportedAttempts',
      'supportedLength',
      'enabledLanguages',
      'enabledAttempts',
      'enabledLength',
    ].indexOf(test as TConfigEntryKey) !== -1
  );
};
