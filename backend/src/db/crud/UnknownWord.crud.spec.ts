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
  removeWordById,
} from '../crud/UnknownWord.crud';
import mongoose from 'mongoose';
import { getStartOfDay } from '../../utils/datetime';

describe('UnknownWord CRUD operations', () => {
  const date1 = new Date(1939, 8, 1, 0, 0, 0, 0);
  const date2 = new Date(1939, 8, 17, 0, 0, 0, 0);
  const date3 = new Date(1942, 8, 1, 0, 0, 0, 0);
  let ids: mongoose.Types.ObjectId[];
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
    ids = (await UnknownWord.find({}).sort('date').exec()).map((d) => d._id);
  });
  describe('getAll', () => {
    it('returns list of entries', async () => {
      const list = await getAll(mongoose.connection);

      assert.equal(list.length, 3);
    });
  });

  describe('getByDate', () => {
    it('returns entry for given date', async () => {
      const result = await getByDate(mongoose.connection, date1);

      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['kiszk', 'tomek']
      );
    });
    it('returns empty result when not matche', async () => {
      const result = await getByDate(mongoose.connection, new Date());

      assert.equal(result, null);
    });
  });

  describe('getById', () => {
    it('returns entry for given object id', async () => {
      const result = await getById(mongoose.connection, ids[0]);

      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['kiszk', 'tomek']
      );
    });
    it('returns entry for given string id', async () => {
      const result = await getById(mongoose.connection, ids[1].toHexString());

      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['maria', 'mosty']
      );
    });
    it('returns empty result when not match', async () => {
      const result = await getById(
        mongoose.connection,
        '75e81e8dc26982deac62cede'
      );

      assert.equal(result, null);
    });
  });

  describe('removeById', () => {
    it('removes entry for given object id', async () => {
      const result = await removeById(mongoose.connection, ids[0]);
      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['kiszk', 'tomek']
      );

      const remaining = await UnknownWord.find({});
      assert.equal(remaining.length, 2);
    });
    it('removes entry for given string id', async () => {
      const result = await removeById(
        mongoose.connection,
        ids[1].toHexString()
      );

      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['maria', 'mosty']
      );

      const remaining = await UnknownWord.find({});
      assert.equal(remaining.length, 2);
    });
    it('removes nothing when not match', async () => {
      const result = await removeById(
        mongoose.connection,
        '75e81e8dc26982deac62cede'
      );

      assert.equal(result, null);
      const remaining = await UnknownWord.find({});
      assert.equal(remaining.length, 3);
    });
  });

  describe('removeWordById', () => {
    it('returns null when id not found', async () => {
      const result = await removeWordById(
        mongoose.connection,
        '75e81e8dc26982deac62cede',
        'bubel',
        'pl',
        5
      );

      assert.equal(result, null);
    });
    it('removes nothing when no word found', async () => {
      const result = await removeWordById(
        mongoose.connection,
        ids[1].toHexString(),
        'bubel',
        'pl',
        5
      );

      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['maria', 'mosty']
      );

      // not changed
      const remaining = await UnknownWord.find({});
      assert.equal(remaining.length, 3);
    });
    it('removes matched word(s)', async () => {
      const result = await removeWordById(
        mongoose.connection,
        ids[1].toHexString(),
        'mosty',
        'pl',
        5
      );

      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['maria']
      );

      // docs length not changed
      const remaining = await UnknownWord.find({});
      assert.equal(remaining.length, 3);
    });
  });

  describe('purge', () => {
    it('removes all documents', async () => {
      const result = await purge(mongoose.connection);
      assert.equal(result.deletedCount, 3);
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
    it('adds an existing in other days entry word to todays existing entry', async () => {
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

      await addUnknownWord(mongoose.connection, 'MOSTY', 'pl');

      sandbox.restore();

      const doc = await UnknownWord.findOne({ date });
      assert.equal(doc!.words.length, 3);
    });
  });
});
