import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultLanguageContext } from '../../i18n/LanguageContext/__tests__/contextRenderer';
import GeneralError from './GeneralError';
import { AppStorage, IStorage, hasOwn } from '@repo/utils';
import { IDictionary } from '@repo/common-types';
import { replaceSubstituteMap } from '../../i18n/helpers';
import { createMemoryRouter } from 'react-router-dom';
import { EPaths } from './enums';
import { renderMockRouter } from './__tests__/helpers';
import { Root } from './Root';
import { fireEvent, waitFor } from '@testing-library/react';

vi.mock('@repo/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const original = await importOriginal<any>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AppStorageMock = vi.fn<any, IStorage>();
  const proto = AppStorageMock.prototype as IStorage;

  proto.getItem = vi.fn();
  proto.setItem = vi.fn();
  proto.removeItem = vi.fn();
  proto.has = vi.fn();
  proto.clear = vi.fn();
  proto.clearStorage = vi.fn();

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

const Boom = () => {
  throw new Error('Boom');
};

describe('game', () => {
  describe('routes', () => {
    describe('GeneralError', () => {
      const translationPl: IDictionary<string> = {
        'translation-info-sr': 'Wybierz język interfejsu',
        'translation-button-en': 'Angielski',
        'translation-button-pl': 'Polski',
        'general-error-title': 'Ożesz kurczaczki!',
        'general-error-message':
          'Przepraszamy, nieoczekiwany błąd jak piorun z nieba spadł i zepsuł zabawę...',
        'general-error-btn-home': 'Zamknij',
      };
      let mockFetch = vi.fn();
      let storage: IStorage = AppStorage.getInstance();
      beforeEach(() => {
        mockFetch = vi.fn();
        storage = AppStorage.getInstance();

        (
          storage.getItem as Mock<[key: string], string | null>
        ).mockImplementation((key) => {
          if (key === 'ui-language') {
            return 'pl';
          }
          if (key === 'word-language') {
            return 'pl';
          }
          return null;
        });

        global.fetch = mockFetch;
      });
      afterEach(() => {
        vi.clearAllMocks();
        global.fetch = originalFetch;
      });
      it('renders general error', async () => {
        const router = createMemoryRouter([
          {
            path: EPaths.ROOT,
            element: <Root />,
            errorElement: <GeneralError />,
            children: [
              {
                index: true,
                element: <p>HOME</p>,
              },
              {
                path: '/boom',
                element: <Boom />,
              },
            ],
          },
        ]);

        await router.navigate('/boom');

        const { container } = renderMockRouter(router, {
          languageContext: {
            ...defaultLanguageContext,
            getUIText: (
              textId: string,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              substitutes?: IDictionary<any> | undefined,
            ): string => {
              if (hasOwn(translationPl, textId)) {
                const copy = translationPl[textId];
                if (substitutes) {
                  return replaceSubstituteMap(copy, substitutes);
                }
                return copy;
              }

              return textId;
            },
          },
        });

        expect(container).toMatchSnapshot();
      });
      it('close general error', async () => {
        const router = createMemoryRouter([
          {
            path: EPaths.ROOT,
            element: <Root />,
            errorElement: <GeneralError />,
            children: [
              {
                index: true,
                element: <p>HOME</p>,
              },
              {
                path: '/boom',
                element: <Boom />,
              },
            ],
          },
        ]);

        await router.navigate('/boom');

        const { getByText } = renderMockRouter(router, {
          languageContext: {
            ...defaultLanguageContext,
            getUIText: (
              textId: string,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              substitutes?: IDictionary<any> | undefined,
            ): string => {
              if (hasOwn(translationPl, textId)) {
                const copy = translationPl[textId];
                if (substitutes) {
                  return replaceSubstituteMap(copy, substitutes);
                }
                return copy;
              }

              return textId;
            },
          },
        });

        fireEvent.click(getByText(translationPl['general-error-btn-home']));

        await waitFor(() => {
          expect(router.state.location.pathname).toEqual(EPaths.ROOT);
        });
      });
    });
  });
});
