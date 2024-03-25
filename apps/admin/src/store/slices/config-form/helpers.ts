import { IConfigEntry, TConfigEntryKey } from '@repo/backend-types/db';
import {
  TForms,
  THydratedEntry,
  TConfigEntryKeyValueTypeMap,
  IConfigFormState,
} from './types';
import { Draft } from '@reduxjs/toolkit';

const typedDrop = <Key extends TConfigEntryKey>(
  key: Key,
  entry: IConfigEntry,
): THydratedEntry<Key> => {
  const drop: THydratedEntry<Key> = {
    appId: entry.appId,
    isDeleted: false,
    isModified: false,
    isNew: false,

    sourceValuesKey: entry.sourceValuesKey,
    key: key,
    value: entry.value as TConfigEntryKeyValueTypeMap[typeof key],

    original: {
      appId: entry.appId,
      value: entry.value as TConfigEntryKeyValueTypeMap[typeof key],
    },

    defaultsTo: entry.defaultsTo as TConfigEntryKeyValueTypeMap[typeof key],
  } as THydratedEntry<Key>;

  return drop;
};

export const hydrateConfig = (dry: IConfigEntry[]): TForms => {
  return dry.reduce((wet: TForms, entry): TForms => {
    const key = entry.key;

    if (key === 'supportedAttempts') {
      wet[key] = typedDrop(key, entry);
    }

    if (key === 'supportedLanguages') {
      wet[key] = typedDrop(key, entry);
    }

    if (key === 'supportedLength') {
      wet[key] = typedDrop(key, entry);
    }

    if (key === 'enabledAttempts') {
      wet[key] = typedDrop(key, entry);
    }

    if (key === 'enabledLanguages') {
      wet[key] = typedDrop(key, entry);
    }

    if (key === 'enabledLength') {
      wet[key] = typedDrop(key, entry);
    }

    return wet;
  }, {} as TForms);
};

const guardStringArray = (test: unknown): test is string[] => {
  return Array.isArray(test) && test.every((item) => typeof item === 'string');
};

export const validateLinkedConfig = <Key extends TConfigEntryKey>(
  config: Draft<THydratedEntry<Key>>,
  state: Draft<IConfigFormState>,
) => {
  if (!config.sourceValuesKey) {
    // source config, search for dependents
    const dependents = Object.entries(state.forms).reduce(
      (ids: TConfigEntryKey[], [, value]): TConfigEntryKey[] => {
        if (value.key !== config.key && value.sourceValuesKey === config.key) {
          ids.push(value.key);
        }
        return ids;
      },
      [] as TConfigEntryKey[],
    );

    if (dependents.length > 0) {
      dependents.forEach((targetConfigKey) => {
        const targetConfig = state.forms[targetConfigKey];
        if (targetConfig) {
          // value is an array of selected items, those items must fit the source values
          const originalLength = targetConfig.value.length;
          targetConfig.value = targetConfig.value.filter((v): boolean => {
            const configValue = config.value;
            if (guardStringArray(configValue) && typeof v === 'string') {
              return configValue.includes(v);
            } else if (
              !guardStringArray(configValue) &&
              typeof v !== 'string'
            ) {
              return configValue.includes(v);
            }
            return false;
          }) as string[] | number[];

          if (originalLength !== targetConfig.value.length) {
            targetConfig.isModified = true;
          }
        }
      });
    }
  }
};
