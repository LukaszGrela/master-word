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
