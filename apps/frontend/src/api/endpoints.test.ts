import { describe, it, expect } from 'vitest';
import {
  apiConfig,
  apiGameSession,
  apiInit,
  apiNextAttempt,
} from './endpoints';

describe('api', () => {
  describe('endpoints', () => {
    describe('apiInit', () => {
      it('returns init endpoint with required query', () => {
        const result = apiInit('pl');

        expect(result).toMatch(/\/api\/frontend\/init\?language=pl$/gi);
      });
      it('returns init endpoint with all parameters', () => {
        const result = apiInit('pl', 'session', 8, 5);

        expect(result).toMatch(/\/api\/frontend\/init\?language=pl/gi);
        expect(result).toMatch(/&session=session/gi);
        expect(result).toMatch(/&maxAttempts=8/gi);
        expect(result).toMatch(/&wordLength=5/gi);
      });
    });
    describe('apiNextAttempt', () => {
      it('returns guess endpoint', () => {
        const result = apiNextAttempt('GUESS', 'session');

        expect(result).toMatch(
          /\/api\/frontend\/guess\?guess=GUESS&session=session/gi,
        );
      });
    });
    describe('apiGameSession', () => {
      it('returns game session endpoint', () => {
        const result = apiGameSession('session');

        expect(result).toMatch(
          /\/api\/frontend\/game-session\?session=session/gi,
        );
      });
    });
    describe('apiConfig', () => {
      it('returns config endpoint', () => {
        const result = apiConfig();

        expect(result).toMatch(/\/api\/frontend\/config$/gi);
      });
    });
  });
});
