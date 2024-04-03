import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultLanguageContext } from '../../../i18n/LanguageContext/__tests__/contextRenderer';
import { GameErrorPage } from './GameErrorPage';
import { AppStorage, IStorage, hasOwn } from '@repo/utils';
import { IDictionary } from '@repo/common-types';
import { replaceSubstituteMap } from '../../../i18n/helpers';
import { createMemoryRouter } from 'react-router-dom';
import { EPaths } from '../enums';
import { renderMockRouter } from './__tests__/helpers';
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

describe('game', () => {
  describe('routes', () => {
    describe('components', () => {
      describe('GameErrorPage', () => {
        const translationPl: IDictionary<string> = {
          'general-error-title': 'Ożesz kurczaczki!',
          'general-error-message':
            'Przepraszamy, nieoczekiwany błąd jak piorun z nieba spadł i zepsuł zabawę...',
          'general-error-btn-home': 'Zamknij',
          'game-error-subtitle': 'Problem z sesją gry.',
          'result-again-button': 'Odgadnij następne słowo',
          'translation-info-sr': 'Wybierz język interfejsu',
          'translation-button-en': 'Angielski',
          'translation-button-pl': 'Polski',
          'result-language-selector-btn-title-pl': 'Słowo polskie',
          'result-language-selector-btn-title-en': 'Słowo angielskie',
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
        it('renders', async () => {
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.GAME_ERROR,
              element: <GameErrorPage />,
            },
          ]);
          await router.navigate(EPaths.GAME_ERROR, {
            state: {
              session: { session: 'session' },
              error: { code: 404, error: 'Not found' },
            },
          });

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
        it('renders - play again', async () => {
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.GAME_ERROR,
              element: <GameErrorPage />,
            },
          ]);
          await router.navigate(EPaths.GAME_ERROR, {
            state: {
              session: { session: 'session' },
              error: { code: 404, error: 'Not found' },
            },
          });

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

          fireEvent.click(getByText(translationPl['result-again-button']));

          await waitFor(() => {
            expect(router.state.location.pathname).toEqual('/game');
            expect(router.state.location.state).toBe('session');
          });
        });
        it('renders without game session', async () => {
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.GAME_ERROR,
              element: <GameErrorPage />,
            },
          ]);
          await router.navigate(EPaths.GAME_ERROR, {
            state: {
              error: { code: 404, error: 'Not found' },
            },
          });

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
        it('renders without game session - close', async () => {
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.GAME_ERROR,
              element: <GameErrorPage />,
            },
          ]);
          await router.navigate(EPaths.GAME_ERROR, {
            state: {
              error: { code: 404, error: 'Not found' },
            },
          });

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
            expect(router.state.location.pathname).toEqual('/');
            expect(router.state.location.state).toBeNull();
          });
        });
      });
    });
  });
});
