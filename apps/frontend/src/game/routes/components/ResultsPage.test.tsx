import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultLanguageContext } from '../../../i18n/LanguageContext/__tests__/contextRenderer';
import { ResultsPage } from './ResultsPage';
import { AppStorage, EStorageKeys, IStorage, hasOwn } from '@repo/utils';
import { IDictionary } from '@repo/common-types';
import { replaceSubstituteMap } from '../../../i18n/helpers';
import { createMemoryRouter } from 'react-router-dom';
import { EPaths, getResultsPath } from '../enums';
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
      describe('ResultsPage', () => {
        const gameWon = {
          _id: '660d501fa79a7dd174b8f527',
          session: '590fe9dd-08f7-4fde-90ba-105c9a2ce00b',
          game: {
            language: 'pl',
            timestamp_start: '1712211954608',
            max_attempts: 8,
            attempt: 3,
            word: 'CACKA',
            word_length: 5,
            guessed: true,
            score: 3.25,
            state: [
              {
                word: ['T', 'E', 'R', 'M', 'Y'],
                validated: ['X', 'X', 'X', 'X', 'X'],
                _id: '660e47f2a79a7dd174b8f534',
              },
              {
                word: ['P', 'A', 'C', 'K', 'A'],
                validated: ['X', 'C', 'C', 'C', 'C'],
                _id: '660e481da79a7dd174b8f543',
              },
              {
                word: ['C', 'A', 'C', 'K', 'A'],
                validated: ['C', 'C', 'C', 'C', 'C'],
                _id: '660e4822a79a7dd174b8f54f',
              },
              {
                word: ['', '', '', '', ''],
              },
              {
                word: ['', '', '', '', ''],
              },
              {
                word: ['', '', '', '', ''],
              },
              {
                word: ['', '', '', '', ''],
              },
              {
                word: ['', '', '', '', ''],
              },
            ],
            finished: true,
            _id: '660d501fa79a7dd174b8f528',
            timestamp_finish: '1712212002613',
          },
          __v: 2,
        };
        const gameLost = {
          _id: '660d501fa79a7dd174b8f527',
          session: '590fe9dd-08f7-4fde-90ba-105c9a2ce00b',
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
        const translationPl: IDictionary<string> = {
          'general-error-title': 'Ożesz kurczaczki!',
          'general-error-message':
            'Przepraszamy, nieoczekiwany błąd jak piorun z nieba spadł i zepsuł zabawę...',
          'general-error-btn-home': 'Zamknij',
          'game-error-subtitle': 'Problem z sesją gry.',
          'translation-info-sr': 'Wybierz język interfejsu',
          'translation-button-en': 'Angielski',
          'translation-button-pl': 'Polski',
          'result-language-selector-btn-title-pl': 'Słowo polskie',
          'result-language-selector-btn-title-en': 'Słowo angielskie',
          'result-win': 'Wygrałeś w {attempt} próbach',
          'result-lose': 'Przegrałeś, słowo do odgadnięcia to {wordToGuess}',
          'result-playtime': 'Czas rozgrywki: {playTime}',
          'result-again-button': 'Odgadnij następne słowo',
          'result-quit-button': 'Zakończ grę',
          'highscore-label': 'Nowy Rekord',
          'result-save-session-button': 'Kontynuuj później',
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
        it('renders win', async () => {
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.RESULTS,
              element: <ResultsPage />,
            },
          ]);
          await router.navigate(getResultsPath('win'), {
            state: gameWon,
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
        }, 10000);
        it('renders lose, no game object', async () => {
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.RESULTS,
              element: <ResultsPage />,
            },
          ]);
          await router.navigate(getResultsPath('win'), {
            state: { session: 'session' },
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
        }, 10000);
        it('Won, continue later', async () => {
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.RESULTS,
              element: <ResultsPage />,
            },
          ]);
          await router.navigate(getResultsPath('win'), {
            state: gameWon,
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

          fireEvent.click(
            getByText(translationPl['result-save-session-button']),
          );

          await waitFor(() => {
            expect(router.state.location.pathname).toEqual('/');
            expect(router.state.location.state).toBeNull();
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(storage.setItem).toHaveBeenLastCalledWith(
              EStorageKeys.GAME_SESSION,
              gameWon.session,
            );
          });
        }, 10000);
        it('Won, guess another', async () => {
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.GAME,
              element: <p>GAME</p>,
            },
            {
              path: EPaths.RESULTS,
              element: <ResultsPage />,
            },
          ]);
          await router.navigate(getResultsPath('win'), {
            state: gameWon,
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
            expect(router.state.location.pathname).toEqual(EPaths.GAME);
            expect(router.state.location.state).toMatchObject({session:gameWon.session});
          });
        }, 10000);
        it('renders lose', async () => {
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.RESULTS,
              element: <ResultsPage />,
            },
          ]);
          await router.navigate(getResultsPath('lose'), {
            state: gameLost,
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
        }, 10000);
        it('Lost, finish game', async () => {
          const router = createMemoryRouter([
            {
              path: EPaths.ROOT,
              index: true,
              element: <p>HOME</p>,
            },
            {
              path: EPaths.RESULTS,
              element: <ResultsPage />,
            },
          ]);
          await router.navigate(getResultsPath('lose'), {
            state: gameLost,
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

          fireEvent.click(getByText(translationPl['result-quit-button']));

          await waitFor(() => {
            expect(router.state.location.pathname).toEqual(EPaths.ROOT);
            expect(router.state.location.state).toBeNull();
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(storage.removeItem).toHaveBeenLastCalledWith(
              EStorageKeys.GAME_SESSION,
            );
          });
        }, 10000);
      });
    });
  });
});
