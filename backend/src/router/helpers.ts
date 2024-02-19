import fs from 'fs/promises';
import { ErrorCodes } from '../enums';
import type {
  TGameSession,
  TSupportedLanguages,
  TValidationChar,
} from '../types';
import { MAX_ATTEMTPS } from '../constants';

export async function getLocalDictionary(
  language: TSupportedLanguages = 'pl',
  wordLength = 5
): Promise<string[]> {
  const file = `dictionaries/${wordLength}/${language}.json`;
  // load file then pick
  try {
    const data = await fs.readFile(file, {
      encoding: 'utf-8',
    });
    return JSON.parse(data) as string[];
  } catch (error) {
    console.log(error);
    return Promise.reject({
      code: ErrorCodes.LOCAL_DICTIONARY_ERROR,
      error: `Can't retrieve dictionary: ${file}.`,
      language,
    });
  }
  //
}

export const resetGameSession = (
  language: TSupportedLanguages,
  word: string
): TGameSession => {
  return {
    language,
    max_attempts: MAX_ATTEMTPS,
    attempt: 0,
    word: word.toLocaleUpperCase(),
    word_length: word.length,
    state: [],
    finished: false,
    guessed: false,
    timestamp_start: `${new Date().getTime()}`,
  };
};

export const validateWord = (
  guess: string[],
  compare: string[],
  isGuessed: boolean
): { guessed: boolean; validated: TValidationChar[] } => {
  const validated: TValidationChar[] = Array.from(Array(compare.length)).map(
    () => (isGuessed ? 'C' : 'X')
  );

  if (!isGuessed) {
    const from = guess.concat();
    const to = compare.concat();
    // green pass
    for (let i = 0; i < from.length; i++) {
      const letter = from[i];

      if (letter === to[i]) {
        validated[i] = 'C';
        from[i] = '';
        to[i] = '';
      }
    }

    // orange pass
    for (let i = 0; i < from.length; i++) {
      const letter = from[i];

      if (letter && to.includes(letter)) {
        validated[i] = 'M';
        from[i] = '';
        const toIndex = to.findIndex((char) => char === letter);
        to[toIndex] = '';
      }
    }
  }

  return {
    guessed: isGuessed,
    validated,
  };
};
