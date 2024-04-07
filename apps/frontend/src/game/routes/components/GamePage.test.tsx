/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createBrowserRouter } from 'react-router-dom';
import { NavigateOptions } from 'react-router';
import { defaultLanguageContext } from '../../../i18n/LanguageContext/__tests__/contextRenderer';
import {
  AppStorage,
  EStorageKeys,
  IStorage,
  hasOwn,
  getBowserDetails,
} from '@repo/utils';
import { IDictionary } from '@repo/common-types';
import { TGameSession } from '@repo/backend-types';
import { replaceSubstituteMap } from '../../../i18n/helpers';
import { EPaths } from '../enums';
import { TRenderMockRouterProps, renderMockRouter } from '../__tests__/helpers';
import {
  Queries,
  RenderResult,
  cleanup,
  fireEvent,
  queries,
  waitFor,
  screen,
} from '@testing-library/react';
import { GamePage } from './GamePage';
import {
  createFetchResponse,
  hitEnter,
  hitKey,
} from '../../../__tests__/helpers';
import { inflateGameState } from '../../../api';

vi.mock('@repo/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const original = await importOriginal<any>();

  let storage: IDictionary<string> = {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AppStorageMock = vi.fn<any, IStorage>();
  const proto = AppStorageMock.prototype as IStorage;

  proto.getItem = vi.fn().mockImplementation((key: string): string | null => {
    return storage[key] || null;
  });
  proto.setItem = vi
    .fn()
    .mockImplementation((key: string, value: string): void => {
      storage[key] = value;
    });
  proto.removeItem = vi.fn().mockImplementation((key: string) => {
    delete storage[key];
  });
  proto.has = vi.fn().mockImplementation((key: string) => {
    return !!storage[key];
  });
  proto.clear = vi.fn().mockImplementation(() => {
    storage = {};
  });
  proto.clearStorage = vi.fn().mockImplementation(() => {
    storage = {};
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const instance = new AppStorageMock();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (AppStorageMock as any).getInstance = vi.fn().mockReturnValue(instance);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...original,

    getBowserDetails: vi.fn().mockReturnValue({
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
    }),
    AppStorage: AppStorageMock,
  };
});

const originalFetch = global.fetch;

type TQuintuple = [string, string, string, string, string];
async function assessTypeGuess(word: TQuintuple, row = 0) {
  // fire input events
  hitKey(word[0]);
  hitKey(word[1]);
  hitKey(word[2]);
  hitKey(word[3]);
  hitKey(word[4]);

  // check typed word
  await waitFor(() => {
    const firstLetter = screen.getByTestId(`letter-${row}-0`);
    expect(firstLetter).toBeDefined();
    expect(firstLetter.textContent).toBe(word[0].toLocaleUpperCase());

    const lastLetter = screen.getByTestId(`letter-${row}-4`);
    expect(lastLetter).toBeDefined();
    expect(lastLetter.textContent).toBe(word[4].toLocaleUpperCase());
  });

  // event
  hitEnter();
}

describe('game', () => {
  describe('routes', () => {
    describe('components', () => {
      describe('GamePage', () => {
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
        const gameInit = {
          session: 'f332a4d5-78d6-4446-83e2-4bfce4783605',
          game: {
            language: 'pl',
            timestamp_start: '1712253239075',
            max_attempts: 8,
            attempt: 0,
            word_length: 5,
            guessed: false,
            score: 0,
            state: [],
            finished: false,
          },
        };

        const gameNext = {
          session: 'f332a4d5-78d6-4446-83e2-4bfce4783605',
          game: {
            language: 'pl',
            timestamp_start: '1712254045301',
            max_attempts: 8,
            attempt: 3,
            word_length: 5,
            guessed: false,
            score: 0,
            state: [
              {
                word: ['P', 'E', 'R', 'Ł', 'A'],
                validated: ['X', 'X', 'X', 'X', 'C'],
              },
              {
                word: ['T', 'A', 'T', 'A', 'R'],
                validated: ['X', 'C', 'X', 'M', 'X'],
              },
              {
                word: ['P', 'A', 'Ł', 'K', 'A'],
                validated: ['X', 'C', 'X', 'C', 'C'],
              },
            ],
            finished: false,
          },
        };
        const gameWon = {
          session: 'f332a4d5-78d6-4446-83e2-4bfce4783605',
          game: {
            language: 'pl',
            timestamp_start: '1712254045301',
            max_attempts: 8,
            attempt: 4,
            word: 'JAJKA',
            word_length: 5,
            guessed: true,
            score: 2,
            state: [
              {
                word: ['P', 'E', 'R', 'Ł', 'A'],
                validated: ['X', 'X', 'X', 'X', 'C'],
              },
              {
                word: ['T', 'A', 'T', 'A', 'R'],
                validated: ['X', 'C', 'X', 'M', 'X'],
              },
              {
                word: ['P', 'A', 'Ł', 'K', 'A'],
                validated: ['X', 'C', 'X', 'C', 'C'],
              },
              {
                word: ['J', 'A', 'J', 'K', 'A'],
                validated: ['C', 'C', 'C', 'C', 'C'],
              },
            ],
            finished: true,

            timestamp_finish: '1712254109572',
          },
          __v: 3,
        };
        const gameLost = {
          _id: '660d501fa79a7dd174b8f527',
          session: 'f332a4d5-78d6-4446-83e2-4bfce4783605',
          __v: 9,
          highest: {
            'pl:5': {
              score: 3.25,
              timeMs: 48005,
              attempts: 3,
              language: 'pl',
              length: 5,
              _id: '660e4822a79a7dd174b8f550',
            },
          },
          game: {
            language: 'pl',
            timestamp_start: '1712212870373',
            max_attempts: 8,
            attempt: 8,
            word: 'ŁZAWY',
            word_length: 5,
            guessed: false,
            score: 0,
            state: [
              {
                word: ['B', 'E', 'R', 'T', 'A'],
                validated: ['X', 'X', 'X', 'X', 'M'],
                _id: '660e4b86a79a7dd174b8f566',
              },
              {
                word: ['K', 'A', 'R', 'T', 'A'],
                validated: ['X', 'M', 'X', 'X', 'X'],
                _id: '660e4b89a79a7dd174b8f56f',
              },
              {
                word: ['S', 'A', 'N', 'K', 'I'],
                validated: ['X', 'M', 'X', 'X', 'X'],
                _id: '660e4b8fa79a7dd174b8f581',
              },
              {
                word: ['S', 'T', 'A', 'C', 'H'],
                validated: ['X', 'X', 'C', 'X', 'X'],
                _id: '660e4b9aa79a7dd174b8f597',
              },
              {
                word: ['P', 'T', 'A', 'K', 'I'],
                validated: ['X', 'X', 'C', 'X', 'X'],
                _id: '660e4ba1a79a7dd174b8f5b1',
              },
              {
                word: ['W', 'R', 'A', 'C', 'A'],
                validated: ['M', 'X', 'C', 'X', 'X'],
                _id: '660e4baaa79a7dd174b8f5cf',
              },
              {
                word: ['S', 'W', 'A', 'R', 'Y'],
                validated: ['X', 'M', 'C', 'X', 'C'],
                _id: '660e4bb4a79a7dd174b8f5f1',
              },
              {
                word: ['P', 'R', 'A', 'W', 'Y'],
                validated: ['X', 'X', 'C', 'C', 'C'],
                _id: '660e4bc3a79a7dd174b8f626',
              },
            ],
            finished: true,
            _id: '660e4b82a79a7dd174b8f559',
            timestamp_finish: '1712212931548',
          },
        };

        const invalidSession = { code: 2, error: 'Invalid session id' };
        const invalidWord = { code: 6, error: 'Invalid word' };
        const misconfiguration = {
          code: 7,
          error: 'Can not start new game. Misconfiguration.',
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
        const testInit = async <
          Q extends Queries = typeof queries,
          Container extends Element | DocumentFragment = HTMLElement,
          BaseElement extends Element | DocumentFragment = Container,
        >(
          params?: TRenderMockRouterProps<Q, Container, BaseElement> &
            TRouterProps,
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
          } as TRenderMockRouterProps<Q, Container, BaseElement> &
            TRouterProps);
          const router = createBrowserRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.GAME,
              element: <GamePage />,
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
        let storage: IStorage = AppStorage.getInstance();
        beforeEach(() => {
          mockFetch = vi.fn();
          storage = AppStorage.getInstance();

          storage.clear();
          storage.setItem(EStorageKeys.UI_LANGUAGE, 'pl');
          storage.setItem(EStorageKeys.GAME_LANGUAGE, 'pl');
          storage.setItem(EStorageKeys.GAME_WORD_LENGTH, '5');
          storage.setItem(EStorageKeys.GAME_ATTEMPTS, '8');

          global.fetch = mockFetch;

          (getBowserDetails as Mock).mockReturnValue(bowserDesktop);
        });
        afterEach(() => {
          vi.clearAllMocks();
          global.fetch = originalFetch;
          cleanup();
        });
        it('renders game', async () => {
          mockFetch.mockResolvedValue(createFetchResponse(true, gameInit));
          const { getByText, queryByText, container } = await testInit();
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();
          expect(container).toMatchSnapshot();

          // game initiated

          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );

          // await the loading state change
          await waitFor(() => {
            expect(
              queryByText(translationPl['main-desktop-info']),
            ).toBeDefined();
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          // game settled
          expect(container).toMatchSnapshot();
        }, 10000);
        it('renders game - mobile', async () => {
          (getBowserDetails as Mock).mockReturnValue(bowserMobile);
          mockFetch.mockResolvedValue(createFetchResponse(true, gameInit));
          const { getByText, queryByText, container } = await testInit();
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();
          expect(container).toMatchSnapshot();

          // game initiated

          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );

          // await the loading state change
          await waitFor(() => {
            expect(
              queryByText(translationPl['main-mobile-info']),
            ).toBeDefined();
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          // game settled
          expect(container).toMatchSnapshot();
        }, 10000);
        it('renders game - clear storage', async () => {
          storage.clear();

          mockFetch.mockResolvedValue(createFetchResponse(true, gameInit));
          const { getByText, queryByText, container } = await testInit();
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();
          expect(container).toMatchSnapshot();

          // game initiated

          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&maxAttempts=6/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );

          // await the loading state change
          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          // game settled
          expect(container).toMatchSnapshot();
        }, 10000);
        it('renders guess response', async () => {
          mockFetch.mockResolvedValue(createFetchResponse(true, gameInit));
          const { queryByText, getByTestId } = await testInit();

          // await the loading state change
          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          // clear mocks
          vi.clearAllMocks();
          // mock guess response
          mockFetch.mockResolvedValue(createFetchResponse(true, gameNext));

          await assessTypeGuess('guess'.split('') as TQuintuple);

          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/guess\?guess=GUESS&session=f332a4d5-78d6-4446-83e2-4bfce4783605/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );

          // await loading state
          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeDefined();
          });

          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeNull();

            // loaded state
            const firstLetter = getByTestId('letter-2-0');
            expect(firstLetter).toBeDefined();
            expect(firstLetter.textContent).toBe('P');

            const lastLetter = getByTestId('letter-2-4');
            expect(lastLetter).toBeDefined();
            expect(lastLetter.textContent).toBe('A');
          });
        }, 10000);
        it('renders win response', async () => {
          mockFetch.mockResolvedValue(createFetchResponse(true, gameInit));
          const { router, queryByText } = await testInit();

          // await the loading state change for init game
          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          // clear mocks
          vi.clearAllMocks();

          // mock guess response
          mockFetch.mockResolvedValue(createFetchResponse(true, gameWon));

          // event to fire fetch
          await assessTypeGuess('jajka'.split('') as TQuintuple);

          // assert proper fetch being called
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/guess\?guess=JAJKA&session=f332a4d5-78d6-4446-83e2-4bfce4783605/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );

          // await loading state for guess endpoint
          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeDefined();
          });

          await waitFor(() => {
            expect(router.state.location.pathname).toEqual('/results/win');
            expect(router.state.location.state).toEqual(
              inflateGameState(gameWon as TGameSession),
            );
          });
        }, 10000);
        it('renders lose response', async () => {
          mockFetch.mockResolvedValue(createFetchResponse(true, gameInit));
          const { router, queryByText } = await testInit();

          // await the loading state change for init game
          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          // clear mocks
          vi.clearAllMocks();

          // mock guess response
          mockFetch.mockResolvedValue(createFetchResponse(true, gameLost));

          // fire input events
          await assessTypeGuess('loser'.split('') as TQuintuple);

          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/guess\?guess=LOSER&session=f332a4d5-78d6-4446-83e2-4bfce4783605/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );

          // await loading state for guess endpoint
          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeDefined();
          });

          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          await waitFor(() => {
            expect(router.state.location.pathname).toEqual('/results/lose');
            expect(router.state.location.state).toEqual(
              inflateGameState(gameLost as TGameSession),
            );
          });
        }, 10000);
        it('rerenders on invalid session', async () => {
          mockFetch.mockResolvedValue(
            createFetchResponse(false, invalidSession),
          );

          const { getByText } = await testInit({
            navigateOpts: {
              state: gameInit.session,
            },
          });
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();

          // game initiated
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&session=f332a4d5-78d6-4446-83e2-4bfce4783605&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );
          expect(fetch).toBeCalledTimes(1);
          // session exists
          expect(window.history.state.usr).toBe(gameInit.session);
          await waitFor(() => {
            // session cleared
            expect(window.history.state.usr).toBeUndefined();
          });
        }, 10000);

        it('invalid word error', async () => {
          mockFetch.mockResolvedValue(createFetchResponse(true, gameNext));

          const { getByText, queryByText, getByTestId } = await testInit({
            navigateOpts: {
              state: gameNext.session,
            },
          });
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();

          // game initiated
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&session=f332a4d5-78d6-4446-83e2-4bfce4783605&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );
          expect(fetch).toBeCalledTimes(1);
          // session exists
          expect(window.history.state.usr).toBe(gameNext.session);

          // finished initial loading
          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          // mock failure
          mockFetch.mockResolvedValue(createFetchResponse(false, invalidWord));
          // attempt to guess
          await assessTypeGuess('guess'.split('') as TQuintuple, 3);

          await waitFor(() => {
            const letter = getByTestId(`letter-3-0`);
            expect(letter).toBeDefined();
            expect(letter.classList.contains('active')).toBeTruthy();
            expect(letter.classList.contains('wrong')).toBeTruthy();
          });
        }, 10000);

        it('invalid word error - open input modal - mobile', async () => {
          (getBowserDetails as Mock).mockReturnValue(bowserMobile);
          mockFetch.mockResolvedValue(createFetchResponse(true, gameNext));

          const { getByText, queryByText, getByTestId, queryByTestId } =
            await testInit({
              navigateOpts: {
                state: gameNext.session,
              },
            });
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();

          // game initiated
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&session=f332a4d5-78d6-4446-83e2-4bfce4783605&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );
          expect(fetch).toBeCalledTimes(1);
          // session exists
          expect(window.history.state.usr).toBe(gameNext.session);

          // finished initial loading
          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          // game settled - click on board
          const board = getByTestId('board');
          expect(board).toBeDefined();
          fireEvent.click(board);

          await waitFor(() => {
            const label = queryByText(translationPl['input-modal-label']);
            expect(label).toBeDefined();
            expect(queryByTestId('input-modal-guess')).toBeDefined();
          });

          // mock failure
          mockFetch.mockResolvedValue(createFetchResponse(false, invalidWord));
          //
          let closeBtn = getByText(translationPl['input-modal-ok-button']);
          expect(closeBtn.getAttribute('disabled')).toBe('');

          const input = getByTestId('input-modal-guess');
          // type word
          fireEvent.change(input, { target: { value: 'GUESS' } });

          // it should now be enabled
          closeBtn = getByText(translationPl['input-modal-ok-button']);
          expect(closeBtn.getAttribute('disabled')).toBe(null);
          // click on modal done button
          fireEvent.click(closeBtn);

          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/guess\?guess=GUESS&session=/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );

          // now modal is closed
          await waitFor(() => {
            // loading the game
            expect(getByText(translationPl['loading'])).toBeDefined();
          });

          // error returned

          await waitFor(() => {
            // it should now be enabled
            const closeBtn = getByText(translationPl['input-modal-ok-button']);
            expect(closeBtn.getAttribute('disabled')).toBe(null);
            const input = getByTestId('input-modal-guess') as HTMLInputElement;

            expect(input.value).toBe('GUESS');
          });
          // click done
        }, 10000);

        it('navigate to game error', async () => {
          mockFetch.mockResolvedValue(
            createFetchResponse(false, misconfiguration),
          );

          const { getByText, router } = await testInit({
            navigateOpts: {
              state: gameInit.session,
            },
          });
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();

          // game initiated
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&session=f332a4d5-78d6-4446-83e2-4bfce4783605&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );
          expect(fetch).toBeCalledTimes(1);
          // session exists
          expect(window.history.state.usr).toBe(gameInit.session);
          await waitFor(() => {
            console.log(window.history.state.usr);
            expect(window.history.state.usr).toEqual({
              error: misconfiguration,
              session: null,
            });
            expect(router.state.location.pathname).toBe(EPaths.GAME_ERROR);
          });
        }, 10000);

        it('navigate to game error - failed request', async () => {
          mockFetch.mockRejectedValue(new Error('Internal Server Error'));

          const { getByText, router } = await testInit({
            navigateOpts: {
              state: gameInit.session,
            },
          });
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();

          // game initiated
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&session=f332a4d5-78d6-4446-83e2-4bfce4783605&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );
          expect(fetch).toBeCalledTimes(1);
          // session exists
          expect(window.history.state.usr).toBe(gameInit.session);
          await waitFor(() => {
            console.log(window.history.state.usr);
            expect(window.history.state.usr).toEqual({
              error: {
                code: -1,
                error: 'Internal Server Error',
              },
              session: null,
            });
            expect(router.state.location.pathname).toBe(EPaths.GAME_ERROR);
          });
        }, 10000);

        it('navigate to game error on guess failure', async () => {
          mockFetch.mockResolvedValue(createFetchResponse(true, gameInit));

          const { getByText, router, queryByText } = await testInit({
            navigateOpts: {
              state: gameInit.session,
            },
          });
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();

          // game initiated
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&session=f332a4d5-78d6-4446-83e2-4bfce4783605&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );
          expect(fetch).toBeCalledTimes(1);
          // session exists
          expect(window.history.state.usr).toBe(gameInit.session);

          // finished initialloading
          await waitFor(() => {
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          // mock failure
          mockFetch.mockResolvedValue(
            createFetchResponse(false, misconfiguration),
          );
          // attempt to guess

          await assessTypeGuess('guess'.split('') as TQuintuple);

          await waitFor(() => {
            console.log(window.history.state.usr);
            expect(window.history.state.usr).toEqual({
              error: misconfiguration,
              session: inflateGameState(gameInit as unknown as TGameSession),
            });
            expect(router.state.location.pathname).toBe(EPaths.GAME_ERROR);
          });
        }, 10000);
        it('rerenders on invalid session, on guess', async () => {
          mockFetch.mockClear();

          mockFetch.mockResolvedValue(createFetchResponse(true, gameInit));

          const { getByText, queryByText } = await testInit({
            navigateOpts: {
              state: gameInit.session,
            },
          });
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();

          // game initiated
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&session=f332a4d5-78d6-4446-83e2-4bfce4783605&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );
          expect(fetch).toBeCalledTimes(1);

          // session exists
          expect(window.history.state.usr).toBe(gameInit.session);

          await waitFor(() => {
            // loading is hidden
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          mockFetch.mockResolvedValue(
            createFetchResponse(false, invalidSession),
          );
          // attemp to guess, which should fail now
          await assessTypeGuess('guess'.split('') as TQuintuple);

          expect(fetch).toBeCalledTimes(2);
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/guess\?guess=GUESS&session=f332a4d5-78d6-4446-83e2-4bfce4783605/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );
          await waitFor(() => {
            // loading is displayed
            expect(queryByText(translationPl['loading'])).toBeDefined();
          });

          expect(fetch).toBeCalledTimes(3);
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&session=f332a4d5-78d6-4446-83e2-4bfce4783605&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );

          await waitFor(() => {
            // session cleared
            expect(window.history.state.usr).toBeUndefined();
          });
        }, 10000);
        it('Open input modal - mobile', async () => {
          (getBowserDetails as Mock).mockReturnValue(bowserMobile);
          mockFetch.mockResolvedValue(createFetchResponse(true, gameInit));
          const { getByText, queryByText, getByTestId, queryByTestId } =
            await testInit();
          // loading the game
          expect(getByText(translationPl['loading'])).toBeDefined();

          // game initiated
          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/init\?language=pl&maxAttempts=8/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );

          // await the loading state change
          await waitFor(() => {
            expect(
              queryByText(translationPl['main-mobile-info']),
            ).toBeDefined();
            expect(queryByText(translationPl['loading'])).toBeNull();
          });

          // game settled - click on board
          const board = getByTestId('board');
          expect(board).toBeDefined();
          fireEvent.click(board);

          await waitFor(() => {
            const label = queryByText(translationPl['input-modal-label']);
            expect(label).toBeDefined();
            expect(queryByTestId('input-modal-guess')).toBeDefined();
          });

          const input = getByTestId('input-modal-guess');

          // type word
          fireEvent.change(input, { target: { value: 'GUESS' } });

          // it should now be enabled
          const closeBtn = getByText(translationPl['input-modal-ok-button']);
          expect(closeBtn.getAttribute('disabled')).toBe(null);

          // read the docs adjusted
          const readTheDocs = queryByText(
            translationPl['input-modal-info-done'],
          );
          expect(readTheDocs).toBeDefined();

          // keyboard event
          input.focus();
          hitEnter();

          // expect guess event

          // mock guess response
          mockFetch.mockResolvedValue(createFetchResponse(true, gameNext));
          // event
          hitEnter();

          expect(fetch).toHaveBeenLastCalledWith(
            expect.stringMatching(
              /\/api\/frontend\/guess\?guess=GUESS&session=f332a4d5-78d6-4446-83e2-4bfce4783605/gi,
            ),
            expect.objectContaining({
              method: 'GET',
            }),
          );
        }, 10000);
      });
    });
  });
});
