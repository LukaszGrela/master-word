import { Request, Response, RequestHandler } from 'express';
import type {
  TGameSession,
  TSupportedLanguages,
  TValidationChar,
} from '../types';
import { MAX_ATTEMTPS } from '../constants';

export const resetGameSession = (
  language: TSupportedLanguages,
  word: string,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const isAuthorised = (req: Request, res: Response): boolean => {
  /* passport related
  if(!req.isAuthenticated()) {
    return false;
  }
  */
  console.warn('TODO: implement authorisation');
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