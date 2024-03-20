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
type TConfigEntryValueTypes = TPrimitives | TListOfPrimitives;

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
    /**
     * Type of the `value`: 'string','number','boolean','<type>[]'
     */
    type: TConfigEntryValueTypes;
    /**
     * JSON stringified default value
     */
    defaultsTo?: string;

    /**
     * Which other key contains source of valid values
     */
    sourceValuesKey?: TConfigEntryKey;
  };

  admin?: {
    /**
     * Display label for this configuration (english)
     */
    label: string;
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
