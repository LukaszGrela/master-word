import React from 'react';
import {
  Queries,
  RenderOptions,
  queries,
  render,
} from '@testing-library/react';
import { vi } from 'vitest';
import { ILanguageContext, LanguageContext } from '../index';

const defaultLanguageContext: ILanguageContext = {
  loading: false,
  loadTranslation: vi.fn(),
  getUIText: vi.fn(),
  loadedLanguage: 'pl',
};

const contextRenderer = <
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  children: React.ReactNode,
  props: {
    languageContext?: ILanguageContext;
    renderOptions: RenderOptions<Q, Container, BaseElement>;
  } = { renderOptions: {} },
) => {
  const { languageContext, renderOptions = {} } = props;
  const value = languageContext || defaultLanguageContext;
  return render<Q, Container, BaseElement>(
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>,
    renderOptions,
  );
};

export { contextRenderer, defaultLanguageContext };
