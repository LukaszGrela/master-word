export enum EPaths {
  ROOT = '/',
  GAME = '/game',
  RESULTS = '/results/:result',
}

export const getResultsPath = (result: 'win' | 'lose') => `/results/${result}`;
