import { TConfigEntryKey } from '@repo/backend-types/db';

type TConfigMap = {
  [key in Extract<
    TConfigEntryKey,
    'enabledAttempts' | 'enabledLanguages' | 'enabledLength'
  >]: unknown;
};

export interface IConfig extends TConfigMap {
  enabledLanguages: string[];
  enabledLength: number[];
  enabledAttempts: number[];
}

export interface IConfigContext {
  loading: boolean;
  error?: Error;

  config: IConfig;
  refresh: () => void;
}
