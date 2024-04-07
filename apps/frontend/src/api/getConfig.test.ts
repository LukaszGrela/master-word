import { IConfigEntry } from '@repo/backend-types/db';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getConfig } from './getConfig';
import { createFetchResponse } from '../__tests__/helpers';

const originalFetch = global.fetch;

describe('api', () => {
  describe('getConfig', () => {
    const mockFetch = vi.fn();
    beforeEach(() => {
      global.fetch = mockFetch;
    });
    afterEach(() => {
      vi.clearAllMocks();
      global.fetch = originalFetch;
    });
    it('resolves', async () => {
      const data: IConfigEntry = {
        appId: [],
        key: 'enabledAttempts',
        value: [6, 8],
      };
      mockFetch.mockResolvedValue(createFetchResponse(true, data));

      const result = await getConfig({});

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching('/api/frontend/config'),
        {
          method: 'GET',
          signal: undefined,
        },
      );

      expect(result).toEqual(data);
    });
    it('rejects', async () => {
      mockFetch.mockResolvedValue(createFetchResponse(false, 'Error'));
      await expect(getConfig({})).rejects.toThrow('Error');
    });
  });
});
