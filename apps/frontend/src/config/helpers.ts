import { AppStorage, EStorageKeys } from '@repo/utils';
import { IConfig } from './types';
import { ATTEMPTS, LANGUAGE, WORD_LENGTH } from '../game';

/**
 * Assure local storage is using enabled values from current config object
 * @param config Current Configuration
 */
export function updateLocalStorageConfig(config: IConfig) {
  console.log('config', config);
  const storage = AppStorage.getInstance();
  // game language
  const configLang =
    config.enabledLanguages.length > 0 ? config.enabledLanguages : [LANGUAGE];
  if (!storage.has(EStorageKeys.GAME_LANGUAGE)) {
    storage.setItem(EStorageKeys.GAME_LANGUAGE, configLang[0]);
  } else {
    // value exists, confirm it is allowed
    if (
      configLang.indexOf(storage.getItem(EStorageKeys.GAME_LANGUAGE)!) === -1
    ) {
      storage.setItem(EStorageKeys.GAME_LANGUAGE, configLang[0]);
    }
  }

  // game word length
  const configLength =
    config.enabledLength.length > 0 ? config.enabledLength : [WORD_LENGTH];
  if (!storage.has(EStorageKeys.GAME_WORD_LENGTH)) {
    storage.setItem(EStorageKeys.GAME_WORD_LENGTH, `${configLength[0]}`);
  } else {
    // value exists, confirm it is allowed
    if (
      configLength.indexOf(
        Number(storage.getItem(EStorageKeys.GAME_WORD_LENGTH)!),
      ) === -1
    ) {
      storage.setItem(EStorageKeys.GAME_WORD_LENGTH, `${configLength[0]}`);
    }
  }

  // game attempts
  const configAttempts =
    config.enabledAttempts.length > 0 ? config.enabledAttempts : [ATTEMPTS];
  if (!storage.has(EStorageKeys.GAME_ATTEMPTS)) {
    storage.setItem(EStorageKeys.GAME_ATTEMPTS, `${configAttempts[0]}`);
  } else {
    // value exists, confirm it is allowed
    if (
      configAttempts.indexOf(
        Number(storage.getItem(EStorageKeys.GAME_ATTEMPTS)!),
      ) === -1
    ) {
      storage.setItem(EStorageKeys.GAME_ATTEMPTS, `${configAttempts[0]}`);
    }
  }

  // UI
  if (!storage.has(EStorageKeys.UI_LANGUAGE)) {
    storage.setItem(EStorageKeys.UI_LANGUAGE, LANGUAGE);
  }
}
