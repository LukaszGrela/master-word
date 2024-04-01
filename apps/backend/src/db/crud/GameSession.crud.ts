import { TGameSession } from '@repo/backend-types';
import { MAX_ATTEMPTS } from '../../constants';
import { GameSession } from '../models/GameSession';

export const createNewGameSession = async (
  session: string,
  language: string,
  word: string,
  maxAttempts: number = MAX_ATTEMPTS,
) => {
  return GameSession.create<TGameSession>({
    session,
    game: {
      attempt: 0,
      finished: false,
      guessed: false,
      language,
      max_attempts: maxAttempts,
      score: 0,
      state: [],
      timestamp_start: `${new Date().getTime()}`,
      word_length: word.length,
      word: word.toLocaleUpperCase(),
    },
  });
};

export const findSession = async (session: string) => {
  return GameSession.findOne({
    session,
  }).exec();
};
