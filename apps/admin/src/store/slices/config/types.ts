import { TConfigEntryKey } from '@repo/backend-types/db';

type TConfigKeys = Extract<
  TConfigEntryKey,
  'supportedLanguages' | 'supportedLength'
>;
type TConfigMap = {
  [key in TConfigKeys]: unknown;
};

export interface IConfigState extends TConfigMap {
  supportedLanguages: string[];
  supportedLength: number[];

  selectedLanguage: string;
  selectedLength: number;
}

export type TSetConfigPayload = Pick<IConfigState, TConfigKeys>;

export const isAdminConfiguration = (
  key: TConfigEntryKey,
): key is TConfigKeys =>
  key === 'supportedLanguages' || key === 'supportedLength';
