import { configFormSlice } from './slice';

export * from './types';

export const { hydrate, addConfig, removeConfig, resetConfig, setConfigValue } =
  configFormSlice.actions;

export default configFormSlice.reducer;
