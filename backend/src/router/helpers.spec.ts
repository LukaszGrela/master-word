import { describe, it } from 'node:test';
import assert from 'node:assert';
import sinon from 'sinon';
import { resetGameSession } from './helpers';
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
});
