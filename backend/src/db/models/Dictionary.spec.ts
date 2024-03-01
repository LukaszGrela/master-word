import { describe, it } from 'node:test';
import { Dictionary } from './Dictionary';
import assert from 'node:assert';

describe('Dictionary model', () => {
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

    assert.equal(a.isNew, true);

    await a.save();

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
        language: 'xx',
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
});
