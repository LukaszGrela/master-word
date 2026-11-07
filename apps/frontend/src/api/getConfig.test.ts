import { IConfigEntry } from '@repo/backend-types/db';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { getConfig } from './getConfig';
import { createFetchMock, createFetchResponse } from '../__tests__/helpers';

describe('api', () => {
  describe('getConfig', () => {
    const mockFetch = createFetchMock();
    beforeEach(() => {
      vi.stubGlobal('fetch', mockFetch);
    });
    afterEach(() => {
      vi.clearAllMocks();
      vi.unstubAllGlobals();
    });
    it('resolves', async () => {
      const data: IConfigEntry = {
        appId: [],
        key: 'enabledAttempts',
        value: [6, 8],
      };
      mockFetch.mockResolvedValue(createFetchResponse(true, data));

      const result = await getConfig({});

      expect(mockFetch).toHaveBeenCalledWith(
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
