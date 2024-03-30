import mongoose, { AnyKeys } from 'mongoose';
import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import {
  TGameSessionFinished,
  TGameSession,
  TGameRecord,
  TGameStep,
  TScore,
} from '@repo/backend-types';
import { GameSession, getModelForConnection } from './GameSession';
import { createDictionaryDevConnection } from '../connect';

describe('GameSession model', () => {
  beforeEach(async () => {
    await GameSession.init();
  });
  describe('failures', () => {
    it('missing session', async () => {
      let error: Error | undefined;
      try {
        await GameSession.create({});
      } catch (e) {
        error = e as Error;
      }

      assert.notEqual(error, undefined);
      assert.match(`${error?.message}`, /Path `session` is required/);
    });
    it('attempt > 0 require state to contain entries', async () => {
      let error: Error | undefined;
      try {
        const session = await GameSession.create<TGameSession>({
          session: 'ed28b702-5205-43bc-97a4-39a09a647f20',
          game: {
            language: 'fr',
            max_attempts: 8,
            attempt: 0,
            word: 'merci',
            word_length: 5,
            state: [],
            finished: false,
            guessed: false,
            score: 0,
            timestamp_start: '1711623239613',
          },
        });

        // increase session
        if (session.game) {
          session.game.attempt = 1;
        }
        await session.save();
      } catch (e) {
        error = e as Error;
      }

      assert.notEqual(error, undefined);
      assert.match(
        `${error?.message}`,
        /Path state must not be empty when attempt greater than 0./,
      );
    });
    it('State must contain valid entries - field validated', async () => {
      let error: Error | undefined;
      try {
        const session = await GameSession.create<TGameSession>({
          session: 'ed28b702-5205-43bc-97a4-39a09a647f20',
          game: {
            language: 'fr',
            max_attempts: 8,
            attempt: 0,
            word: 'merci',
            word_length: 5,
            state: [],
            finished: false,
            guessed: false,
            score: 0,
            timestamp_start: '1711623239613',
          },
        });

        // increase session
        if (session.game) {
          session.game.attempt = 1;
          session.game.state.push({} as TGameStep);
        }
        await session.save();
      } catch (e) {
        error = e as Error;
      }

      assert.notEqual(error, undefined);
      assert.match(`${error?.message}`, /Path `validated` is required./);
    });
    it('State must contain valid entries - field word', async () => {
      let error: Error | undefined;
      try {
        const session = await GameSession.create<TGameSession>({
          session: 'ed28b702-5205-43bc-97a4-39a09a647f20',
          game: {
            language: 'fr',
            max_attempts: 8,
            attempt: 0,
            word: 'merci',
            word_length: 5,
            state: [],
            finished: false,
            guessed: false,
            score: 0,
            timestamp_start: '1711623239613',
          },
        });

        // increase session
        if (session.game) {
          session.game.attempt = 1;
          session.game.state.push({
            validated: ['X', 'X', 'X', 'X', 'X'],
          } as unknown as TGameStep);
        }
        await session.save();
      } catch (e) {
        error = e as Error;
      }

      assert.notEqual(error, undefined);
      assert.match(`${error?.message}`, /Path word must not be empty./);
    });
    it('State must contain valid entries - field validated (non TValidationChar)', async () => {
      let error: Error | undefined;
      try {
        const session = await GameSession.create<TGameSession>({
          session: 'ed28b702-5205-43bc-97a4-39a09a647f20',
          game: {
            language: 'fr',
            max_attempts: 8,
            attempt: 0,
            word: 'merci',
            word_length: 5,
            state: [],
            finished: false,
            guessed: false,
            score: 0,
            timestamp_start: '1711623239613',
          },
        });

        // increase session
        if (session.game) {
          session.game.attempt = 1;
          session.game.state.push({
            word: ['m', 'e', 'r', 'c', 'i'],
            validated: ['m', 'e', 'r', 'c', 'i'],
          } as unknown as TGameStep);
        }
        await session.save();
      } catch (e) {
        error = e as Error;
      }

      assert.notEqual(error, undefined);
      assert.match(
        `${error?.message}`,
        /Cast to ValidationChar failed for value/,
      );
    });
    it('Require timestamp_finish for finished game', async () => {
      let error: Error | undefined;
      try {
        const session = await GameSession.create<TGameSession>({
          session: 'ed28b702-5205-43bc-97a4-39a09a647f20',
          game: {
            language: 'fr',
            max_attempts: 8,
            attempt: 0,
            word: 'merci',
            word_length: 5,
            state: [],
            finished: false,
            guessed: false,
            score: 0,
            timestamp_start: '1711623239613',
          },
        });

        // increase session
        if (session.game) {
          session.game.finished = true;
          session.game.attempt = 1;
          session.game.state.push({
            word: ['m', 'e', 'r', 'c', 'i'],
            validated: ['X', 'X', 'X', 'X', 'X'],
          } as unknown as TGameStep);
        }
        await session.save();
      } catch (e) {
        error = e as Error;
      }

      assert.notEqual(error, undefined);
      assert.match(`${error?.message}`, /Path `timestamp_finish` is required./);
    });
    it('fails to add document with the same session id', async () => {
      let error: Error | undefined;
      try {
        let doc = await GameSession.create<TGameSession>({
          session: 'ed28b702-5205-43bc-97a4-39a09a647f20',
          game: {
            language: 'fr',
            max_attempts: 8,
            attempt: 0,
            word: 'merci',
            word_length: 5,
            state: [],
            finished: false,
            guessed: false,
            score: 0,
            timestamp_start: '1711623239613',
          },
        });
        // try to save the same
        doc = await GameSession.create<TGameSession>({
          session: 'ed28b702-5205-43bc-97a4-39a09a647f20',
          game: {
            language: 'fr',
            max_attempts: 8,
            attempt: 0,
            word: 'merci',
            word_length: 5,
            state: [],
            finished: false,
            guessed: false,
            score: 0,
            timestamp_start: '1711623239613',
          },
        });
      } catch (e) {
        error = e as Error;
      }

      assert.notEqual(error, undefined);
      assert.match(
        `${error?.message}`,
        /dup key: { session: "ed28b702-5205-43bc-97a4-39a09a647f20" }/,
      );
    });
    it('once highest set it requires all props', async () => {
      let error: Error | undefined;
      try {
        // uncomment when type of highest will be adjusted
        let doc = await GameSession.create(
          /*<TGameSession>*/ {
            session: 'ed28b702-5205-43bc-97a4-39a09a647f20',
            game: {
              language: 'fr',
              max_attempts: 8,
              attempt: 1,
              word: 'merci',
              word_length: 5,
              state: [
                {
                  word: ['m', 'a', 'r', 'd', 'i'],
                  validated: ['C', 'X', 'C', 'X', 'C'],
                },
              ],
              finished: false,
              guessed: false,
              score: 0,
              timestamp_start: '1711623239613',
            },
          },
        );

        doc.highest = {
          'fr:5': {} as TScore,
        };

        await doc.save();
      } catch (e) {
        error = e as Error;
      }

      assert.notEqual(error, undefined);
      assert.match(
        `${error?.message}`,
        /GameSession validation failed: highest.fr:5.attempts: Path `attempts` is required., highest.fr:5.timeMs: Path `timeMs` is required., highest.fr:5.score: Path `score` is required./,
      );
    });
  });
  describe('success', () => {
    it('initiates the game', async () => {
      let error: Error | undefined;
      try {
        const session = new GameSession({
          session: 'ed28b702-5205-43bc-97a4-39a09a647f20',
        });

        await session.save();

        const game: TGameRecord = {
          attempt: 0,
          finished: false,
          guessed: false,
          language: 'pl',
          max_attempts: 8,
          score: 0,
          state: [],
          timestamp_start: '1711623239613',
          word_length: 5,
          word: 'robak',
        };

        session.game = game;

        await session.save();
        if (session.game) {
          // next attempt
          session.game.state.push({
            word: ['m', 'a', 'r', 'd', 'i'],
            validated: ['C', 'X', 'C', 'X', 'C'],
          });
          session.game.attempt = 1;

          await session.save();

          // next attempt
          session.game.state.push({
            word: ['m', 'e', 'r', 'c', 'i'],
            validated: ['C', 'C', 'C', 'C', 'C'],
          });
          session.game.attempt = 2;

          (session.game as unknown as TGameSessionFinished).finished = true;

          (session.game as unknown as TGameSessionFinished).timestamp_finish =
            '1711623219613';

          session.game.guessed = true;

          await session.save();
        }
      } catch (e) {
        error = e as Error;
      }

      assert.equal(error, undefined);
    });
  });
  describe('getModelForConnection', () => {
    it('initiates session', async () => {
      const GameSessionModel = getModelForConnection(mongoose.connection);
      const sessionModel = new GameSessionModel({
        session: 'session-abcd',
      });

      assert.equal(sessionModel.isNew, true);
      await sessionModel.save();
      assert.equal(sessionModel.isNew, false);
    });
    it('initiates  with game object', async () => {
      const connection = await createDictionaryDevConnection();
      const GameSessionModel = getModelForConnection(connection);
      const sessionModel = new GameSessionModel({
        session: 'ed28b702-5205-43bc-97a4-39a09a647f20',
        game: {
          language: 'fr',
          max_attempts: 8,
          attempt: 0,
          word: 'merci',
          word_length: 5,
          state: [],
          finished: false,
          guessed: false,
          score: 0,
          timestamp_start: '1711623239613',
        },
      });

      assert.equal(sessionModel.isNew, true);
      await sessionModel.save();
      assert.equal(sessionModel.isNew, false);
      await connection.close();
    });
  });
});
