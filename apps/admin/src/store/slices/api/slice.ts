import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BACKEND_API } from './constants';

export const adminApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_API,
  }),
  tagTypes: ['UnknownWords', 'Dictionary', 'Config'],
  endpoints: () => ({}),
});

export default adminApi.reducer;
