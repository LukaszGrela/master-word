import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import sinon from 'sinon';
import { UnknownWord } from '../models/UnknownWord';
import {
  addUnknownWord,
  getAll,
  getByDate,
  getById,
  purge,
  removeById,
} from '../crud/UnknownWord.crud';
import mongoose from 'mongoose';
import { getStartOfDay } from '../../utils/datetime';

describe('UnknownWord CRUD operations', () => {
  const date1 = new Date(1939, 8, 1, 0, 0, 0, 0);
  const date2 = new Date(1939, 8, 17, 0, 0, 0, 0);
  const date3 = new Date(1942, 8, 1, 0, 0, 0, 0);
  beforeEach(async () => {
    await UnknownWord.init();
    await UnknownWord.create([
      {
        date: date1,
        words: [
          {
            language: 'pl',
            word: 'kiszk',
          },
          {
            language: 'pl',
            word: 'tomek',
          },
        ],
      },
      {
        date: date2,
        words: [
          {
            language: 'pl',
            word: 'maria',
          },
          {
            language: 'pl',
            word: 'mosty',
          },
        ],
      },
      {
        date: date3,
        words: [
          {
            language: 'pl',
            word: 'kramy',
          },
          {
            language: 'pl',
            word: 'omary',
          },
          {
            language: 'pl',
            word: 'rampy',
          },
        ],
      },
    ]);
  });
  describe('getAll', () => {
    it('returns list of entries', async () => {
      const list = await getAll(mongoose.connection);

      assert.equal(list.length, 3);
    });
  });

  describe('addUnknownWord', () => {
    it('adds a new word to todays new entry', async () => {
      const sandbox = sinon.createSandbox();
      sandbox.useFakeTimers({
        now: new Date(1944, 7, 1, 0, 0, 0, 0).getTime(),
        shouldClearNativeTimers: true,
        toFake: ['Date'],
      });

      const date = new Date();
      const before = await UnknownWord.findOne({ date });
      assert.equal(before, null);

      await addUnknownWord(mongoose.connection, 'balony', 'pl', 6);

      const doc = await UnknownWord.findOne({ date });
      assert.notEqual(doc, null);

      sandbox.restore();

      // drop id
      const { __v, _id: a, ...rest } = doc!.toJSON() as any;
      const { _id: b, ...word } = rest.words[0];
      assert.deepEqual(
        { ...rest, words: [word] },
        {
          date: date,
          words: [
            {
              language: 'pl',
              word: 'balony',
              length: 6,
            },
          ],
        }
      );
    });
    it('adds a new word to todays existing entry', async () => {
      const sandbox = sinon.createSandbox();
      sandbox.useFakeTimers({
        now: date3.getTime(),
        shouldClearNativeTimers: true,
        toFake: ['Date'],
      });

      // today
      const date = new Date();
      const before = await UnknownWord.findOne({ date });
      assert.equal(before!.words.length, 3);

      await addUnknownWord(mongoose.connection, 'larwa', 'pl');

      sandbox.restore();

      const doc = await UnknownWord.findOne({ date });
      assert.equal(doc!.words.length, 4);
    });
    it('adds an existing word to todays existing entry', async () => {
      const sandbox = sinon.createSandbox();
      sandbox.useFakeTimers({
        now: date3.getTime(),
        shouldClearNativeTimers: true,
        toFake: ['Date'],
      });

      // today
      const date = new Date();
      const before = await UnknownWord.findOne({ date });
      assert.equal(before!.words.length, 3);

      await addUnknownWord(mongoose.connection, 'kramy', 'pl');

      sandbox.restore();

      const doc = await UnknownWord.findOne({ date });
      assert.equal(doc!.words.length, 3);
    });
  });
});
