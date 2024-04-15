import React from 'react';
import {
  Queries,
  RenderOptions,
  RenderResult,
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

const MockContext = (props: {
  context?: Partial<ILanguageContext>;
  children: React.ReactNode;
}) => {
  const value = { ...defaultLanguageContext, ...(props.context || {}) };
  return (
    <LanguageContext.Provider value={value}>
      {props.children}
    </LanguageContext.Provider>
  );
};

const contextRenderer = <
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  children: React.ReactNode,
  props: {
    languageContext?: Partial<ILanguageContext>;
    renderOptions?: RenderOptions<Q, Container, BaseElement>;
  } = { renderOptions: {} },
): RenderResult<Q, Container, BaseElement> => {
  const { languageContext, renderOptions = {} } = props;

  return render<Q, Container, BaseElement>(
    <MockContext
      context={{ ...defaultLanguageContext, ...(languageContext || {}) }}
    >
      {children}
    </MockContext>,
    renderOptions,
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { contextRenderer, defaultLanguageContext, MockContext };
