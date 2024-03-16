import { adminApi } from './slice';
export { default as apiReducer } from './slice';
// actions
export const {
  useGetUnknownWordsQuery,
  useLazyGetUnknownWordsQuery,
  usePostApproveWordsMutation,
  usePostRejectWordsMutation,
} = adminApi;

export const { reducerPath, middleware } = adminApi;
