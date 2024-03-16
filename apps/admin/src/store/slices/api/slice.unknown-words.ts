import { TUnknownWordEntry } from '../../../api/types';
import { TTableData } from '@repo/backend-types/dictionary';
import { adminApi } from './slice';

export const unknownWordsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getUnknownWords: builder.query<TUnknownWordEntry[], void>({
      query: () => 'list',
      providesTags: ['UnknownWords'],
    }),
    postApproveWords: builder.mutation<string, { words: TTableData[] }>({
      query: (params) => ({
        url: 'approve-words',
        method: 'POST',
        body: params,
      }),
      invalidatesTags: ['UnknownWords'],
    }),
    postRejectWords: builder.mutation<string, { words: TTableData[] }>({
      query: (params) => ({
        url: 'reject-words',
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
