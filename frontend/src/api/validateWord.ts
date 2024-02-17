import { TValidationChar } from '../game/types';

export type TValidationResponse = {
  valid: boolean;
  result: TValidationChar[];
  guessed: boolean;
  finished: boolean;
  error?: string;
  wordToGuess?: string;
};

const validateWord = async (
  guess: string,
  compare: string[],
  noAttempts?: boolean
): Promise<TValidationResponse> => {
  const wordToGuess = compare.join('');
  const guessed = wordToGuess === guess;

  const validated: TValidationChar[] = Array.from(Array(compare.length)).map(
    () => (guessed ? 'C' : 'X')
  );

  const from = guess.split('');
  const to = compare.concat();
  if (!guessed) {
    // green pass
    for (let i = 0; i < from.length; i++) {
      const letter = from[i];

      if (letter === to[i]) {
        validated[i] = 'C';
        from[i] = '';
        to[i] = '';
      }
    }

    // orange pass
    for (let i = 0; i < from.length; i++) {
      const letter = from[i];

      if (letter && to.includes(letter)) {
        validated[i] = 'M';
        from[i] = '';
        const toIndex = to.findIndex((char) => char === letter);
        to[toIndex] = '';
      }
    }
  }
  const finished = guessed || !!noAttempts;
  return Promise.resolve({
    valid: guess !== 'LOSER' && guess.length === 5,
    result: validated,
    guessed,
    finished,
    wordToGuess: finished ? wordToGuess : undefined,
    error:
      guess === 'LOSER'
        ? 'Test error'
        : guess.length !== 5
        ? 'Invalid length'
        : undefined,
  });
};

export default validateWord;
