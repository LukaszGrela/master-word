import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { IDictionary } from '@repo/common-types';
import { hasOwn } from '@repo/utils';
import { TGameRecord } from '@repo/backend-types';
import {
  contextRenderer,
  gameResponses,
} from '../../../context/__tests__/contextRenderer';
import { MockContext } from '../../../../i18n/LanguageContext/__tests__/contextRenderer';
import { MobileInputGuessPanel } from './MobileInputGuessPanel';
import { replaceSubstituteMap } from '../../../../i18n/helpers';

describe('game', () => {
  describe('routes', () => {
    describe('components', () => {
      describe('GamePage', () => {
        describe('MobileInputGuessPanel', () => {
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

          it('renders null when no game', () => {
            const { container } = contextRenderer(
              <MockContext
                context={{
                  loading: false,
                  getUIText: vi.fn().mockImplementation(
                    (
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
                  ),
                }}
              >
                <MobileInputGuessPanel />
              </MockContext>,
              {
                context: {
                  loading: false,
                },
              },
            );

            expect(container).toMatchSnapshot();
          });

          it('renders null when game finished', () => {
            const { container } = contextRenderer(
              <MockContext
                context={{
                  loading: false,
                  getUIText: vi.fn().mockImplementation(
                    (
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
                  ),
                }}
              >
                <MobileInputGuessPanel />
              </MockContext>,
              {
                context: {
                  loading: false,
                  game: gameResponses.gameWon.game as unknown as TGameRecord,
                },
              },
            );

            expect(container).toMatchSnapshot();
          });

          it('renders', () => {
            const { queryByText, getByTestId } = contextRenderer(
              <MockContext
                context={{
                  loading: false,
                  getUIText: vi.fn().mockImplementation(
                    (
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
                  ),
                }}
              >
                <div className="board" data-testid="board">
                  Click Me
                </div>
                <MobileInputGuessPanel />
              </MockContext>,
              {
                context: {
                  loading: false,
                  game: gameResponses.gameInit.game as unknown as TGameRecord,
                },
              },
            );

            let label = queryByText(translationPl['input-modal-label']);
            expect(label).toBeNull();

            const board = getByTestId('board');
            expect(board).toEqual(expect.anything());

            fireEvent.click(board);

            // should be opened
            label = queryByText(translationPl['input-modal-label']);
            expect(label).toEqual(expect.anything());
          });

          it('renders error', () => {
            const { queryByText, queryByDisplayValue } = contextRenderer(
              <MockContext
                context={{
                  loading: false,
                  getUIText: vi.fn().mockImplementation(
                    (
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
                  ),
                }}
              >
                <div className="board" data-testid="board">
                  Click Me
                </div>
                <MobileInputGuessPanel />
              </MockContext>,
              {
                context: {
                  loading: false,
                  game: gameResponses.gameNext.game as unknown as TGameRecord,

                  error: {
                    code: 6,
                    error: 'Error message',
                    details: 'CINDY',
                  },
                },
              },
            );

            let label = queryByText(translationPl['input-modal-label']);

            // should be opened
            label = queryByText(translationPl['input-modal-label']);
            expect(label).toEqual(expect.anything());
            expect(queryByDisplayValue('CINDY')).toEqual(expect.anything());
          });

          it('calls guess action', () => {
            const guess = vi.fn();

            const { queryByText, getByTestId } = contextRenderer(
              <MockContext
                context={{
                  loading: false,
                  getUIText: vi.fn().mockImplementation(
                    (
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
                  ),
                }}
              >
                <div className="board" data-testid="board">
                  Click Me
                </div>
                <MobileInputGuessPanel />
              </MockContext>,
              {
                context: {
                  loading: false,
                  game: gameResponses.gameNext.game as unknown as TGameRecord,
                  guess,
                },
              },
            );

            let label = queryByText(translationPl['input-modal-label']);
            expect(label).toBeNull();

            const board = getByTestId('board');
            expect(board).toEqual(expect.anything());

            fireEvent.click(board);

            // should be opened
            label = queryByText(translationPl['input-modal-label']);
            expect(label).toEqual(expect.anything());
            // type a word

            const input = getByTestId('input-modal-guess');
            // type word
            fireEvent.change(input, { target: { value: 'GUESS' } });

            // keyboard event
            input.focus();
            fireEvent.keyUp(document.activeElement || document.body, {
              key: 'Enter',
              code: 'Enter',
              charCode: 13,
            });

            expect(guess).toHaveBeenCalledTimes(1);
            expect(guess).toHaveBeenLastCalledWith('GUESS')
          });
        });
      });
    });
  });
});
