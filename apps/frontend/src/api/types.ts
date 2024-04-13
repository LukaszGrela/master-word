import { TPartialPick } from '@repo/common-types';
import { TGameStep } from '@repo/backend-types';

export type TSupportedLanguages = 'pl' | 'en';

export type TPartialGameState = TPartialPick<TGameStep, 'validated'>[];

export type TErrorResponse = {
  error: string;
  code: number /* ErrorCodes */;

  details?: string;
};
