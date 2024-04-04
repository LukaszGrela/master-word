/* eslint-disable @typescript-eslint/unbound-method */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppStorage, EStorageKeys, IStorage } from '@repo/utils';
import { IDictionary } from '@repo/common-types';
import { updateLocalStorageConfig } from './helpers';
import { IConfig } from '.';
import { ATTEMPTS, LANGUAGE, WORD_LENGTH } from '../game';

vi.mock('@repo/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const original = await importOriginal<any>();

  let storage: IDictionary<string> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AppStorageMock = vi.fn<any, IStorage>();
  const proto = AppStorageMock.prototype as IStorage;

  proto.getItem = vi.fn().mockImplementation((key: string): string | null => {
    return storage[key] || null;
  });
  proto.setItem = vi
    .fn()
    .mockImplementation((key: string, value: string): void => {
      storage[key] = value;
    });
  proto.removeItem = vi.fn().mockImplementation((key: string) => {
    delete storage[key];
  });
  proto.has = vi.fn().mockImplementation((key: string) => {
    return !!storage[key];
  });
  proto.clear = vi.fn().mockImplementation(() => {
    storage = {};
  });
  proto.clearStorage = vi.fn().mockImplementation(() => {
    storage = {};
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const instance = new AppStorageMock();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (AppStorageMock as any).getInstance = vi.fn().mockReturnValue(instance);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...original,

    AppStorage: AppStorageMock,
  };
});

const originalFetch = global.fetch;

describe('config', () => {
  describe('helpers', () => {
    let mockFetch = vi.fn();
    let storage: IStorage = AppStorage.getInstance();
    beforeEach(() => {
      mockFetch = vi.fn();
      storage = AppStorage.getInstance();
      storage.clear();
      storage.setItem(EStorageKeys.UI_LANGUAGE, 'pl');
      storage.setItem(EStorageKeys.GAME_LANGUAGE, 'pl');
      storage.setItem(EStorageKeys.GAME_WORD_LENGTH, '5');
      storage.setItem(EStorageKeys.GAME_ATTEMPTS, '8');

      global.fetch = mockFetch;
    });
    afterEach(() => {
      vi.clearAllMocks();
      global.fetch = originalFetch;
    });
    describe('updateLocalStorageConfig', () => {
      it('defaults (no config)', () => {
        storage.clear();
        vi.clearAllMocks(); //reset defaults
        updateLocalStorageConfig({
          enabledAttempts: [],
          enabledLanguages: [],
          enabledLength: [],
        } as IConfig);

        expect(storage.setItem).toBeCalledTimes(4);

        // game language
        expect(storage.setItem).toHaveBeenCalledWith(
          EStorageKeys.GAME_LANGUAGE,
          LANGUAGE,
        );
        // game word length
        expect(storage.setItem).toHaveBeenCalledWith(
          EStorageKeys.GAME_WORD_LENGTH,
          `${WORD_LENGTH}`,
        );
        // game attempts
        expect(storage.setItem).toHaveBeenCalledWith(
          EStorageKeys.GAME_ATTEMPTS,
          `${ATTEMPTS}`,
        );
        // ui language
        expect(storage.setItem).toHaveBeenCalledWith(
          EStorageKeys.UI_LANGUAGE,
          LANGUAGE,
        );
      });
      it('Set allowed values from config', () => {
        storage.clear();
        storage.setItem(EStorageKeys.UI_LANGUAGE, 'pl');
        storage.setItem(EStorageKeys.GAME_LANGUAGE, 'pl');
        storage.setItem(EStorageKeys.GAME_WORD_LENGTH, '5');
        storage.setItem(EStorageKeys.GAME_ATTEMPTS, '8');

        vi.clearAllMocks(); //reset defaults

        // config does not contain values stored in local storage
        updateLocalStorageConfig({
          enabledAttempts: [6],
          enabledLanguages: ['fr'],
          enabledLength: [7],
        } as IConfig);

        expect(storage.setItem).toBeCalledTimes(3);

        // game language
        expect(storage.setItem).toHaveBeenCalledWith(
          EStorageKeys.GAME_LANGUAGE,
          'fr',
        );
        // game word length
        expect(storage.setItem).toHaveBeenCalledWith(
          EStorageKeys.GAME_WORD_LENGTH,
          `7`,
        );
        // game attempts
        expect(storage.setItem).toHaveBeenCalledWith(
          EStorageKeys.GAME_ATTEMPTS,
          `6`,
        );
      });
    });
  });
});
