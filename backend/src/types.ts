export type TSupportedLanguages = 'pl' | 'en';

// the game
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
  language: TSupportedLanguages;

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
