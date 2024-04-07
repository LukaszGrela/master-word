import { IConfigEntry } from '@repo/backend-types/db';
import { apiConfig } from './endpoints';

export const getConfig = async ({
  signal,
}: {
  signal?: AbortSignal | null | undefined;
}) => {
  const response = await fetch(apiConfig(), {
    method: 'GET',
    signal,
  });

  const data = JSON.parse(await response.text()) as IConfigEntry[];

  if (response.ok) {
    // TODO: we can inflate data types here
    return Promise.resolve(data);
  }

  return Promise.reject(data);
};
