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
};

export type TGameRecord = {
  language: string;

  timestamp_start: string;
  max_attempts: number;
  attempt: number;
  word: string;
  word_length: number;
  state: TGameStep[];
  guessed: boolean;
  score: number;
} & (TGameSessionFinished | TGameSessionIncomplete);

export type TGameSession = {
  session: string;
  highest?: TScore;
  game: TGameRecord;
};
