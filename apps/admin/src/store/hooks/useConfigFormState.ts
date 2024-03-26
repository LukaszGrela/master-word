import { useMemo } from 'react';
import { TConfigEntryKey } from '@repo/backend-types/db';
import { useAppSelector } from './base';
import type { IConfigFormState, THydratedEntry } from '../slices/config-form';

export const useConfigFormState = (): IConfigFormState =>
  useAppSelector((state) => state.configForm);

export const useFormsModifiedState = () => {
  const forms = useAppSelector((state) => state.configForm.forms);

  const numConfigChanged = useMemo(() => {
    return Object.entries(forms).reduce((changedCount, [, entry]) => {
      if (entry) {
        const { isModified, isNew, isDeleted } = entry;
        if (isModified || isNew || isDeleted) {
          return changedCount + 1;
        }
      }
      return changedCount;
    }, 0);
  }, [forms]);

  return numConfigChanged;
};
/**
 * Get the config entry. This hook populates the `sourceValues` if entry validation specifies an id
 * @param key `TConfigEntryKey` The config key to retrieve (if exists)
 * @returns `THydratedEntry` or `undefined`
 */
export const useConfigFormEntry = <Key extends TConfigEntryKey>(key: Key) => {
  const forms = useAppSelector((state) => state.configForm.forms);

  return useMemo(() => {
    const entry: THydratedEntry<Key> | undefined = forms[key];

    if (entry && entry.sourceValuesKey) {
      const sourceKey = entry.sourceValuesKey;
      const match: THydratedEntry<typeof sourceKey> | undefined =
        forms[sourceKey];

      if (match) {
        return {
          ...entry,
          sourceValues: match.value,
        };
      }
    }
    return entry;
  }, [forms, key]);
};
