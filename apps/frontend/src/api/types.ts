import { PartialPick } from '@repo/common-types';
import { TGameStep } from '@repo/backend-types';
import { hasOwn } from '@repo/utils';
export type TSupportedLanguages = 'pl' | 'en';

export type TPartialGameState = PartialPick<TGameStep, 'word'>[];

export type TErrorResponse = {
  error: string;
  code: number /* ErrorCodes */;

  details?: string;
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
