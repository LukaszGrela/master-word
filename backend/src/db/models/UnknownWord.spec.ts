import { describe, it } from 'node:test';
import { UnknownWord, registerWithConnection } from './UnknownWord';
import sinon from 'sinon';
import assert from 'node:assert';

describe('UnknownWord model', () => {
  it('creates unknown word entry with required fields', async () => {
    const stub = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      shouldClearNativeTimers: true,
    });
    const entry = new UnknownWord({
      date: new Date() /* '-954723600000' */,
    });
    assert.equal(entry.isNew, true);

    await entry.save();

    assert.equal(entry.isNew, false);

    stub.restore();
  });

  it('creates unknown word entry with all fields', async () => {
    const stub = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      shouldClearNativeTimers: true,
    });
    const entry = new UnknownWord({
      date: new Date() /* '-954723600000' */,
      words: [
        {
          language: 'pl',
          word: 'album',
        },
      ],
    });
    assert.equal(entry.isNew, true);

    await entry.save();

    assert.equal(entry.isNew, false);

    stub.restore();
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
    const stub = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      shouldClearNativeTimers: true,
    });
    try {
      await UnknownWord.create({
        date: new Date(),
        words: [
          {
            word: 'Boom',
          },
        ],
      });
    } catch (e) {
      error = e as Error;
    }
    stub.restore();

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /Path `language` is required/);
  });
  it('requires correct entry in words property - incorrect language', async () => {
    let error: Error | undefined;
    const stub = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      shouldClearNativeTimers: true,
    });
    try {
      await UnknownWord.create({
        date: new Date(),
        words: [
          {
            language: 'xx',
            word: 'Boom',
          },
        ],
      });
    } catch (e) {
      error = e as Error;
    }
    stub.restore();

    assert.notEqual(error, undefined);
    assert.match(
      `${error?.message}`,
      /Cast to SupportedLanguage failed for value "xx"/
    );
  });

  it('requires correct entry in words property - missing word', async () => {
    let error: Error | undefined;
    const stub = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
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
    }
    stub.restore();

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /Path `word` is required/);
  });
  it('requires correct entry in words property - incorrect word', async () => {
    let error: Error | undefined;
    const stub = sinon.useFakeTimers({
      now: new Date(1939, 9, 1).getTime(),
      shouldClearNativeTimers: true,
    });
    try {
      await UnknownWord.create({
        date: new Date(),
        words: [
          {
            language: 'pl',
            word: '',
          },
        ],
      });
    } catch (e) {
      error = e as Error;
    }
    stub.restore();

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /Path `word` is required/);
  });
});
