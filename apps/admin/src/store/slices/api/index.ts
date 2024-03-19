export * from './types';
import { adminApi } from './slice';
export { default as apiReducer } from './slice';

export const { reducerPath, middleware } = adminApi;

// actions for unknown words
export {
  useGetUnknownWordsQuery,
  useLazyGetUnknownWordsQuery,
  usePostApproveWordsMutation,
  usePostRejectWordsMutation,
} from './slice.unknown-words';
// actions from dictionary
export {
  useGetDictionaryStatsQuery,
  useLazyGetDictionaryStatsQuery,
  useGetDictionaryLanguagesQuery,
  useLazyGetDictionaryLanguagesQuery,
  usePostAddWordMutation,
} from './slice.dictionary';
// actions from config
export {
  useGetConfigurationQuery,
  useLazyGetConfigurationQuery,
} from './slice.config';
