export type TLangAndLength = {
  language: string;
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
  language?: string;
  length?: number;
};

export type TCountDictionaryResponse = {
  language: string;
  length: number;
  alphabet: string[];
  wordCount: number;
};
export type TLanguagesList = { languages: string[] };
