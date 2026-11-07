import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BACKEND_API } from './constants';
import { getAdminToken } from '../../../components/AskForAdminToken/utils';

export const adminApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: BACKEND_API,
    prepareHeaders: (headers) => {
      const token = getAdminToken();
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['UnknownWords', 'Dictionary', 'Config'],
  endpoints: () => ({}),
});

export default adminApi.reducer;
