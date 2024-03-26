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
  resetFlag,
  resetFlags,
} = configFormSlice.actions;

export default configFormSlice.reducer;
