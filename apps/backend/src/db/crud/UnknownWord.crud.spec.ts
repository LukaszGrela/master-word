import { after, before, beforeEach, describe, it } from 'mocha';
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
import { testConfig } from '../../test/testconfig';
import { getStartOfDay } from '@repo/utils/getStartOfDay';

describe('UnknownWord CRUD operations', () => {
  const date1 = new Date(1939, 8, 1, 0, 0, 0, 0);
  const date2 = new Date(1939, 8, 17, 0, 0, 0, 0);
  const date3 = new Date(1942, 8, 1, 0, 0, 0, 0);
  let ids: mongoose.Types.ObjectId[];

  before(async function () {
    console.log('readyState before():', mongoose.connection.readyState);
    await mongoose.connect(`mongodb://${testConfig.mongo.hostString}`);
    await UnknownWord.init();

  });
  beforeEach(async function () {
    console.log('readyState beforeEach():', mongoose.connection.readyState);
    await mongoose.connection.dropDatabase();

    await UnknownWord.init();
    await UnknownWord.create([
      {
        date: date1,
        words: [
          {
            language: 'pl',
            word: 'kiszk',
            length: 5,
          },
          {
            language: 'pl',
            word: 'tomek',
            length: 5,
          },
        ],
      },
      {
        date: date2,
        words: [
          {
            language: 'pl',
            word: 'maria',
            length: 5,
          },
          {
            language: 'pl',
            word: 'mosty',
            length: 5,
          },
        ],
      },
      {
        date: date3,
        words: [
          {
            language: 'pl',
            word: 'kramy',
            length: 5,
          },
          {
            language: 'pl',
            word: 'omary',
            length: 5,
          },
          {
            language: 'pl',
            word: 'rampy',
            length: 5,
          },
        ],
      },
    ]);
    ids = (await UnknownWord.find({}).sort('date').exec()).map((d) => d._id);
  });
  after(async function () {
    console.log('readyState before after():', mongoose.connection.readyState);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
  });

  describe('getAll', () => {
    it('returns list of entries', async () => {
      await UnknownWord.create({
        date: new Date(1943, 8, 1),
        words: [],
      });

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
        ['kiszk', 'tomek'],
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
        ['kiszk', 'tomek'],
      );
    });
    it('returns entry for given string id', async () => {
      const result = await getById(mongoose.connection, ids[1].toHexString());

      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['maria', 'mosty'],
      );
    });
    it('returns empty result when not match', async () => {
      const result = await getById(
        mongoose.connection,
        '75e81e8dc26982deac62cede',
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
        ['kiszk', 'tomek'],
      );

      const remaining = await UnknownWord.find({});
      assert.equal(remaining.length, 2);
    });
    it('removes entry for given string id', async () => {
      const result = await removeById(
        mongoose.connection,
        ids[1].toHexString(),
      );

      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['maria', 'mosty'],
      );

      const remaining = await UnknownWord.find({});
      assert.equal(remaining.length, 2);
    });
    it('removes nothing when not match', async () => {
      const result = await removeById(
        mongoose.connection,
        '75e81e8dc26982deac62cede',
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
        5,
      );

      assert.equal(result, null);
    });
    it('removes nothing when no word found', async () => {
      const result = await removeWordById(
        mongoose.connection,
        ids[1].toHexString(),
        'bubel',
        'pl',
        5,
      );

      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['maria', 'mosty'],
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
        5,
      );

      assert.notEqual(result, null);
      assert.deepEqual(
        result!.words.map(({ word }) => word),
        ['maria'],
      );

      // docs length not changed
      const remaining = await UnknownWord.find({});
      assert.equal(remaining.length, 3);
    });
    it('removes a historical document after its last word is removed', async () => {
      const id = ids[0].toHexString();

      const firstRemoval = await removeWordById(
        mongoose.connection,
        id,
        'kiszk',
        'pl',
      );
      assert.notEqual(firstRemoval, null);
      assert.deepEqual(
        firstRemoval!.words.map(({ word }) => word),
        ['tomek'],
      );

      const lastRemoval = await removeWordById(
        mongoose.connection,
        id,
        'tomek',
        'pl',
      );
      assert.equal(lastRemoval, null);
      assert.equal(await UnknownWord.findById(id).exec(), null);
    });
    it("keeps today's document after its last word is removed", async () => {
      const today = getStartOfDay();
      const doc = await UnknownWord.create({
        date: today,
        words: [{ language: 'pl', word: 'kiszk', length: 5 }],
      });

      const result = await removeWordById(
        mongoose.connection,
        doc._id,
        'kiszk',
        'pl',
      );

      assert.notEqual(result, null);
      assert.equal(result!.words.length, 0);
      assert.notEqual(await UnknownWord.findById(doc._id).exec(), null);
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
        },
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
