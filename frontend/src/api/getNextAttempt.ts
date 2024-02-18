import { apiNextAttempt } from './endpoints';
import { TGameSessionRecord, TGameState, TPartialGameState } from './types';
import { createGameState } from './utils';

export const getNextAttempt = async (params: {
  guess: string;
  session: string;
  signal?: AbortSignal | null | undefined;
}) => {
  const response = await fetch(apiNextAttempt(params.guess, params.session), {
    method: 'GET',
    signal: params.signal,
  });

  const data = JSON.parse(await response.text()) as TGameSessionRecord;

  // inflate the game state
  const attempts = data.game.max_attempts;
  const emptyGameState = createGameState(attempts, data.game.word_length);
  const state = (data.game.state as TPartialGameState)
    .concat(emptyGameState)
    .slice(0, attempts);

  console.log('state', state);

  data.game.state = state as TGameState[];

  return data;
};
