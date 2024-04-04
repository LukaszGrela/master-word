import {
  Queries,
  queries,
  RenderOptions,
  RenderResult,
} from '@testing-library/react';
import { RouterProvider, RouterProviderProps } from 'react-router-dom';
import { contextRenderer } from '../../../i18n/LanguageContext/__tests__/contextRenderer';
import {
  MockContext as MockConfigContext,
  defaultConfigContext,
} from '../../../config/__tests__/contextRenderer';
import { ILanguageContext } from '../../../i18n';
import { IConfigContext } from '../../../config';

type TRenderMockRouterProps<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
> = {
  renderOptions?: RenderOptions<Q, Container, BaseElement>;
  languageContext?: Partial<ILanguageContext>;
  configContext?: Partial<IConfigContext>;
};

export const renderMockRouter = <
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  router: RouterProviderProps['router'],
  props?: TRenderMockRouterProps<Q, Container, BaseElement>,
): RenderResult<Q, Container, BaseElement> => {
  return contextRenderer<Q, Container, BaseElement>(
    <MockConfigContext
      context={{
        ...defaultConfigContext,
        ...(props?.configContext || {}),
      }}
    >
      <RouterProvider router={router} />
    </MockConfigContext>,
    {
      languageContext: props?.languageContext,
      renderOptions: props?.renderOptions,
    },
  );
};
