import { TGameSessionRecord, TGameStep } from '@repo/backend-types';
import { apiInit } from './endpoints';
import { TPartialGameState } from './types';
import { createGameState } from './utils';

export const getInit = async (params: {
  language: 'pl' | 'en';
  session?: string;
  signal?: AbortSignal | null | undefined;
}) => {
  const response = await fetch(apiInit(params.language, params.session), {
    method: 'GET',
    signal: params.signal,
  });

  const data = JSON.parse(await response.text()) as TGameSessionRecord;

  if (response.ok) {
    // inflate the game state
    const attempts = data.game.max_attempts;
    const emptyGameState = createGameState(attempts, data.game.word_length);
    const state = (data.game.state as TPartialGameState)
      .concat(emptyGameState)
      .slice(0, attempts);

    data.game.state = state as TGameStep[];

    return Promise.resolve(data);
  }

  return Promise.reject(data);
};
