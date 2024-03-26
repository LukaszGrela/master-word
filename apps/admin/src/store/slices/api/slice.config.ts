import {
  IConfigEntry,
  TConfigEntryKey,
  TProcessConfigResultEntry,
} from '@repo/backend-types/db';
import { adminApi } from './slice';
import { apiConfig, apiConfigSet, apiConfigSetMultiple } from './endpoints';
import { isAdminConfiguration, setConfig } from '../config';
import type { TSetConfigPayload } from '../config';
import { hydrate, resetFlags, THydratedEntry } from '../config-form';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

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
    postConfigurationValue: builder.mutation<
      IConfigEntry[],
      THydratedEntry<TConfigEntryKey>
    >({
      query: ({ key, value, appId }) => ({
        url: apiConfigSet(key),
        method: 'POST',
        body: { value, appId, key },
      }),

      invalidatesTags: ['Config'],
    }),
    postConfiguration: builder.mutation<
      TProcessConfigResultEntry[],
      THydratedEntry<TConfigEntryKey>[]
    >({
      queryFn: async (list, api, _extraOptions, baseQuery) => {
        try {
          const { data, error } = (await baseQuery({
            url: apiConfigSetMultiple(),
            method: 'POST',
            body: list,
          })) as {
            data?: TProcessConfigResultEntry[];
            error?: FetchBaseQueryError;
            meta?: unknown;
          };
          console.log('response', data, error);
          if (error) {
            throw error;
          }
          if (!data || data.length === 0) {
            throw { status: 'CUSTOM_ERROR', error: 'Invalid empty response.' };
          }

          // check if there are any error entries
          const errors = data.filter((entry) => entry.error);
          //
          if (errors.length > 0) {
            throw {
              status: 'CUSTOM_ERROR',
              error: 'Some entries were not saved.',
              data,
            };
          }
          // reset all flags
          api.dispatch(resetFlags());
          // Return the result in an object with a `data` field
          return { data };
        } catch (error) {
          // Catch any errors and return them as an object with an `error` field
          return { error: error as FetchBaseQueryError };
        }
      },
      invalidatesTags: (_, error) => {
        return !error ? ['Config'] : [];
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetConfigurationQuery,
  useLazyGetConfigurationQuery,
  usePostConfigurationValueMutation,
  usePostConfigurationMutation,
} = configApi;
