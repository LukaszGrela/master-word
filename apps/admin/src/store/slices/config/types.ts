import { TConfigEntryKey } from '@repo/backend-types/db';

type TConfigMap = {
  [key in Extract<
    TConfigEntryKey,
    'supportedLanguages' | 'supportedLength'
  >]: unknown;
};

export interface IConfigState extends TConfigMap {
  supportedLanguages: string[];
  supportedLength: number[];

  selectedLanguage: string;
  selectedLength: number;
}

export type TSetConfigPayload = Pick<
  IConfigState,
  'supportedLanguages' | 'supportedLength'
>;
