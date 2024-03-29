import { adminApi } from './slice';
import {
  apiDictionaryLanguages,
  apiDictionaryStats,
  apiAddWord,
} from './endpoints';
import {
  TDictionaryLanguagesResponse,
  TDictionaryStatsResponse,
  TPostAddWordParams,
} from './types';

export const dictionaryApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getDictionaryStats: builder.query<
      TDictionaryStatsResponse,
      {
        language?: string;
        length?: number;
      }
    >({
      query: ({ language = 'pl', length = 5 }) =>
        apiDictionaryStats(language, length),
      providesTags: ['Dictionary'],
    }),
    getDictionaryLanguages: builder.query<
      TDictionaryLanguagesResponse,
      {
        length?: number;
      }
    >({
      query: ({ length = 5 }) => apiDictionaryLanguages(length),
    }),
    postAddWord: builder.mutation<string, TPostAddWordParams>({
      query: (params) => ({ url: apiAddWord(), method: 'POST', body: params }),

      invalidatesTags: ['Dictionary'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDictionaryStatsQuery,
  useLazyGetDictionaryStatsQuery,
  useGetDictionaryLanguagesQuery,
  useLazyGetDictionaryLanguagesQuery,
  usePostAddWordMutation,
} = dictionaryApi;
