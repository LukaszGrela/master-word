import mongoose from 'mongoose';
import { describe, it } from 'mocha';
import assert from 'node:assert';
import { Dictionary, getModelForConnection } from './Dictionary';
import { clearDB, rebuildIndexes, testConfig } from '../../test/testconfig';

describe('src/db/models/Dictionary.ts', () => {
  describe('Dictionary model', () => {
    before(async function () {
      console.log(
        '[Dictionary.ts]: readyState before():',
        mongoose.connection.readyState,
      );
      await mongoose.connect(`mongodb://${testConfig.mongo.hostString}`);
      await Dictionary.init();
    });
    beforeEach(async function () {
      console.log('[Dictionary.ts]: readyState beforeEach():', mongoose.connection.readyState);
      await mongoose.connection.dropDatabase();
      await Dictionary.init();
    });
    after(async function () {
      console.log('[Dictionary.ts]: readyState before after():', mongoose.connection.readyState);
      if (mongoose.connection.readyState === 1) {
        await mongoose.connection.dropDatabase();
      }
      await mongoose.disconnect();
    });

    it('creates dictionary entry with required fields', async () => {
      // random letter a - 097, z - 122
      const letters = 122 - 97;
      const charCode = 97 + Math.floor(Math.random() * letters);

      const a = new Dictionary({
        language: 'pl',
        length: 5,
        letter: String.fromCharCode(charCode),
      });

      assert.equal(a.isNew, true);

      await a.save();

      assert.equal(a.isNew, false);
    });
    it('creates dictionary entry with all fields', async () => {
      const a = new Dictionary({
        language: 'pl',
        length: 5,
        letter: 'a',
        word: ['album'],
      });
      console.log('[Dictionary.ts]: a', a);
      assert.equal(a.isNew, true);

      await a.save();

      console.log('a.save', a);
      assert.equal(a.isNew, false);
    });

    it('requires language property', async () => {
      let error;
      try {
        await Dictionary.create({
          length: 5,
          letter: 'b',
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
    });
    it('requires correct language property', async () => {
      let error;
      try {
        await Dictionary.create({
          language: 'xxx',
          length: 5,
          letter: 'b',
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
    });
    it('requires length property', async () => {
      let error;
      try {
        await Dictionary.create({
          language: 'pl',
          letter: 'b',
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
    });
    it('requires letter property', async () => {
      let error;
      try {
        await Dictionary.create({
          language: 'pl',
          length: 5,
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
    });
    it('requires letter property to have correct length of 1', async () => {
      let error;
      try {
        await Dictionary.create({
          language: 'pl',
          letter: 'abc',
          length: 5,
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
    });
    it('requires correct word in words property', async () => {
      let error;
      try {
        // empty word
        await Dictionary.create({
          language: 'pl',
          length: 5,
          letter: 'x',
          words: [''],
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
      try {
        error = undefined;
        // invalid length min
        await Dictionary.create({
          language: 'pl',
          length: 5,
          letter: 'y',
          words: ['yhy'],
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
      try {
        error = undefined;
        // invalid length max
        await Dictionary.create({
          language: 'pl',
          length: 5,
          letter: 'z',
          words: ['zebrami'],
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
      try {
        error = undefined;
        // invalid word, not match letter
        await Dictionary.create({
          language: 'pl',
          length: 5,
          letter: 'a',
          words: ['album', 'barbi'],
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
    });
    it('words must be unique', async () => {
      let error;

      try {
        // empty word
        await Dictionary.create({
          language: 'pl',
          length: 5,
          letter: 'a',
          words: ['altan', 'album', 'altan'],
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
    });
    it('dictionary documents needs to be unique', async () => {
      let error;
      try {
        await Dictionary.init();
        await Dictionary.create([
          {
            language: 'pl',
            length: 5,
            letter: 'a',
            words: ['altan', 'album'],
          },
          {
            language: 'en',
            length: 5,
            letter: 'a',
            words: ['altar', 'anger'],
          },
        ]);

        await Dictionary.create({
          language: 'pl',
          length: 5,
          letter: 'a',
          words: ['armia', 'aster'],
        });
      } catch (e) {
        error = e;
      }
      assert.notEqual(error, undefined);
    });
    /*
  describe('getModelForConnection', () => {
    it('creates dictionary entry with all fields', async () => {
      const DictionaryModel = getModelForConnection(mongoose.connection);
      const a = new DictionaryModel({
        language: 'pl',
        length: 5,
        letter: 'a',
        word: ['album'],
      });

      assert.equal(a.isNew, true);

      await a.save();

      assert.equal(a.isNew, false);
    });
  });
  */
  });
});
