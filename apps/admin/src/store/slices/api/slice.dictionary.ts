import { adminApi } from './slice';
import {
  apiDictionaryLanguages,
  apiDictionaryStats,
  apiAddWord,
  apiAddManyWords,
} from './endpoints';
import {
  TDictionaryLanguagesResponse,
  TDictionaryStatsResponse,
  TPostAddManyWordsParams,
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
    postAddManyWords: builder.mutation<string, TPostAddManyWordsParams>({
      query: (params) => ({
        url: apiAddManyWords(),
        method: 'POST',
        body: params,
      }),
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
  usePostAddManyWordsMutation,
} = dictionaryApi;
