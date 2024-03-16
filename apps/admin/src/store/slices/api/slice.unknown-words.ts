import { TTableData } from '@repo/backend-types/dictionary';
import { TUnknownWordEntry } from './types';
import { adminApi } from './slice';
import { apiApproveWords, apiRejectWords, apiUnknownWords } from './endpoints';

export const unknownWordsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnknownWords: builder.query<TUnknownWordEntry[], void>({
      query: () => apiUnknownWords(),
      providesTags: ['UnknownWords'],
    }),
    postApproveWords: builder.mutation<string, { words: TTableData[] }>({
      query: (params) => ({
        url: apiApproveWords(),
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['UnknownWords'],
    }),
    postRejectWords: builder.mutation<string, { words: TTableData[] }>({
      query: (params) => ({
        url: apiRejectWords(),
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['UnknownWords'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetUnknownWordsQuery,
  useLazyGetUnknownWordsQuery,
  usePostApproveWordsMutation,
  usePostRejectWordsMutation,
} = unknownWordsApi;
