import { hasOwn } from '@repo/utils';
import type { TErrorResponse, TPartialGameState } from './types';

export const createGameState = (
  attempts: number,
  wordLength: number,
): TPartialGameState => {
  const word = Array.from(Array(wordLength)).map(() => '');
  return Array.from(Array(attempts)).map(() => ({
    word: word.concat(),
  }));
};


export const guardTErrorResponse = (test: unknown): test is TErrorResponse => {
  return !!test && hasOwn(test, 'error') && hasOwn(test, 'code');
};

export const toErrorResponse = (
  error: Error | TErrorResponse,
): TErrorResponse => {
  if (guardTErrorResponse(error)) {
    return error;
  }

  return {
    code: -1,
    error: error.message,
    details: error.name,
  };
};
