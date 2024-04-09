import { describe, it, expect } from 'vitest';
import { createGameState, guardTErrorResponse, toErrorResponse } from './utils';

describe('api', () => {
  describe('utils', () => {
    describe('createGameState', () => {
      it('returns game state', () => {
        const result = createGameState(8, 5);

        expect(result.length).toEqual(8);
        expect(result[0].word.length).toEqual(5);
      });
    });

    describe('toErrorResponse', () => {
      it('converts Error', () => {
        expect(toErrorResponse(new Error('Boom'))).toEqual({
          code: -1,
          error: 'Boom',
          details: 'Error',
        });
      });
      it('returns TErrorResponse unchanged', () => {
        const errorResponse = {
          code: 1,
          error: 'Test',
        };
        expect(toErrorResponse(errorResponse)).toEqual(errorResponse);
      });
    });

    describe('guardTErrorResponse', () => {
      it('returns false', () => {
        expect(guardTErrorResponse(undefined)).toBe(false);
        expect(guardTErrorResponse(null)).toBe(false);
        expect(guardTErrorResponse({})).toBe(false);
        expect(guardTErrorResponse(new Error())).toBe(false);
        expect(guardTErrorResponse({ error: 'Not enough' })).toBe(false);
        expect(guardTErrorResponse({ code: 'Not enough' })).toBe(false);
      });
      it('returns true', () => {
        expect(guardTErrorResponse({ code: 2, error: 'Invalid session' })).toBe(
          true,
        );
        expect(
          guardTErrorResponse({
            code: 6,
            error: 'Incorrect word',
            details: 'CINDY',
          }),
        ).toBe(true);
      });
    });
  });
});
