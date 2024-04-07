import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadTranslation, replaceSubstituteMap } from './loadTranslation';
import { createFetchResponse } from '../../__tests__/helpers';

const originalFetch = global.fetch;

describe('i18n', () => {
  describe('helpers', () => {
    const consoleMock = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    let mockFetch = vi.fn();
    beforeEach(() => {
      mockFetch = vi.fn();
      global.fetch = mockFetch;
    });
    afterEach(() => {
      vi.clearAllMocks();
      global.fetch = originalFetch;
      consoleMock.mockReset();
    });

    describe('loadTranslation', () => {
      it('throws error', async () => {
        // MOCK FETCH FIRST
        mockFetch.mockRejectedValue(
          createFetchResponse(false, { code: 404, message: 'Not found' }),
        );

        await expect(loadTranslation('pl')).rejects.toThrow(
          'Failed to load translation for pl language.',
        );
      });
      it('responds with error', async () => {
        // MOCK FETCH FIRST
        mockFetch.mockResolvedValue(
          createFetchResponse(false, { code: 404, message: 'Not found' }),
        );

        await expect(loadTranslation('pl')).rejects.toThrow(
          'Failed to load translation for pl language.',
        );
      });
    });

    describe('replaceSubstituteMap', () => {
      it('uses actionCallback', () => {
        const actionCallback = vi
          .fn()
          .mockImplementation((input: string, actions: string[]): string => {
            return actions.reduce((transformed, action) => {
              if (action === 'actionOne') {
                return transformed.toLowerCase();
              }
              if (action === 'actionTwo') {
                return transformed.split('').join('-');
              }
              return transformed;
            }, input);
          });
        const result = replaceSubstituteMap(
          'This is a text {test actionOne actionTwo}',
          { test: 'TEST' },
          actionCallback,
        );

        expect(result).toBe('This is a text t-e-s-t');
      });
      it('no subsitute', () => {
        const actionCallback = vi
          .fn()
          .mockImplementation((input: string, actions: string[]): string => {
            return actions.reduce((transformed, action) => {
              if (action === 'actionOne') {
                return transformed.toLowerCase();
              }
              if (action === 'actionTwo') {
                return transformed.split('').join('-');
              }
              return transformed;
            }, input);
          });
        const result = replaceSubstituteMap(
          'This is a text {test actionOne actionTwo}',
          { missing: 'TEST' },
          actionCallback,
        );

        expect(result).toBe('This is a text {test actionOne actionTwo}');

        expect(consoleMock).toHaveBeenLastCalledWith(
          "[i18n.replaceSubstituteMap] Param not found in the substitute map: 'test', actions: 'actionOne,actionTwo'.",
        );
      });
    });
  });
});
