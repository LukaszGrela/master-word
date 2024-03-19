import { store } from './index';

export type TStore = typeof store;
export type TRootState = ReturnType<typeof store.getState>;
export type TAppDispatch = typeof store.dispatch;
