export type TPostAddWordParams = {
  word: string;
  language?: 'pl' | 'en';
  length?: number;
  signal?: AbortSignal | null | undefined;
};

export type TUnknownWordEntry = {
  _id: string;
  date: string;
  words: { language: string; word: string; length?: number }[];
};
export type TTableData = {
  word: string;
  date: string;
  language: string;
  parentId: string;
  length?: number;
};
export type TPostRejectApproveWords = {
  words: TTableData[];
  signal?: AbortSignal | null | undefined;
};

export type TDictionaryLanguagesResponse = [{ languages: string[] }];
export type TDictionaryStatsResponse = [
  { language: string; length: number; alphabet: string[]; wordCount: number },
];
