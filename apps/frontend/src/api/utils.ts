import { TPartialGameState } from './types';

export const createGameState = (
  attempts: number,
  wordLength: number
): TPartialGameState => {
  const word = Array.from(Array(wordLength)).map(() => '');
  return Array.from(Array(attempts)).map(() => ({
    word: word.concat(),
  }));
};
