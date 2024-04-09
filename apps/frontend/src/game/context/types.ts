import { TGameRecord, TScore } from '@repo/backend-types';
import { IDictionary } from '@repo/common-types';
import { TErrorResponse } from '../../api';

export interface IGameContext {
  init: (
    language: string,
    maxAttempts: number,
    wordLength: number,
    session?: string,
  ) => void;
  guess: (word: string) => void;

  loading: boolean;
  error?: TErrorResponse;

  session?: string;

  language: string;
  maxAttempts: number;
  wordLength: number;

  highest?: IDictionary<TScore>;
  game?: TGameRecord;
}
