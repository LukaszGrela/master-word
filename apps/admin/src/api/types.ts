import { IUnknownWordEntry } from '@repo/backend-types/db';
import {
  TCountDictionaryResponse,
  TLanguagesList,
  TTableData,
} from '@repo/backend-types/dictionary';

export type TPostAddWordParams = {
  word: string;
  language?: 'pl' | 'en';
  length?: number;
  signal?: AbortSignal | null | undefined;
};

export type TUnknownWordEntry = {
  _id: string;
} & Omit<IUnknownWordEntry, 'date'> & { date: string };

export type TPostRejectApproveWords = {
  words: TTableData[];
  signal?: AbortSignal | null | undefined;
};

export type TDictionaryLanguagesResponse = [TLanguagesList];
export type TDictionaryStatsResponse = [TCountDictionaryResponse];
