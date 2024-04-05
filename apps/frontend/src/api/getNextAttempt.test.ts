import { TGameRecord, TGameSession } from '@repo/backend-types';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getNextAttempt, inflateGameState } from './getNextAttempt';

const createFetchResponse = (ok: boolean, response: unknown) => ({
  ok,
  json: () => Promise.resolve(response),
  text: () => Promise.resolve(JSON.stringify(response)),
});
const originalFetch = global.fetch;

describe('api', () => {
  describe('getNextAttempt', () => {
    const mockFetch = vi.fn();
    beforeEach(() => {
      global.fetch = mockFetch;
    });
    afterEach(() => {
      vi.clearAllMocks();
      global.fetch = originalFetch;
    });
    it('resolves', async () => {
      const data: TGameSession = {
        session: 'session',
        game: {
          attempt: 1,
          finished: false,
          guessed: false,
          language: 'pl',
          max_attempts: 2,
          score: 0,
          state: [{ word: ['a', 'c'], validated: ['C', 'X'] }],
          timestamp_start: '1234567890',
          word_length: 2,
        } as unknown as TGameRecord,
      };
      mockFetch.mockResolvedValue(createFetchResponse(true, data));

      const result = await getNextAttempt({
        guess: 'GUESS',
        session: 'session',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(
          /\/api\/frontend\/guess\?guess=GUESS&session=session/gi,
        ),
        {
          method: 'GET',
          signal: undefined,
        },
      );

      expect(result).toEqual({
        ...data,
        game: {
          ...data.game,
          state: [data?.game?.state[0], { word: ['', ''] }],
        },
      });
    });
    it('rejects', async () => {
      mockFetch.mockResolvedValue(createFetchResponse(false, 'Error'));
      await expect(
        getNextAttempt({
          guess: 'GUESS',
          session: 'session',
        }),
      ).rejects.toThrow('Error');
    });
  });

  describe('inflateGameState', () => {
    it('returns null when session is missing game object', () => {
      expect(inflateGameState({ session: 'abcd' })).toBeNull();
    });
  });
});
