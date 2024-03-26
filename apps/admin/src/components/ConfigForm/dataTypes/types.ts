import { TConfigEntryKey } from '@repo/backend-types/db';

export interface IProps {
  configKey: Exclude<
    TConfigEntryKey,
    | 'enabledLanguages'
    | 'supportedLanguages'
    | 'enabledAttempts'
    | 'supportedAttempts'
    | 'enabledLength'
    | 'supportedLength'
  >;
}
export interface ILangaugeListProps {
  configKey: Extract<
    TConfigEntryKey,
    'enabledLanguages' | 'supportedLanguages'
  >;
}
export interface INumberListProps {
  configKey: Extract<
    TConfigEntryKey,
    | 'enabledAttempts'
    | 'supportedAttempts'
    | 'enabledLength'
    | 'supportedLength'
  >;
}
