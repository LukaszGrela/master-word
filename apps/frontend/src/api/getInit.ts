import { TGameSession, TGameStep } from '@repo/backend-types';
import { apiInit } from './endpoints';
import { TPartialGameState } from './types';
import { createGameState } from './utils';

export const getInit = async (params: {
  language: string;
  maxAttempts?: number;
  wordLength?: number;
  session?: string;
  signal?: AbortSignal | null | undefined;
}) => {
  const response = await fetch(
    apiInit(
      params.language,
      params.session,
      params.maxAttempts,
      params.wordLength,
    ),
    {
      method: 'GET',
      signal: params.signal,
    },
  );

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
    }
    return Promise.resolve(data);
  }

  return Promise.reject(data);
};
