import { PartialPick } from '@repo/common-types';
import { TGameStep } from '@repo/backend-types';

export type TSupportedLanguages = 'pl' | 'en';

export type TPartialGameState = PartialPick<TGameStep, 'word'>[];

export type TErrorResponse = {
  error: string;
  code: number /* ErrorCodes */;

  details?: string;
};
