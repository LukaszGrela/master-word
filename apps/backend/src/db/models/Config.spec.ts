import mongoose, { AnyKeys } from 'mongoose';
import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import type { IConfigEntry } from '@repo/backend-types/db';
import { getModelForConnection, Config } from './Config';

describe('Config model', () => {
  beforeEach(async () => {
    await Config.init();
  });

  it('fails if key is missing', async () => {
    let error: Error | undefined;
    try {
      await Config.create({
        value: 'supportedLanguages',
      });
    } catch (e) {
      error = e as Error;
    }

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /Path `key` is required/);
  });

  it('fails if key is not supported', async () => {
    let error: Error | undefined;
    try {
      await Config.create<AnyKeys<IConfigEntry>>({
        key: 'fake',
        value: '',
      });
    } catch (e) {
      error = e as Error;
    }

    assert.notEqual(error, undefined);
    assert.match(
      `${error?.message}`,
      /Cast to SupportedConfigKey failed for value "fake"/,
    );
  });

  it('fails if value is missing', async () => {
    let error: Error | undefined;
    try {
      await Config.create({
        key: 'supportedLanguages',
      });
    } catch (e) {
      error = e as Error;
    }

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /Path `value` is required/);
  });

  it('fails to add document with the same key', async () => {
    let error: Error | undefined;
    try {
      let doc = await Config.create<AnyKeys<IConfigEntry>>({
        key: 'supportedAttempts',
        value: [],
        appId: ['frontend'],
      });
      // try to save the same
      doc = await Config.create<AnyKeys<IConfigEntry>>({
        key: 'supportedAttempts',
        value: [8],
        appId: ['frontend'],
      });
    } catch (e) {
      error = e as Error;
    }

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /dup key: { key: "supportedAttempts" }/);
  });

  it('fails if sourceValuesKey is not supported key', async () => {
    let error: Error | undefined;
    try {
      await Config.create<AnyKeys<IConfigEntry>>({
        key: 'enabledAttempts',
        value: '',
        sourceValuesKey: 'fake',
      });
    } catch (e) {
      error = e as Error;
    }

    assert.notEqual(error, undefined);
    assert.match(
      `${error?.message}`,
      /Cast to SupportedConfigKey failed for value "fake"/,
    );
  });

  describe('getModelForConnection', () => {
    it('creates config entry with all fields', async () => {
      const ConfigModel = getModelForConnection(mongoose.connection);
      await ConfigModel.collection.drop();

      const a = new ConfigModel({
        key: 'supportedLanguages',
        value: ['en', 'pl'].sort(),
        appId: ['admin', 'frontend'],
        defaultsTo: [],
        sourceValuesKey: 'enabledLanguages',
      });

      assert.equal(a.isNew, true);

      await a.save();

      assert.equal(a.isNew, false);
    });
  });
});
