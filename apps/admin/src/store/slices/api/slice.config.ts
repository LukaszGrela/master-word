import { IConfigEntry } from '@repo/backend-types/db';
import { adminApi } from './slice';
import { apiConfig } from './endpoints';
import { isAdminConfiguration, setConfig } from '../config';
import type { TSetConfigPayload } from '../config';
import { hydrate } from '../config-form';

export const configApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getConfiguration: builder.query<
      IConfigEntry[],
      string | string[] | undefined
    >({
      query: () => apiConfig(),
      onQueryStarted: async (_id, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const payload = data.reduce((acc: TSetConfigPayload, item) => {
            if (
              item.appId.indexOf('admin') !== -1 &&
              isAdminConfiguration(item.key)
            ) {
              return { ...acc, [item.key]: item.value };
            }
            return acc;
          }, {} as TSetConfigPayload);
          dispatch(setConfig(payload));
          dispatch(hydrate(data));
        } catch (error) {
          console.error(error);
        }
      },
      providesTags: ['Config'],
    }),
  }),
  overrideExisting: false,
});

export const { useGetConfigurationQuery, useLazyGetConfigurationQuery } =
  configApi;
