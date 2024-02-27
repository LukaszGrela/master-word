import { TSupportedLanguages } from '../api';
import { IDictionary } from '../types/common';
import { hasOwn } from '../utils/object/hasOwn';

/**
 * Placeholders e.g. `{code}` or `{code action1 action2}`
 */
const SUBSTITUTE = /\{([a-zA-Z ]+)\}/gm;

const SPACE = /\s+/gm;

export const replaceSubstituteMap = (
  input: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  substitutes: IDictionary<any>,
  actionCallback?: (input: string, actions: string[]) => string
): string => {
  return input.replace<[$1: string, $2: number, $3: string]>(
    SUBSTITUTE,
    (match: string, $1: string) => {
      const [substitute, ...actions] = $1.replace(SPACE, ' ').split(' ');

      if (hasOwn(substitutes, substitute)) {
        if (actionCallback && Array.isArray(actions) && actions.length > 0) {
          // if callback provided use it's value
          return actionCallback(`${substitutes[substitute]}`, actions);
        }
        //
        return `${substitutes[substitute]}`;
      }

      console.warn(
        `[i18n.replaceSubstituteMap] Param not found in the substitute map: '${substitute}', actions: '${actions.join(
          ','
        )}'.`
      );

      return match;
    }
  );
};

export const loadTranslation = async (
  language: TSupportedLanguages,
  signal?: AbortSignal
) => {
  console.log('loadTranslation', language);
  try {
    const response = await fetch(`/i18n/${language}.json`, {
      method: 'GET',
      signal,
    });

    if (response.ok) {
      const dict = (await response.json()) as IDictionary<string>;

      return dict;
    }
    throw new Error(`Failed to load translation for ${language} language.`);
  } catch (error) {
    // throw error
    throw new Error(`Failed to load translation for ${language} language.`);
  }
};
