import { apiUnknownWords } from './endpoints';
import { TUnknownWordEntry } from './types';

export const getUnknownWords = async (
  signal?: AbortSignal | null | undefined
) => {
  const response = await fetch(apiUnknownWords(), {
    method: 'GET',
    signal,
  });

  if (response.ok) {
    return Promise.resolve(
      JSON.parse(await response.text()) as TUnknownWordEntry[]
    );
  }

  return Promise.reject(JSON.parse(await response.text()) as Error);
};
