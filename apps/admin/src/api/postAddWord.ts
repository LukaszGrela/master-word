import { apiAddWord } from './endpoints';
import { TPostAddWordParams } from './types';

export const postAddWord = async (params: TPostAddWordParams) => {
  const response = await fetch(apiAddWord(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      word: params.word,
      language: params.language || 'pl',
      length: Number(params.length) || 5,
    }),
    signal: params.signal,
  });

  if (response.ok) {
    return Promise.resolve(JSON.parse(await response.text()) as string);
  }

  return Promise.reject(JSON.parse(await response.text()) as Error);
};
