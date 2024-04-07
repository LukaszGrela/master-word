import { IDictionary } from '@repo/common-types';

// the game
// Wrong - X, Misplaced - M, Correct - C
export type TValidationChar = 'X' | 'M' | 'C';

export const guardTValidationChar = (
  test: unknown,
): test is TValidationChar => {
  return (
    typeof test === 'string' && (test === 'X' || test === 'M' || test === 'C')
  );
};

export type TGameStep = {
  word: string[];
  validated: TValidationChar[];
};

export type TGameSessionFinished = {
  finished: true;
  timestamp_finish: string;
};
export type TGameSessionIncomplete = {
  finished: false;
};

export type TScore = {
  score: number;
  timeMs: number;
  attempts: number;
  language: string;
  length: number;
};

export type TGameRecord = {
  attempt: number;
  guessed: boolean;
  language: string;
  max_attempts: number;
  score: number;
  state: TGameStep[];
  timestamp_start: string;
  word_length: number;
  word: string;
} & (TGameSessionFinished | TGameSessionIncomplete);

/**
 * Game play session, holds identifier to the current game and archived games
 */
export type TGameSession = {
  session: string;
  highest?: IDictionary<TScore>;
  game?: TGameRecord;
};

/*
const game: TGameRecord = {
  attempt: 0,
  finished: false,
  guessed: false,
  language: 'pl',
  max_attempts: 8,
  score: 0,
  state: [],
  timestamp_start: '1711623239613',
  word_length: 5,
  word: 'robak',
};
console.log(game);
*/

/**
 * Archive record entry
 */
export type TGameRecordArchive = {
  session: string;
} & TGameRecord;
