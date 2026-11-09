import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { BACKEND_API } from './constants';
import {
  clearAdminToken,
  getAdminToken,
} from '../../../components/AskForAdminToken/utils';
import { setAuthorized } from '../user';

export const baseQuery = fetchBaseQuery({
  baseUrl: BACKEND_API,
  prepareHeaders: (headers) => {
    const token = getAdminToken();
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWith401Redirect: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    clearAdminToken();

    api.dispatch(setAuthorized(false));
  }
  return result;
};

export const adminApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWith401Redirect,
  tagTypes: ['UnknownWords', 'Dictionary', 'Config'],
  endpoints: () => ({}),
});

export default adminApi.reducer;
