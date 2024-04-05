import { TGameSession, TGameStep } from '@repo/backend-types';
import { apiNextAttempt } from './endpoints';
import { TPartialGameState } from './types';
import { createGameState } from './utils';

type TForcedGame = Required<Omit<TGameSession, 'highest'>> &
  Pick<TGameSession, 'highest'>;

export const inflateGameState = (
  gameSession: TGameSession,
): TForcedGame | null => {
  if (!gameSession.game) return null;
  const attempts = gameSession.game.max_attempts;
  const emptyGameState = createGameState(
    attempts,
    gameSession.game.word_length,
  );
  const state = (gameSession.game.state as TPartialGameState)
    .concat(emptyGameState)
    .slice(0, attempts);

  gameSession.game.state = state as TGameStep[];

  return gameSession as TForcedGame;
};

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
    const inflated = inflateGameState(data);
    if (inflated) {
      return Promise.resolve(inflated);
    }
  }

  return Promise.reject(data);
};
