import React from 'react';
import { IDictionary } from '@repo/common-types';

export interface ILanguageContext {
  loadedLanguage: string | undefined;

  loading: boolean;

  loadTranslation: (language: string, signal?: AbortSignal) => Promise<void>;

  getUIText: (
    textId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    substitutes?: IDictionary<any>,
  ) => string;
}

export const LanguageContext = React.createContext<ILanguageContext>(null!);
