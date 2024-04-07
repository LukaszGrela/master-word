import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultLanguageContext } from '../../../i18n/LanguageContext/__tests__/contextRenderer';
import { HomePage } from './HomePage';
import { AppStorage, IStorage, hasOwn } from '@repo/utils';
import { IDictionary } from '@repo/common-types';
import { replaceSubstituteMap } from '../../../i18n/helpers';
import { createMemoryRouter } from 'react-router-dom';
import { EPaths } from '../enums';
import { renderMockRouter } from '../__tests__/helpers';
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
      describe('HomePage', () => {
        const translationPl: IDictionary<string> = {
          'main-title': 'Mistrz Słowa',
          'main-subtitle': 'Odgadnij słowo które mam na myśli...',
          'main-desktop-info':
            'Zacznij wpisywać słowo, naciśnij Enter żeby potwierdzić.',
          'main-mobile-info':
            'Naciśnij linię z ikonką edycji by wprowadzić słowo.',
          'home-game-description':
            'Masz 8 prób aby odgadnąć 5-literowe słowo, zrób to w jak najmniejszej ilości prób i w jak najkrótszym czasie. Czas odliczany jest od wysłania pierwszej propozycji słowa. Przed rozpoczęciem gry możesz zmienić język odgadywanego słowa.',

          'start-button': 'Start',
          'continue-button': 'Kontynuuj grę',
          'word-language-selector-btn-label-pl': 'Słowo',
          'word-language-selector-btn-label-en': 'Słowo',
          'result-language-selector-btn-title-pl': 'Słowo polskie',
          'result-language-selector-btn-title-en': 'Słowo angielskie',
          'result-language-info': 'Wybierz język słowa do odgadnięcia',
          'translation-info-sr': 'Wybierz język interfejsu',
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
        it('renders', () => {
          const refresh = vi.fn();

          const { container } = renderMockRouter(
            createMemoryRouter([
              {
                path: EPaths.ROOT,
                index: true,
                element: <HomePage />,
              },
            ]),
            {
              configContext: { refresh },

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
            },
          );

          expect(container).toMatchSnapshot();
          expect(refresh).toBeCalled();
        });
        it('starts new game', async () => {
          const refresh = vi.fn();
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <HomePage />,
            },
            {
              path: EPaths.GAME,
              element: <p>GAME</p>,
            },
          ]);
          const { getByText } = renderMockRouter(router, {
            configContext: { refresh },

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

          fireEvent.click(getByText(translationPl['start-button']));

          await waitFor(() => {
            expect(router.state.location.pathname).toEqual('/game');
            expect(router.state.location.state).toBeNull();
          });
        });
        it('renders with stored session', () => {
          (
            storage.getItem as Mock<[key: string], string | null>
          ).mockImplementation((key) => {
            if (key === 'ui-language') {
              return 'pl';
            }
            if (key === 'word-language') {
              return 'pl';
            }
            if (key === 'game-session') {
              return 'session';
            }
            return null;
          });
          const refresh = vi.fn();
          const { container } = renderMockRouter(
            createMemoryRouter([
              {
                path: EPaths.ROOT,
                index: true,
                element: <HomePage />,
              },
            ]),
            {
              configContext: { refresh },

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
            },
          );

          expect(container).toMatchSnapshot();
          expect(refresh).toBeCalled();
        });
        it('continues session game', async () => {
          (
            storage.getItem as Mock<[key: string], string | null>
          ).mockImplementation((key) => {
            if (key === 'ui-language') {
              return 'pl';
            }
            if (key === 'word-language') {
              return 'pl';
            }
            if (key === 'game-session') {
              return 'session';
            }
            return null;
          });
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <HomePage />,
            },
            {
              path: EPaths.GAME,
              element: <p>GAME</p>,
            },
          ]);
          const refresh = vi.fn();
          const { getByText } = renderMockRouter(router, {
            configContext: { refresh },

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

          expect(refresh).toBeCalled();

          fireEvent.click(getByText(translationPl['continue-button']));

          await waitFor(() => {
            expect(router.state.location.pathname).toEqual('/game');
            expect(router.state.location.state).toEqual('session');
          });
        });
      });
    });
  });
});
