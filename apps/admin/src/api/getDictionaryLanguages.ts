import { apiDictionaryLanguages } from './endpoints';
import { TDictionaryLanguagesResponse } from './types';

export const getDictionaryLanguages = async (
  length = 5,
  signal?: AbortSignal | null | undefined,
) => {
  const response = await fetch(apiDictionaryLanguages(length), {
    method: 'GET',
    signal,
  });

  if (response.ok) {
    return Promise.resolve(
      JSON.parse(await response.text()) as TDictionaryLanguagesResponse,
    );
  }

  return Promise.reject(JSON.parse(await response.text()) as Error);
};
