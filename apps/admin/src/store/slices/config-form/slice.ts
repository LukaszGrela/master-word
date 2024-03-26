import { Draft, PayloadAction, createSlice } from '@reduxjs/toolkit';
import {
  IConfigFormState,
  TForms,
  THydratedEntry,
  TSetHydrateConfigValueParamType,
} from './types';
import { IConfigEntry, TConfigEntryKey } from '@repo/backend-types/db';
import { hydrateConfig, validateLinkedConfig } from './helpers';

const initialState: IConfigFormState = {
  forms: {},
};

const SLICE_NAME = 'config-form' as const;

const applyNewConfig = <Key extends TConfigEntryKey>(
  key: Key,
  forms: Draft<TForms>,
  newValue: THydratedEntry<Key>,
): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (forms[key] as any) = newValue;
};

export const configFormSlice = createSlice({
  initialState,
  name: SLICE_NAME,
  reducers: {
    hydrate: (state, action: PayloadAction<IConfigEntry[]>) => {
      if (action.payload) {
        // at this point we can have some of the config already in store, possibly not saved
        // we can't override the state
        const hydrated = hydrateConfig(action.payload);
        if (
          state.forms &&
          (Object.keys(state.forms).length === 0 ||
            Object.entries(state.forms).filter(
              (tuple) =>
                tuple[1]?.isModified || tuple[1]?.isNew || tuple[1]?.isDeleted,
            ).length === 0)
        ) {
          // default
          state.forms = hydrated;
        } else {
          // patch
          console.group('Patch');
          Object.entries(state.forms).forEach(([key, entry]) => {
            const newConfig = hydrated[key];
            console.log('Patching...', key, 'incoming', newConfig);
            if (entry) {
              console.log('test entry', entry);
              if (newConfig) {
                if (entry.isModified) {
                  // patch the original value
                  entry.original.appId = newConfig.appId;
                  entry.original.value = newConfig.value;
                } else if (entry.isNew || entry.isDeleted) {
                  // leave as is
                } else {
                  // use incoming
                  applyNewConfig(key, state.forms, newConfig);
                }
              } else {
                // newConfig was missing, delete this entry
                delete state.forms[key];
              }
            }
          });
          // now what's left, add to the store
          const currentKeys = Object.keys(state.forms);
          Object.entries(hydrated)
            .filter(([key]) => currentKeys.indexOf(key) === -1)
            .forEach(([key, newConfig]) => {
              if (newConfig) {
                applyNewConfig(key, state.forms, newConfig);
              }
            });
          console.groupEnd();
        }
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
    resetFlag: (state, action: PayloadAction<TConfigEntryKey>) => {
      const key = action.payload;
      const config = state.forms[key];
      if (config) {
        config.isDeleted = false;
        config.isNew = false;
        config.isModified = false;
      }

      return state;
    },
    resetFlags: (state) => {
      Object.entries(state.forms).forEach(([, config]) => {
        if (config) {
          config.isModified = false;
          config.isDeleted = false;
          config.isNew = false;
        }
      });
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
