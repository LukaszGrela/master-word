// the game
// Wrong - X, Misplaced - M, Correct - C
export type TValidationChar = 'X' | 'M' | 'C';
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

export type TGameSession = {
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

export type TGameSessionRecord = {
  session: string;
  highest?: TScore;
  game: TGameSession;
};
