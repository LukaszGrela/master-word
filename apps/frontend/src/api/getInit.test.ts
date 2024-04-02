import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TGameRecord, TGameSession } from '@repo/backend-types';
import { getInit } from './getInit';

const createFetchResponse = (ok: boolean, response: unknown) => ({
  ok,
  json: () => Promise.resolve(response),
  text: () => Promise.resolve(JSON.stringify(response)),
});
const originalFetch = global.fetch;

describe('api', () => {
  describe('getInit', () => {
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
      };
      mockFetch.mockResolvedValue(createFetchResponse(true, data));

      const result = await getInit({
        language: 'pl',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/frontend\/init\?language=pl/gi),
        {
          method: 'GET',
          signal: undefined,
        },
      );

      expect(result).toEqual(data);
    });
    it('resolves and inflates game', async () => {
      const data: TGameSession = {
        session: 'session',
        game: {
          attempt: 0,
          finished: false,
          guessed: false,
          language: 'pl',
          max_attempts: 2,
          score: 0,
          state: [],
          timestamp_start: '1234567890',
          word_length: 2,
        } as unknown as TGameRecord,
      };
      mockFetch.mockResolvedValue(createFetchResponse(true, data));

      const result = await getInit({
        language: 'pl',
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/frontend\/init\?language=pl/gi),
        {
          method: 'GET',
          signal: undefined,
        },
      );

      expect(result).toEqual({
        ...data,
        game: {
          ...data.game,
          state: [{ word: ['', ''] }, { word: ['', ''] }],
        },
      });
    });
    it('rejects', async () => {
      mockFetch.mockResolvedValue(createFetchResponse(false, 'Error'));
      await expect(
        getInit({
          language: 'pl',
        }),
      ).rejects.toThrow('Error');
    });
  });
});
