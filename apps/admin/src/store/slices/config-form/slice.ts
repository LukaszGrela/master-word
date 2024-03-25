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

    resetConfig: (state) => {
      const toDelete: TConfigEntryKey[] = [];

      Object.entries(state.forms).forEach(([key, config]) => {
        if (config) {
          if (config.isModified) {
            config.value = config.original.value;
            config.isModified = false;
          }
          if (config.isDeleted) {
            config.isDeleted = false;
          }
          if (config.isNew) {
            // remove
            toDelete.push(key);
          }
        }
      });
      toDelete.forEach((key) => {
        delete state.forms[key];
      });
    },

    addConfigValue: (state, action: PayloadAction<string>) => {
      // TODO: add new hydrated IConfigEntry to be stored in DB
      console.log(action);
      return state;
    },
    removeConfigValue: (state, action: PayloadAction<string>) => {
      // TODO: remove config entry
      console.log(action);
      return state;
    },
    resetConfigValue: (state, action: PayloadAction<TConfigEntryKey>) => {
      const key = action.payload;

      const config = state.forms[key];
      if (config && !config.isNew) {
        config.value = config.original.value;
        config.isModified = false;
      }

      return state;
    },
    setDefaultValue: (state, action: PayloadAction<TConfigEntryKey>) => {
      const key = action.payload;
      const config = state.forms[key];
      if (config && config.defaultsTo) {
        config.value = config.defaultsTo;
        config.isModified = true;
      }

      return state;
    },

    setConfigValue: (
      state,
      action: PayloadAction<TSetHydrateConfigValueParamType<TConfigEntryKey>>,
    ) => {
      const { key, value } = action.payload;
      const config = state.forms[key];
      if (config) {
        config.value = value;
        config.isModified = true;
        // if linked config has selection outside of sourceValues then filter it out
        validateLinkedConfig(config, state);
      }

      return state;
    },
  },
});
