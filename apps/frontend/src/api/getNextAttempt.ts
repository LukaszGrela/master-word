import { TGameSession, TGameStep } from '@repo/backend-types';
import { apiNextAttempt } from './endpoints';
import { TPartialGameState } from './types';
import { createGameState } from './utils';

type TForcedGame = Required<Omit<TGameSession, 'highest'>> &
  Pick<TGameSession, 'highest'>;

export const getNextAttempt = async (params: {
  guess: string;
  session: string;
  signal?: AbortSignal | null | undefined;
}): Promise<TForcedGame> => {
  const response = await fetch(apiNextAttempt(params.guess, params.session), {
    method: 'GET',
    signal: params.signal,
  });

  const data = JSON.parse(await response.text()) as TGameSession;

  if (response.ok) {
    // inflate the game state
    if (data.game) {
      const attempts = data.game.max_attempts;
      const emptyGameState = createGameState(attempts, data.game.word_length);
      const state = (data.game.state as TPartialGameState)
        .concat(emptyGameState)
        .slice(0, attempts);

      data.game.state = state as TGameStep[];
      return Promise.resolve(data as TForcedGame);
    }
  }

  return Promise.reject(data);
};
