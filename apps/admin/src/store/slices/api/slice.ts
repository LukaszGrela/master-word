import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BACKEND_API } from '../../../api/endpoints';
import { TUnknownWordEntry } from '../../../api/types';
import { TTableData } from '@repo/backend-types/dictionary';

export const adminApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_API,
  }),
  tagTypes: ['UnknownWords'],
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
});

export default adminApi.reducer;
