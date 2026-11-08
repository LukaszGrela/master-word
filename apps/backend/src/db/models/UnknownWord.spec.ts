import { describe, it } from 'mocha';
import { getModelForConnection, UnknownWord } from './UnknownWord';
import sinon from 'sinon';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { testConfig } from '../../test/testconfig';

describe('UnknownWord model', () => {
  before(async function () {
    console.log('readyState before():', mongoose.connection.readyState);
    await mongoose.connect(`mongodb://${testConfig.mongo.hostString}`);
    await UnknownWord.init();
  });
  beforeEach(async function () {
    console.log('readyState beforeEach():', mongoose.connection.readyState);
    await mongoose.connection.dropDatabase();

    await UnknownWord.init();
  });
  after(async function () {
    console.log('readyState before after():', mongoose.connection.readyState);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
    }
    await mongoose.disconnect();
  });

  it('creates unknown word entry with required fields', async () => {
    const clock = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      toFake: ['Date'],
      shouldClearNativeTimers: true,
    });

    const entry = new UnknownWord({
      date: new Date() /* '-954723600000' */,
    });
    assert.equal(entry.isNew, true);

    await entry.save();

    assert.equal(entry.isNew, false);

    clock.uninstall();
  });

  it('creates unknown word entry with all fields', async () => {
    const clock = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      toFake: ['Date'],
      shouldClearNativeTimers: true,
    });

    const entry = new UnknownWord({
      date: new Date() /* '-954723600000' */,
      words: [
        {
          language: 'pl',
          word: 'album',
          length: 5,
        },
      ],
    });
    assert.equal(entry.isNew, true);

    await entry.save();

    assert.equal(entry.isNew, false);

    clock.uninstall();
  });

  it('requires date property', async () => {
    let error: Error | undefined;
    try {
      await UnknownWord.create({});
    } catch (e) {
      error = e as Error;
    }
    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /Path `date` is required/);
  });

  it('requires correct entry in words property - missing language', async () => {
    let error: Error | undefined;
    const clock = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      toFake: ['Date'],
      shouldClearNativeTimers: true,
    });
    try {
      await UnknownWord.create({
        date: new Date(),
        words: [
          {
            word: 'Boom',
            length: 5,
          },
        ],
      });
    } catch (e) {
      error = e as Error;
    } finally {
      clock.uninstall();
    }

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /Path `language` is required/);
  });
  it('requires correct entry in words property - incorrect language max length', async () => {
    let error: Error | undefined;
    const clock = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      toFake: ['Date'],
      shouldClearNativeTimers: true,
    });
    try {
      await UnknownWord.create({
        date: new Date(),
        words: [
          {
            language: 'xxx',
            word: 'Boom',
            length: 5,
          },
        ],
      });
    } catch (e) {
      error = e as Error;
    } finally {
      clock.uninstall();
    }
    assert.notEqual(error, undefined);
    assert.match(
      `${error?.message}`,
      /Path `language` \(`xxx`(?:, length 3)?\) is longer than the maximum allowed length \(2\)\./,
    );
  });
  it('requires correct entry in words property - incorrect language min length', async () => {
    let error: Error | undefined;
    const clock = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      toFake: ['Date'],
      shouldClearNativeTimers: true,
    });
    try {
      await UnknownWord.create({
        date: new Date(),
        words: [
          {
            language: 'x',
            word: 'Boom',
            length: 5,
          },
        ],
      });
    } catch (e) {
      error = e as Error;
    } finally {
      clock.uninstall();
    }

    assert.notEqual(error, undefined);
    assert.match(
      `${error?.message}`,
      /Path `language` \(`x`(?:, length 1)?\) is shorter than the minimum allowed length \(2\)\./,
    );
  });
  it('requires correct entry in words property - missing length', async () => {
    let error: Error | undefined;
    const clock = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      toFake: ['Date'],
      shouldClearNativeTimers: true,
    });
    try {
      await UnknownWord.create({
        date: new Date(),
        words: [
          {
            language: 'en',
            word: 'Boom',
          },
        ],
      });
    } catch (e) {
      error = e as Error;
    } finally {
      clock.uninstall();
    }

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /Path `length` is required./);
  });

  it('requires correct entry in words property - missing word', async () => {
    let error: Error | undefined;
    const clock = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      toFake: ['Date'],
      shouldClearNativeTimers: true,
    });
    try {
      await UnknownWord.create({
        date: new Date(),
        words: [
          {
            language: 'pl',
          },
        ],
      });
    } catch (e) {
      error = e as Error;
    } finally {
      clock.uninstall();
    }

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /Path `word` is required/);
  });
  it('requires correct entry in words property - incorrect word', async () => {
    let error: Error | undefined;
    const clock = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      toFake: ['Date'],
      shouldClearNativeTimers: true,
    });
    try {
      await UnknownWord.create({
        date: new Date(),
        words: [
          {
            language: 'pl',
            word: '',
            length: 5,
          },
        ],
      });
    } catch (e) {
      error = e as Error;
    } finally {
      clock.uninstall();
    }

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /Path `word` is required/);
  });
});
