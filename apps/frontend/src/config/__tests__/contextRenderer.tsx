import React from 'react';
import {
  Queries,
  RenderOptions,
  RenderResult,
  queries,
  render,
} from '@testing-library/react';
import { vi } from 'vitest';
import { IConfigContext } from '../index';
import { ConfigContext } from '../context';

const defaultConfigContext: IConfigContext = {
  config: {
    enabledAttempts: [8],
    enabledLanguages: ['pl', 'en'],
    enabledLength: [5],
  },
  loading: false,
  refresh: vi.fn(),
  error: undefined,
};

const MockContext = (props: {
  context?: IConfigContext;
  children: React.ReactNode;
}) => {
  const value = props.context || defaultConfigContext;

  return (
    <ConfigContext.Provider value={value}>
      {props.children}
    </ConfigContext.Provider>
  );
};

const contextRenderer = <
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  children: React.ReactNode,
  props: {
    context?: IConfigContext;
    renderOptions: RenderOptions<Q, Container, BaseElement>;
  } = { renderOptions: {} },
): RenderResult<Q, Container, BaseElement> => {
  const { context, renderOptions = {} } = props;

  return render<Q, Container, BaseElement>(
    <MockContext context={context}>{children}</MockContext>,
    renderOptions,
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export { contextRenderer, defaultConfigContext, MockContext };
