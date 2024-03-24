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

type TPrimitives = 'string' | 'number' | 'boolean';
type TListOfPrimitives = `${TPrimitives}[]`;
export type TConfigEntryValueTypes = TPrimitives | TListOfPrimitives;
export type TConfigEntryValueTypesMap = {
  string: string;
  number: number;
  boolean: boolean;
  'string[]': string[];
  'number[]': number[];
  'boolean[]': boolean[];
};

export interface IConfigEntry {
  /**
   * Configuration key
   */
  key: TConfigEntryKey;
  /**
   * Value of the configuration
   */
  value: string | number | boolean | string[] | number[] | boolean[];
  /**
   * Default value
   */
  defaultsTo?: string | number | boolean | string[] | number[] | boolean[];
  /**
   * Which other key contains source of valid values (for list types only)
   */
  sourceValuesKey?: TConfigEntryKey;
  /**
   * List of application ids that this config applies to
   * Note: empty list means config turned off
   */
  appId: string[];
}

export type TConfigEntryKey =
  | /* list of all languages */ 'supportedLanguages'
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
