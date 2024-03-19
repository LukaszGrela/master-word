import type { TConfigEntryKey } from '@repo/backend-types/db';
import type { TConfigKeys } from './types';

export const isAdminConfiguration = (
  key: TConfigEntryKey,
): key is TConfigKeys =>
  key === 'supportedLanguages' || key === 'supportedLength';
