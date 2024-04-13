import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { IDictionary } from '@repo/common-types';
import { getBowserDetails, hasOwn } from '@repo/utils';
import {
  cleanup,
  Queries,
  queries,
  RenderResult,
  waitFor,
} from '@testing-library/react';
import { NavigateOptions, createBrowserRouter } from 'react-router-dom';
import { defaultLanguageContext } from '../../../../i18n/LanguageContext/__tests__/contextRenderer';
import { replaceSubstituteMap } from '../../../../i18n/helpers';
import {
  TRenderMockRouterProps,
  renderMockRouter,
} from '../../__tests__/helpers';
import { EPaths } from '../../enums';
import { GamePageInner } from './GamePage';
import {
  MockContext,
  gameResponses,
} from '../../../context/__tests__/contextRenderer';
import { IGameContext } from '../../../context';
import { createFetchResponse } from '../../../../__tests__/helpers';
import { TGamePageLocationState } from '../../../types';
import { TGameRecord } from '@repo/backend-types';

vi.mock('@repo/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const original = await importOriginal<any>();

  // let storage: IDictionary<string> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const AppStorageMock = vi.fn<any, IStorage>();
  // const proto = AppStorageMock.prototype as IStorage;

  // proto.getItem = vi.fn().mockImplementation((key: string): string | null => {
  //   return storage[key] || null;
  // });
  // proto.setItem = vi
  //   .fn()
  //   .mockImplementation((key: string, value: string): void => {
  //     storage[key] = value;
  //   });
  // proto.removeItem = vi.fn().mockImplementation((key: string) => {
  //   delete storage[key];
  // });
  // proto.has = vi.fn().mockImplementation((key: string) => {
  //   return !!storage[key];
  // });
  // proto.clear = vi.fn().mockImplementation(() => {
  //   storage = {};
  // });
  // proto.clearStorage = vi.fn().mockImplementation(() => {
  //   storage = {};
  // });

  // // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  // const instance = new AppStorageMock();

  // // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  // (AppStorageMock as any).getInstance = vi.fn().mockReturnValue(instance);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...original,

    getBowserDetails: vi.fn(),
    // AppStorage: AppStorageMock,
  };
});

const originalFetch = global.fetch;

describe('game', () => {
  describe('routes', () => {
    describe('components', () => {
      describe('GamePage', () => {
        const locationState: TGamePageLocationState = {
          language: 'pl',
          maxAttempts: 8,
          wordLength: 5,
        };

        const bowserMobile = {
          browser: {
            name: 'Safari',
            version: '16.6',
          },
          os: {
            name: 'iOS',
            version: '16.6',
          },
          platform: {
            type: 'mobile',
            vendor: 'Apple',
            model: 'iPhone',
          },
          engine: {
            name: 'WebKit',
            version: '605.1.15',
          },
        };
        const bowserDesktop = {
          browser: {
            name: 'Chrome',
            version: '122.0.0.0',
          },
          os: {
            name: 'Linux',
          },
          platform: {
            type: 'desktop',
          },
          engine: {
            name: 'Blink',
          },
        };
        const translationPl: IDictionary<string> = {
          'continue-button': 'Kontynuuj grę',

          'input-modal-close-button': 'Ukryj',
          'input-modal-info-done': 'Naciśnij Gotowe by sprawdzić',
          'input-modal-info-start': 'Wpisz {maxLength} literowe słowo',
          'input-modal-label': 'Podaj słowo do odgadnięcia',
          'input-modal-ok-button': 'Gotowe',
          'main-desktop-info':
            'Zacznij wpisywać słowo, naciśnij Enter żeby potwierdzić.',
          'main-error-invalid-word': 'Niepoprawne słowo',
          'main-legend-correct': 'Dobra litera',
          'main-legend-incorrect': 'Zła litera',
          'main-legend-misplaced': 'Złe miejsce',
          'main-mobile-info':
            'Naciśnij linię z ikonką edycji by wprowadzić słowo.',
          'main-subtitle': 'Odgadnij słowo które mam na myśli...',
          'main-title': 'Mistrz Słowa',

          loading: 'Wczytuję...',
        };
        type TRouterProps = {
          path?: string;
          navigateOpts?: NavigateOptions;
        };
        type TParams<
          Q extends Queries,
          Container extends Element | DocumentFragment,
          BaseElement extends Element | DocumentFragment,
        > = TRenderMockRouterProps<Q, Container, BaseElement> &
          TRouterProps & { gameContext?: Partial<IGameContext> };
        const testInit = async <
          Q extends Queries = typeof queries,
          Container extends Element | DocumentFragment = HTMLElement,
          BaseElement extends Element | DocumentFragment = Container,
        >(
          params?: TParams<Q, Container, BaseElement>,
        ): Promise<
          RenderResult<Q, Container, BaseElement> & {
            router: ReturnType<typeof createBrowserRouter>;
          }
        > => {
          const {
            navigateOpts,
            path = EPaths.GAME,

            ...props
          } = params ||
          ({
            path: EPaths.GAME,
            navigateOpts: undefined,
          } as TParams<Q, Container, BaseElement>);
          const router = createBrowserRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.GAME,
              element: (
                <MockContext context={props.gameContext}>
                  <GamePageInner />
                </MockContext>
              ),
            },
            {
              path: EPaths.GAME_ERROR,
              element: <p>GAME ERROR</p>,
            },
            {
              path: EPaths.RESULTS,
              element: <p>RESULTS</p>,
            },
          ]);
          await router.navigate(path, navigateOpts);

          const renderResults = renderMockRouter(router, {
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
            ...(props || {}),
          });

          return {
            ...renderResults,
            router,
          };
        };

        let mockFetch = vi.fn();
        beforeEach(() => {
          mockFetch = vi.fn();

          global.fetch = mockFetch;

          (getBowserDetails as Mock).mockReturnValue(bowserDesktop);
        });
        afterEach(() => {
          vi.clearAllMocks();
          global.fetch = originalFetch;
          cleanup();
        });

        it('renders game', async () => {
          mockFetch.mockResolvedValue(
            createFetchResponse(true, gameResponses.gameInit),
          );
          const init = vi.fn();

          const { getByText } = await testInit({
            gameContext: {
              init,
              loading: true,
            },
            navigateOpts: { state: locationState },
          });

          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();

          // game initiated
          expect(init).toHaveBeenLastCalledWith('pl', 8, 5, undefined);
        });

        it('renders game mobile', async () => {
          (getBowserDetails as Mock).mockReturnValue(bowserMobile);

          const { getByText } = await testInit({
            gameContext: {
              loading: false,
              session: gameResponses.gameNext.session,
              game: gameResponses.gameNext.game as TGameRecord,
            },
            navigateOpts: { state: locationState },
          });

          // mobile info
          expect(getByText(translationPl['main-mobile-info'])).toBeDefined();
        });

        it('Returns to Home page when no language in state', async () => {
          mockFetch.mockResolvedValue(
            createFetchResponse(true, gameResponses.gameInit),
          );
          const init = vi.fn();

          const { getByText, queryByText } = await testInit({
            gameContext: {
              init,
              loading: true,
            },
            navigateOpts: undefined,
          });

          // not in the game page anymore
          expect(queryByText(translationPl['loading'])).toBeNull();

          // back on home page
          expect(getByText('HOME')).toEqual(expect.anything());
        });

        it('Handles SESSION_ERROR', async () => {
          mockFetch.mockResolvedValue(
            createFetchResponse(true, gameResponses.gameInit),
          );
          const init = vi.fn();
          const locationStateWithSession = {
            ...locationState,
            session: 'session',
          };
          await testInit({
            gameContext: {
              init,
              loading: false,
              session: 'session',
              error: {
                code: 2 /* SESSION_ERROR */,
                error: 'Invalid session',
              },
            },

            navigateOpts: { state: locationStateWithSession },
          });

          // session removed
          expect(window.history.state.usr).toStrictEqual(locationState);
        });

        it('Handles other error', async () => {
          mockFetch.mockResolvedValue(
            createFetchResponse(true, gameResponses.gameInit),
          );

          const { getByText, queryByText } = await testInit({
            gameContext: {
              loading: false,
              error: {
                code: -1,
                error: 'Unknown error',
              },
            },
            navigateOpts: { state: locationState },
          });

          // not in the game page anymore
          expect(queryByText(translationPl['loading'])).toBeNull();

          // navigate to game error
          expect(getByText('GAME ERROR')).toEqual(expect.anything());
        });

        it('Navigates to Win result', async () => {
          const locationStateWithSession = {
            ...locationState,
            session: gameResponses.gameWon.session,
          };
          const { getByText } = await testInit({
            gameContext: {
              loading: false,
              session: gameResponses.gameWon.session,
              game: gameResponses.gameWon.game as TGameRecord,
              highest: gameResponses.gameWon.highest,
            },
            navigateOpts: { state: locationStateWithSession },
          });


            // back on home page
            expect(getByText('RESULTS')).toEqual(expect.anything());

            // state
            expect(window.history.state.usr).toStrictEqual({
              session: gameResponses.gameWon.session,
              game: gameResponses.gameWon.game as TGameRecord,
              highest: gameResponses.gameWon.highest,
            });
          
        });

        it('Navigates to Lose result', async () => {
          const locationStateWithSession = {
            ...locationState,
            session: gameResponses.gameLost.session,
          };
          const { getByText } = await testInit({
            gameContext: {
              loading: false,
              session: gameResponses.gameLost.session,
              game: gameResponses.gameLost.game as TGameRecord,
              highest: gameResponses.gameLost.highest,
            },
            navigateOpts: { state: locationStateWithSession },
          });


            // back on home page
            expect(getByText('RESULTS')).toEqual(expect.anything());

            // state
            expect(window.history.state.usr).toStrictEqual({
              session: gameResponses.gameLost.session,
              game: gameResponses.gameLost.game as TGameRecord,
              highest: gameResponses.gameLost.highest,
            });
          
        });
      });
    });
  });
});
