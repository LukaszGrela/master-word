import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { IDictionary } from '@repo/common-types';
import { hasOwn } from '@repo/utils';
import { AppStorage } from '@repo/utils';
import { EStorageKeys } from '@repo/utils';
import { loadTranslation, replaceSubstituteMap } from '../helpers';
import { ILanguageContext, LanguageContext } from './LanguageContext';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  const [loadedLanguage, setLoadedLanguage] = useState<string>();
  const [translation, setTranslation] = useState<IDictionary<string>>({});

  const loadTranslationCtx = useCallback(
    async (language: string, signal?: AbortSignal) => {
      try {
        setLoading(true);
        const translations = await loadTranslation(language, signal);
        setLoadedLanguage(language);
        setTranslation(translations);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getUIText = useCallback(
    (
      textId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      substitutes?: IDictionary<any>,
    ): string => {
      if (hasOwn(translation, textId)) {
        const copy = translation[textId];
        if (substitutes) {
          return replaceSubstituteMap(copy, substitutes);
        }
        return copy;
      }

      return textId;
    },
    [translation],
  );

  const value = useMemo(
    () =>
      ({
        loading,
        loadedLanguage,
        getUIText,
        loadTranslation: loadTranslationCtx,
      }) as ILanguageContext,
    [getUIText, loadTranslationCtx, loadedLanguage, loading],
  );

  // initial load
  useEffect(() => {
    setLoading(true);
    const language =
      AppStorage.getInstance().getItem(EStorageKeys.UI_LANGUAGE) || 'pl';
    loadTranslation(language)
      .then((translations) => {
        setLoadedLanguage(language);
        setTranslation(translations);
      })
      .catch(console.error)
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
