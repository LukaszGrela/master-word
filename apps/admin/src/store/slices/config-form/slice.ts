import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IConfigFormState, TSetHydrateConfigValueParamType } from './types';
import { IConfigEntry, TConfigEntryKey } from '@repo/backend-types/db';
import { hydrateConfig, validateLinkedConfig } from './helpers';

const initialState: IConfigFormState = {
  forms: {},
};

const SLICE_NAME = 'config-form' as const;

export const configFormSlice = createSlice({
  initialState,
  name: SLICE_NAME,
  reducers: {
    hydrate: (state, action: PayloadAction<IConfigEntry[]>) => {
      if (action.payload) {
        state.forms = hydrateConfig(action.payload);
      }
      return state;
    },
    addConfig: (state, action: PayloadAction<string>) => {
      // TODO: add new hydrated IConfigEntry to be stored in DB
      console.log(action);
      return state;
    },
    removeConfig: (state, action: PayloadAction<string>) => {
      // TODO: remove config entry
      console.log(action);
      return state;
    },
    resetConfig: (state, action: PayloadAction<string>) => {
      // TODO: reset config entry to original state
      console.log(action);
      return state;
    },

    setConfigValue: (
      state,
      action: PayloadAction<TSetHydrateConfigValueParamType<TConfigEntryKey>>,
    ) => {
      console.log(action);
      const { key, value } = action.payload;
      const config = state.forms[key];
      if (config) {
        config.value = value;
        config.isModified = true;
        // TODO: validate linked config
        // if linked config has selection outside of sourceValues then filter it out
        validateLinkedConfig(config, state);
      }

      return state;
    },
  },
});
