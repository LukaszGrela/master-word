import { apiRejectWords } from './endpoints';
import { TPostRejectApproveWords } from './types';

export const postRejectWords = async ({
  signal,
  ...params
}: TPostRejectApproveWords) => {
  const response = await fetch(apiRejectWords(), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(params),
    signal,
  });

  if (response.ok) {
    return Promise.resolve(JSON.parse(await response.text()) as string);
  }

  return Promise.reject(JSON.parse(await response.text()) as Error);
};
