export enum EPaths {
  ROOT = '/',
  GAME = '/game',
  GAME_ERROR = '/game/error',
  RESULTS = '/results/:result',
}

export const getResultsPath = (result: 'win' | 'lose') => `/results/${result}`;
