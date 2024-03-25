import { configFormSlice } from './slice';

export * from './types';

export const {
  hydrate,
  addConfigValue,
  removeConfigValue,
  resetConfigValue,
  setConfigValue,
  setDefaultValue,
  resetConfig,
} = configFormSlice.actions;

export default configFormSlice.reducer;
