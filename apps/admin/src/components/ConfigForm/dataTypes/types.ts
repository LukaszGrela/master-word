import { TConfigEntryKey } from '@repo/backend-types/db';

export interface IProps {
  configKey: Exclude<
    TConfigEntryKey,
    'enabledLanguages' | 'supportedLanguages'
  >;
}
export interface ILangaugeListProps {
  configKey: Extract<
    TConfigEntryKey,
    'enabledLanguages' | 'supportedLanguages'
  >;
}
