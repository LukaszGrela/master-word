import { describe, it } from 'node:test';
import assert from 'node:assert';
import sinon from 'sinon';
import {
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

  describe('isAuthorised', () => {
    it('returns true for authenticated request', () => {
      assert.equal(isAuthorised({} as Request, {} as Response), true);
    });
    it.todo('returns false for unauthorised user');
  });

  describe('ensureLoggedIn', () => {
    it('calls next for authorised user', () => {
      const handler = ensureLoggedIn();
      let called = false;
      handler({} as Request, {} as Response, () => {
        called = true;
      });

      assert.equal(called, true);
    });
    it.todo('prevents unauthorised user request');
  });
});
