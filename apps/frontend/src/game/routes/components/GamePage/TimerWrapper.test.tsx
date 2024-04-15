import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import {
  contextRenderer,
  gameResponses,
} from '../../../context/__tests__/contextRenderer';
import { IGameContext } from '../../../context';
import { TimerWrapper } from './TimerWrapper';
import { createFetchResponse } from '../../../../__tests__/helpers';
import { TGameRecord } from '@repo/backend-types';

const originalFetch = global.fetch;

describe('game', () => {
  describe('routes', () => {
    describe('components', () => {
      describe('GamePage', () => {
        describe('TimerWrapper', () => {
          let mockFetch = vi.fn();

          beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date(1979, 5, 13));
            mockFetch = vi.fn();
            global.fetch = mockFetch;

            // MOCK FETCH FIRST
            mockFetch.mockResolvedValue(
              createFetchResponse(true, gameResponses.gameInit),
            );
          });
          afterEach(() => {
            vi.clearAllMocks();
            global.fetch = originalFetch;
            vi.useRealTimers();
          });

          it('renders', () => {
            const { container } = contextRenderer(<TimerWrapper />);

            expect(container).toMatchSnapshot();
          });

          it("doesn't change time while loading", () => {
            const gameContext: Pick<IGameContext, 'loading'> = {
              loading: false,
            };
            const { getByText } = contextRenderer(<TimerWrapper />, {
              context: gameContext,
            });

            expect(getByText('00:00')).toBeDefined();

            // progress time
            act(() => {
              vi.advanceTimersByTime(3000);
            });

            // it still need to say 00:00
            expect(getByText('00:00')).toBeDefined();
          });

          it("doesn't change time when game attempt is 0", () => {
            const gameContext: Pick<IGameContext, 'loading' | 'game'> = {
              loading: false,
              game: gameResponses.gameInit.game as unknown as TGameRecord,
            };
            const { getByText } = contextRenderer(<TimerWrapper />, {
              context: gameContext,
            });

            expect(getByText('00:00')).toBeDefined();

            // progress time
            act(() => {
              vi.advanceTimersByTime(3000);
            });

            // it still need to say 00:00
            expect(getByText('00:00')).toBeDefined();
          });

          it("doesn't change time when game is finished", () => {
            const gameContext: Pick<IGameContext, 'loading' | 'game'> = {
              loading: false,
              game: gameResponses.gameWon.game as unknown as TGameRecord,
            };
            const { getByText } = contextRenderer(<TimerWrapper />, {
              context: gameContext,
            });

            expect(getByText('00:00')).toBeDefined();

            // progress time
            act(() => {
              vi.advanceTimersByTime(3000);
            });

            // it still need to say 00:00
            expect(getByText('00:00')).toBeDefined();
          });

          it('Updates timer while game is running', () => {
            const gameContext: Pick<IGameContext, 'loading' | 'game'> = {
              loading: false,
              game: {
                ...gameResponses.gameNext.game,
                timestamp_start: new Date(1979, 5, 12, 23, 1, 1)
              } as unknown as TGameRecord,
            };
            const { getByText } = contextRenderer(<TimerWrapper />, {
              context: gameContext,
            });

            expect(getByText('00:00')).toBeDefined();

            // progress time
            act(() => {
              vi.advanceTimersByTime(3000);
            });

            expect(getByText('59:02')).toBeDefined();
          });
        });
      });
    });
  });
});
