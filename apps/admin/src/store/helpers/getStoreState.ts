import { store } from '../index';

export const getStoreState = (): ReturnType<typeof store.getState> => {
  return store.getState();
};
