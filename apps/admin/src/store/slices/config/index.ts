import { configSlice } from './slice';

export * from './types';

export const { setConfig, setLanguage } = configSlice.actions;

export default configSlice.reducer;
