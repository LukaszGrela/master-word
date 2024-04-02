import { Request, Response, RequestHandler } from 'express';
import { TGameRecord, TValidationChar } from '@repo/backend-types';
import { MAX_ATTEMPTS, WORD_LENGTH } from '../constants';
import { TIsCorrectWordResponse, TRandomWordResponse } from './types';
import { ErrorCodes } from '@repo/backend-types/enums';
import { getRandomWord, wordExists } from '../db/crud/Dictionary.crud';

export const resetGameSession = (
  language: string,
  word: string,
  maxAttempts: number = MAX_ATTEMPTS,
): TGameRecord => {
  return {
    language,
    max_attempts: maxAttempts,
    attempt: 0,
    word: word.toLocaleUpperCase(),
    word_length: word.length,
    state: [],
    finished: false,
    guessed: false,
    score: 0,
    timestamp_start: `${new Date().getTime()}`,
  };
};

export const validateWord = (
  guess: string[],
  compare: string[],
  isGuessed: boolean,
): { guessed: boolean; validated: TValidationChar[] } => {
  const validated: TValidationChar[] = Array.from(Array(compare.length)).map(
    () => (isGuessed ? 'C' : 'X'),
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

/**
 * Score is made up from the attempts
 * and time using following matrix,
 * when overall score is the same then
 * times are compared.
 * ```
 *                     +¼  +¾  +1½
 *       Time(s)   >60 >35 >15 <16
 * Attempts       ┏━━━┳━━━┳━━━┳━━━┓
 *     1,2,3      ┃ 3 ┃ 3¼┃ 3¾┃ 4½┃
 *                ┣━━━╋━━━╋━━━╋━━━┫
 *       4,5      ┃ 2 ┃ 2¼┃ 2¾┃ 3½┃
 *                ┣━━━╋━━━╋━━━╋━━━┫
 *       6,7      ┃ 1 ┃ 1¼┃ 1¾┃ 2½┃
 *                ┣━━━╋━━━╋━━━╋━━━┫
 *         8      ┃ ½ ┃ ¾ ┃ 1¼┃ 2 ┃
 *                ┗━━━┻━━━┻━━━┻━━━┛
 * ```
 */
export const calculateScore = (
  win: boolean,
  attempt: number,
  playTimeMs: number,
): number => {
  let score = 0;
  if (win) {
    score = 0.5; // won max attempts
    if (attempt < 8) {
      score = 1;
    }
    if (attempt < 6) {
      score = 2;
    }
    if (attempt < 4) {
      score = 3;
    }

    // time extras
    //                  +¼  +¾  +1½
    //       Time(s)    >35 >15 <=15
    const seconds = playTimeMs / 1000;
    if (seconds <= 15) {
      score += 1.5;
    }
    if (seconds > 15 && seconds <= 35) {
      score += 0.75;
    }
    if (seconds > 35 && seconds <= 60) {
      score += 0.25;
    }
  }
  return score;
};
const isDevelopment = process.env.NODE_ENV === 'development';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isAuthorised = (req: Request, res: Response): boolean => {
  /* passport related
  if(!req.isAuthenticated()) {
    return false;
  }
  */

  if (isDevelopment) {
    console.warn('TODO: implement authorisation');
  }
  return true;
};

export function ensureLoggedIn(): RequestHandler {
  return function ensureAuthenticatedRequestHandler(req, res, next): void {
    /* istanbul ignore else */
    if (isAuthorised(req, res)) {
      next();
    } /* else - the failure is handled by isAuthorised itself */
  };
}

export async function randomWord(
  language = 'pl',
  wordLength: number = WORD_LENGTH,
): Promise<TRandomWordResponse> {
  if (language !== 'en') {
    try {
      const word = await getRandomWord(language, wordLength);
      return {
        word,
        language,
      } as TRandomWordResponse;
    } catch (error) {
      console.log(error);
      return Promise.reject({
        code: ErrorCodes.RANDOM_WORD_ERROR,
        error: `Can't retrieve ${language} word.`,
        language,
      });
    }
  } else {
    // call external API endpoint
    try {
      const result = await fetch(
        'https://words.dev-apis.com/word-of-the-day?random=1',
      );
      const response = (await result.json()) as { error?: string };

      if (result.ok) {
        return { ...response, language: 'en' } as TRandomWordResponse;
      } else {
        throw response.error;
      }
    } catch (error) {
      console.log(error);
      return Promise.reject({
        code: ErrorCodes.RANDOM_WORD_ERROR,
        language: 'en',
        error: "Can't retrieve english word.",
      });
    }
  }
}

export const isWordCorrect = async (
  word: string,
  language: string,
  wordLength: number = WORD_LENGTH,
) => {
  if (language === 'en') {
    try {
      const response = await fetch('https://words.dev-apis.com/validate-word', {
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ word }),
      });
      const data = JSON.parse(await response.text()) as TIsCorrectWordResponse;
      if (response.ok) {
        if (!data.validWord) {
          return { ...data, language, error: 'Invalid word' };
        }
        return { ...data, language };
      } else {
        // endpoint returned error
        console.log(data);
        return {
          ...data,
          word,
          validWord: true,
          error: 'Validation endpoint error',
          language,
        };
      }
    } catch (error) {
      console.log(error);
      // something is broken, accept word for game play
      return {
        word,
        validWord: true,
        error: (error as Error).message || 'Validation endpoint error',
        language,
      };
    }
  } else {
    const needle = word.toLocaleLowerCase();
    // search for the word
    const result = await wordExists(needle, language, wordLength);

    if (result) {
      // correct
      return {
        word,
        language,
        validWord: true,
      };
    } else {
      // incorrect
      return {
        word,
        language,
        validWord: false,
        error: 'Word not found',
      };
    }
  }
};
