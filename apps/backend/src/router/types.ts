export type TRandomWordResponse = {
  language: string;
  word: string;
  error?: string;
};

export type TRandomWordQuery = {
  language: string;
  wordLength: number;
};

export type TIsCorrectWordResponse = {
  word: string;
  validWord: boolean;
  language: string;

  error?: string;
};

export type TSessionQuery = { session?: string };
export type TLanguageQuery = { language?: string };
export type TAttemptsQuery = { maxAttempts?: number };
export type TInitQuery = TSessionQuery & TLanguageQuery & TAttemptsQuery;

export type TNextAttemptQuery = TSessionQuery & { guess: string };

export type TValidateWordBody = { word: string } & TLanguageQuery;
