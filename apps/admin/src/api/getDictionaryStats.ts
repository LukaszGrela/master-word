import { apiDictionaryStats } from './endpoints';
import { TDictionaryStatsResponse } from './types';

export const getDictionaryStats = async (
  language = 'pl',
  length = 5,
  signal?: AbortSignal | null | undefined
) => {
  const response = await fetch(apiDictionaryStats(language, length), {
    method: 'GET',
    signal,
  });

  if (response.ok) {
    return Promise.resolve(
      JSON.parse(await response.text()) as TDictionaryStatsResponse
    );
  }

  return Promise.reject(JSON.parse(await response.text()) as Error);
};
