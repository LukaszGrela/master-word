import { afterEach, describe, it } from 'mocha';
import assert from 'node:assert';
import sinon from 'sinon';
import {
  calculateScore,
  ensureLoggedIn,
  isAuthorised,
  resetGameSession,
  validateWord,
} from './helpers';
import { Request, Response } from 'express';
describe('router/helpers', () => {
  describe('resetGameSession', () => {
    it('Resets the session', () => {
      const sandbox = sinon.createSandbox();
      sandbox.useFakeTimers({
        now: new Date(1939, 9, 1).getTime(),
        shouldClearNativeTimers: true,
        toFake: ['Date'],
      });
      const session = resetGameSession('pl', 'test');

      sandbox.restore();

      assert.deepEqual(session, {
        attempt: 0,
        finished: false,
        guessed: false,
        language: 'pl',
        max_attempts: 8,
        state: [],
        timestamp_start: '-954723600000',
        word: 'TEST',
        word_length: 4,
        score: 0,
      });
    });
  });

  describe('validateWord', () => {
    const correct = ['b', 'a', 'r', 'k', 'a'];
    const compareNone = ['s', 'e', 't', 'n', 'y'];
    const comparePartial = ['r', 'a', 'm', 'i', 'e'];
    const compareMatch = ['b', 'a', 'r', 'k', 'a'];

    it('Return validated fill with "C" for isGuessed true', () => {
      const result = validateWord(compareNone, correct, true);
      assert.deepEqual(result, {
        guessed: true,
        validated: ['C', 'C', 'C', 'C', 'C'],
      });
    });
    it('Return validated fill with "X" for isGuessed false, with no match', () => {
      const result = validateWord(compareNone, correct, false);
      assert.deepEqual(result, {
        guessed: false,
        validated: ['X', 'X', 'X', 'X', 'X'],
      });
    });
    it('Return validated fill with mix of "X","M" and "C" for partial match', () => {
      let result = validateWord(comparePartial, correct, false);
      assert.deepEqual(result, {
        guessed: false,
        validated: ['M', 'C', 'X', 'X', 'X'],
      });

      result = validateWord(compareMatch, correct, false);
      assert.deepEqual(result, {
        guessed: false,
        validated: ['C', 'C', 'C', 'C', 'C'],
      });
    });
  });

  describe('calculateScore', () => {
    /**
     * Score is made up from the attempts and time using following matrix, when overall score is the same then attempts are compared.
     * ```
     *                     +¼  +¾  +1½
     *       Time(s)   >60 >35 >15 <16
     * Attempts       ┏━━━┳━━━┳━━━┳━━━┓
     *     1,2,3      ┃ 3 ┃ 3¼┃ 3¾┃ 4½┃
     *                ┣━━━╋━━━╋━━━╋━━━┫
     *       4,5      ┃ 2 ┃ 2¼┃ 2¾┃ 3½┃
     *                ┣━━━╋━━━╋━━━╋━━━┫
     *       6,7      ┃ 1 ┃ 1¼┃ 1¾┃ 2½┃
     *                ┣━━━╋━━━╋━━━╋━━━┫
     *         8      ┃ ½ ┃ ¾ ┃ 1¼┃ 2 ┃
     *                ┗━━━┻━━━┻━━━┻━━━┛
     * ```
     */
    const times = [70, 60, 36, 35, 16, 15, 1];
    it('returns 0', () => {
      const result = calculateScore(false, 8, 1000);
      assert.equal(result, 0);
    });

    it('win in 8 attempts', () => {
      const result = times.map((time) => calculateScore(true, 8, time * 1000));
      assert.deepEqual(result, [0.5, 0.75, 0.75, 1.25, 1.25, 2, 2]);
    });

    it('win in 6 or 7 attempts', () => {
      const results = [1, 1.25, 1.25, 1.75, 1.75, 2.5, 2.5];
      let result = times.map((time) => calculateScore(true, 7, time * 1000));
      assert.deepEqual(result, results);
      result = times.map((time) => calculateScore(true, 6, time * 1000));
      assert.deepEqual(result, results);
    });
    it('win in 4 or 5 attempts', () => {
      const results = [2, 2.25, 2.25, 2.75, 2.75, 3.5, 3.5];
      let result = times.map((time) => calculateScore(true, 5, time * 1000));
      assert.deepEqual(result, results);
      result = times.map((time) => calculateScore(true, 4, time * 1000));
      assert.deepEqual(result, results);
    });
    it('win in 1, 2 or 3 attempts', () => {
      const results = [3, 3.25, 3.25, 3.75, 3.75, 4.5, 4.5];
      let result = times.map((time) => calculateScore(true, 3, time * 1000));
      assert.deepEqual(result, results);
      result = times.map((time) => calculateScore(true, 2, time * 1000));
      assert.deepEqual(result, results);
      result = times.map((time) => calculateScore(true, 1, time * 1000));
      assert.deepEqual(result, results);
    });
  });

  describe('isAuthorised', () => {
    const reqWithHeader = (header?: string): Request =>
      ({ header: () => header } as unknown as Request);

    afterEach(() => {
      delete process.env.ADMIN_API_TOKEN;
    });

    it('denies every request when no admin token is configured (fail closed)', () => {
      delete process.env.ADMIN_API_TOKEN;
      assert.equal(isAuthorised(reqWithHeader('Bearer anything')), false);
    });
    it('denies a request without an authorization header', () => {
      process.env.ADMIN_API_TOKEN = 'secret-token';
      assert.equal(isAuthorised(reqWithHeader(undefined)), false);
    });
    it('denies a non-bearer authorization scheme', () => {
      process.env.ADMIN_API_TOKEN = 'secret-token';
      assert.equal(isAuthorised(reqWithHeader('Basic secret-token')), false);
    });
    it('denies a non-matching bearer token', () => {
      process.env.ADMIN_API_TOKEN = 'secret-token';
      assert.equal(isAuthorised(reqWithHeader('Bearer wrong-token')), false);
    });
    it('authorises a matching bearer token', () => {
      process.env.ADMIN_API_TOKEN = 'secret-token';
      assert.equal(isAuthorised(reqWithHeader('Bearer secret-token')), true);
    });
  });

  describe('ensureLoggedIn', () => {
    afterEach(() => {
      delete process.env.ADMIN_API_TOKEN;
    });

    it('calls next for an authorised request', () => {
      process.env.ADMIN_API_TOKEN = 'secret-token';
      const handler = ensureLoggedIn();
      let called = false;
      handler(
        { header: () => 'Bearer secret-token' } as unknown as Request,
        {} as Response,
        () => {
          called = true;
        },
      );

      assert.equal(called, true);
    });

    it('responds 401 and does not call next for an unauthorised request', () => {
      const handler = ensureLoggedIn();
      let status = 0;
      let called = false;
      const res = {
        status(code: number) {
          status = code;
          return this;
        },
        json() {
          return this;
        },
      } as unknown as Response;

      handler(
        { header: () => undefined } as unknown as Request,
        res,
        () => {
          called = true;
        },
      );

      assert.equal(called, false);
      assert.equal(status, 401);
    });
  });
});
