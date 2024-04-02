import { describe, it, expect } from 'vitest';
import { createGameState } from './utils';

describe('api', () => {
  describe('utils', () => {
    describe('createGameState', () => {
      it('returns game state', () => {
        const result = createGameState(8, 5);

        expect(result.length).toEqual(8);
        expect(result[0].word.length).toEqual(5);
      });
    });
  });
});
