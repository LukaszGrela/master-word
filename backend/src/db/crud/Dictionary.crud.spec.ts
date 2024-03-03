import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import sinon from 'sinon';
import { Dictionary } from '../models/Dictionary';
import {
  addManyWords,
  addWord,
  countWords,
  deleteWord,
  getAlphabet,
  getRandomWord,
  updateWord,
} from './Dictionary.crud';
import { TSupportedLanguages } from '../../types';

describe('Dictionary CRUD operations', () => {
  beforeEach(async () => {
    await Dictionary.init();
    await Dictionary.create([
      {
        language: 'pl',
        length: 5,
        letter: 'a',
        words: ['album', 'altan'],
      },
      {
        language: 'pl',
        length: 5,
        letter: 'b',
        words: ['baton', 'brama'],
      },
      {
        language: 'pl',
        length: 5,
        letter: 'c',
        words: ['czart', 'człek'],
      },
      {
        language: 'en',
        length: 5,
        letter: 'a',
        words: ['altar', 'anger'],
      },
      {
        language: 'en',
        length: 5,
        letter: 'j',
        words: ['james', 'jelly'],
      },
    ]);
  });

  describe('getAlphabet', () => {
    it('returns correct alphabet list', async () => {
      const enAbc = await getAlphabet('en');

      assert.deepEqual(enAbc.sort(), ['a', 'j']);

      const plAbc = await getAlphabet();
      assert.deepEqual(plAbc, ['a', 'b', 'c']);
    });
    it('returns empty list when no match', async () => {
      const xxAbc = await getAlphabet('pl', 6);
      assert.equal(xxAbc.length, 0);
    });
  });
  describe('getRandomWord', () => {
    it('Returns random word', async () => {
      const stub = sinon.stub(Math, 'random').returns(0);
      const enWord = await getRandomWord('en');
      assert.equal(enWord, 'altar');

      const plWord = await getRandomWord();
      assert.equal(plWord, 'album');
      stub.restore();
    });
    it('returns null when no match', async () => {
      const xxWord = await getRandomWord('pl', 6);
      assert.equal(xxWord, null);
    });
  });
  describe('addWord', async () => {
    it('fails on invalid length argument', () => {
      assert.rejects(() => addWord('fail', 'en', 0), {
        message: 'addWord: the length argument must not be 0.',
      });
    });
    it('fails on invalid word argument - empty', () => {
      assert.rejects(() => addWord('', 'en', 5), {
        message: 'addWord: the word argument must not be empty.',
      });
    });
    it('fails on invalid word argument - length', () => {
      assert.rejects(() => addWord('long', 'en', 5), {
        message: `addWord: the word value must have length as declared by "length" argument (4 != 5).`,
      });
    });
    it('adds new word to new document', async () => {
      const config = {
        letter: 'x',
        length: 5,
        language: 'en' as TSupportedLanguages,
      };
      const words = await Dictionary.findOne(config);
      assert.equal(words, null);

      const doc = await addWord('xenon', config.language, config.length);

      // drop id
      const { __v, _id, ...rest } = doc.toJSON() as any;
      assert.deepEqual(rest, {
        ...config,
        words: ['xenon'],
      });
    });
    it('adds new word to existing document', async () => {
      const config = {
        letter: 'b',
        length: 5,
        language: 'pl' as TSupportedLanguages,
      };

      const doc = await addWord('bigos', config.language, config.length);

      // drop id
      const { __v, _id, ...rest } = doc.toJSON() as any;
      assert.deepEqual(rest, {
        ...config,
        words: ['baton', 'bigos', 'brama'],
      });
    });
  });
  describe('countWords', () => {
    it('returns proper word count', async () => {
      assert.equal(await countWords(), 6);
      assert.equal(await countWords('en'), 4);
    });
    it('returns 0 for non existing document', async () => {
      assert.equal(await countWords('en', 6), 0);
    });
  });
  describe('deleteWord', () => {
    it('fails on invalid length argument', () => {
      assert.rejects(() => deleteWord('fail', 'en', 0), {
        message: 'deleteWord: the length argument must not be 0.',
      });
    });
    it('fails on invalid word argument - empty', () => {
      assert.rejects(() => deleteWord('', 'en', 5), {
        message: 'deleteWord: the word argument must not be empty.',
      });
    });
    it('fails on invalid word argument - length', () => {
      assert.rejects(() => deleteWord('long', 'en', 5), {
        message: `deleteWord: the word value must have length as declared by "length" argument (4 != 5).`,
      });
    });
    it('removes word', async () => {
      const config = {
        letter: 'c',
        length: 5,
        language: 'pl' as TSupportedLanguages,
      };
      const wordsBefore = await Dictionary.findOne(config);
      assert.deepEqual(wordsBefore?.words, ['czart', 'człek']);

      // remove czart
      await deleteWord('czart', config.language, config.length);
      //
      const wordsAfter = await Dictionary.findOne(config);
      assert.deepEqual(wordsAfter?.words, ['człek']);
    });
    it('does nothing when word doesnt exist', async () => {
      const config = {
        letter: 'j',
        length: 5,
        language: 'en' as TSupportedLanguages,
      };
      const wordsBefore = await Dictionary.findOne(config);
      assert.deepEqual(wordsBefore?.words, ['james', 'jelly']);

      // remove
      await deleteWord('jokes', config.language, config.length);
      //
      const wordsAfter = await Dictionary.findOne(config);
      assert.deepEqual(wordsAfter?.words, ['james', 'jelly']);
    });
  });
  describe('updateWord', () => {
    it('fails on invalid length argument', () => {
      assert.rejects(() => updateWord('fail', 'fatal', 'en', 0), {
        message: 'updateWord: the length argument must not be 0.',
      });
    });
    it('fails on invalid oldWord, newWord argument - empty', () => {
      assert.rejects(() => updateWord('', 'fail', 'en', 5), {
        message: 'updateWord: the oldWord argument must not be empty.',
      });
      assert.rejects(() => updateWord('fail', '', 'en', 5), {
        message: 'updateWord: the newWord argument must not be empty.',
      });
    });
    it('fails on invalid oldWord, newWord argument - length', () => {
      assert.rejects(() => updateWord('shorter', 'short', 'en', 5), {
        message: `updateWord: the oldWord value must have length as declared by "length" argument (7 != 5).`,
      });
      assert.rejects(() => updateWord('short', 'shorter', 'en', 5), {
        message: `updateWord: the newWord value must have length as declared by "length" argument (7 != 5).`,
      });
    });
    it('fails on invalid oldWord, newWord argument - different letter', () => {
      assert.rejects(() => updateWord('stack', 'crock', 'en', 5), {
        message: `updateWord: You can only update words for the same letter.`,
      });
    });
    it('does nothing when newWord, oldWord are the same', async () => {
      const config = {
        letter: 'j',
        length: 5,
        language: 'en' as TSupportedLanguages,
      };
      const wordsBefore = await Dictionary.findOne(config);
      assert.deepEqual(wordsBefore?.words, ['james', 'jelly']);

      // remove
      await updateWord('jelly', 'JELLY', config.language, config.length);
      //
      const wordsAfter = await Dictionary.findOne(config);
      assert.deepEqual(wordsAfter?.words, ['james', 'jelly']);
    });
    it('updates the word', async () => {
      const config = {
        letter: 'j',
        length: 5,
        language: 'en' as TSupportedLanguages,
      };
      const wordsBefore = await Dictionary.findOne(config);
      assert.deepEqual(wordsBefore?.words, ['james', 'jelly']);

      // remove
      await updateWord('jelly', 'jerry', config.language, config.length);
      //
      const wordsAfter = await Dictionary.findOne(config);
      assert.deepEqual(wordsAfter?.words, ['james', 'jerry']);
    });
  });
  describe('addManyWords', async () => {
    it('fails on invalid length argument', () => {
      assert.rejects(() => addManyWords(['fail'], 'en', 0), {
        message: 'addManyWords: the length argument must not be 0.',
      });
    });
    it('fails on invalid words argument - empty', () => {
      assert.rejects(() => addManyWords([], 'en', 5), {
        message: 'addManyWords: the words argument must not be empty.',
      });
      assert.rejects(() => addManyWords([''], 'en', 5), {
        message: 'addManyWords: the words argument must not be empty.',
      });
    });
    it('fails on invalid words argument - length', () => {
      assert.rejects(() => addManyWords(['large', 'long', 'liked'], 'en', 5), {
        message: `addManyWords: the words must have length as declared by "length" argument ("long" 4 != 5).`,
      });
    });
    it('fails on invalid words argument - different letter', () => {
      assert.rejects(() => addManyWords(['large', 'words', 'liked'], 'en', 5), {
        message: `addManyWords: the words must start with the same letter "l". Invalid word: "words".`,
      });
    });

    it('adds new words to new document', async () => {
      const config = {
        letter: 'x',
        length: 5,
        language: 'en' as TSupportedLanguages,
      };
      const words = await Dictionary.findOne(config);
      assert.equal(words, null);

      const doc = await addManyWords(
        ['xylan', 'xenon', 'xoana'],
        config.language,
        config.length
      );

      // drop id
      const { __v, _id, ...rest } = doc.toJSON() as any;
      assert.deepEqual(rest, {
        ...config,
        words: ['xenon', 'xoana', 'xylan'],
      });
    });

    it('adds new word to existing document', async () => {
      const config = {
        letter: 'b',
        length: 5,
        language: 'pl' as TSupportedLanguages,
      };

      const doc = await addManyWords(
        ['bigos', 'barak', 'bęben'],
        config.language,
        config.length
      );

      // drop id
      const { __v, _id, ...rest } = doc.toJSON() as any;
      assert.deepEqual(rest, {
        ...config,
        words: ['barak', 'baton', 'bęben', 'bigos', 'brama'],
      });
    });
  });
});
