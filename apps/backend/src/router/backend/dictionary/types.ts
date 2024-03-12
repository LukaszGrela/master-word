import { TSupportedLanguages } from '../../../types';

type TLangAndLength = {
  language: TSupportedLanguages;
  length: number;
};

export type TAddWordRequestBody = {
  word: string;
} & TLangAndLength;

export type TAddManyWordsRequestBody = {
  words: string[];
} & TLangAndLength;

export type TTableData = {
  word: string;
  date: string;
  language: string;
  parentId: string;
  length?: number;
};

export type TApproveRejectRequestBody = {
  words: TTableData[];
};

export type TDictionaryStatsQuery = {
  language?: TSupportedLanguages;
  length?: number;
};
