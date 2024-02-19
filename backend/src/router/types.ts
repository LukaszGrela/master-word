import { TSupportedLanguages } from '../types';

export type TRandomWordResponse = {
  language: TSupportedLanguages;
  word: string;
  error?: string;
};

export type TRandomWordQuery = {
  language: TSupportedLanguages;
  wordLength: number;
};

export type TIsCorrectWordResponse = {
  word: string;
  validWord: boolean;
  language: TSupportedLanguages;

  error?: string;
};

export type TSessionQuery = { session?: string };
export type TInitQuery = TSessionQuery & { language?: TSupportedLanguages };

export type TNextAttemptQuery = TSessionQuery & { guess: string };
