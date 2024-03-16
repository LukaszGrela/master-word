import { PartialPick } from '@repo/common-types';
import { TGameStep } from '@repo/backend-types';
import { hasOwn } from '@repo/utils';
export type TSupportedLanguages = 'pl' | 'en';

export type TPartialGameState = PartialPick<TGameStep, 'word'>[];

export type TErrorResponse = {
  error: string;
  code: number /* ErrorCodes */;
};

export const guardTErrorResponse = (test: unknown): test is TErrorResponse => {
  return !!test && hasOwn(test, 'error') && hasOwn(test, 'code');
};
