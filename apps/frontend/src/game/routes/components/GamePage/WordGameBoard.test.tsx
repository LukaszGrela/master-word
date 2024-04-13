import { describe, expect, it } from 'vitest';
import {
  contextRenderer,
  gameResponses,
} from '../../../context/__tests__/contextRenderer';
import { WordGameBoard } from './WordGameBoard';
import { TGameRecord } from '@repo/backend-types';

describe('game', () => {
  describe('routes', () => {
    describe('components', () => {
      describe('GamePage', () => {
        describe('WordGameBoard', () => {
          it('renders init game', () => {
            
            const { container } = contextRenderer(<WordGameBoard />, {
              context: {
                loading: false,
              },
            });

            expect(container).toMatchSnapshot();
          });
          it('renders init game with loading state', () => {
            const { container } = contextRenderer(<WordGameBoard />, {
              context: {
                loading: true,
                game: gameResponses.gameInit.game as unknown as TGameRecord,
              },
            });

            expect(container).toMatchSnapshot();
          });
          it('renders guess attempt', () => {
            const { container } = contextRenderer(<WordGameBoard />, {
              context: {
                loading: false,
                game: gameResponses.gameNext.game as unknown as TGameRecord,
              },
            });

            expect(container).toMatchSnapshot();
          });
          it('renders guess attempt with an error', () => {
            const { container } = contextRenderer(<WordGameBoard />, {
              context: {
                loading: false,
                game: gameResponses.gameNext.game as unknown as TGameRecord,
                error: {
                  code: 6,
                  error: 'Error message'
                }
              },
            });

            expect(container).toMatchSnapshot();
          });
          it('renders finished attempt', () => {
            const { container } = contextRenderer(<WordGameBoard />, {
              context: {
                loading: false,
                game: gameResponses.gameWon.game as unknown as TGameRecord,
              },
            });

            expect(container).toMatchSnapshot();
          });
        });
      });
    });
  });
});
