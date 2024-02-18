// Wrong - X, Misplaced - M, Correct - C
export type TValidationChar = 'X' | 'M' | 'C';
export type TGameState = {
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

export type TGameSession = {
  language: 'pl' | 'en';

  timestamp_start: string;
  max_attempts: number;
  attempt: number;
  word: string;
  word_length: number;
  state: TGameState[];
  guessed: boolean;
} & (TGameSessionFinished | TGameSessionIncomplete);

export type TGameSessionRecord = {
  session: string;
  game: TGameSession;
};

export type PartialPick<T, K extends keyof T> = Partial<Omit<T, K>> &
  Pick<T, K>;

export type TPartialGameState = PartialPick<TGameState, 'word'>[];
