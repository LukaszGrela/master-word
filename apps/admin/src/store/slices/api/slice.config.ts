import { IConfigEntry } from '@repo/backend-types/db';
import { adminApi } from './slice';
import { apiConfig } from './endpoints';
import { TSetConfigPayload, setConfig } from '../config';

export const configApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getConfiguration: builder.query<
      IConfigEntry[],
      string | string[] | undefined
    >({
      query: () => apiConfig(),
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          const payload = data.reduce((acc: TSetConfigPayload, item) => {
            if (
              item.appId.indexOf('admin') !== -1 &&
              (item.key === 'supportedLanguages' ||
                item.key === 'supportedLength')
            ) {
              const value = JSON.parse(item.value) as string;
              return { ...acc, [item.key]: value };
            }
            return acc;
          }, {} as TSetConfigPayload);
          dispatch(setConfig(payload));
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
