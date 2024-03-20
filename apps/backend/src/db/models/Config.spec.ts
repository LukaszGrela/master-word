import mongoose, { AnyKeys } from 'mongoose';
import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import type { IConfigEntry } from '@repo/backend-types/db';

import { getModelForConnection, Config } from './Config';

describe('Config model', () => {
  beforeEach(async () => {
    await Config.init();
  });
  it('fails if key is not supported', async () => {
    let error: Error | undefined;
    try {
      await Config.create<AnyKeys<IConfigEntry>>({
        key: 'fake',
        value: JSON.stringify(''),
        validation: { type: 'string' },
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
  it('fails if validation is not supported', async () => {
    let error: Error | undefined;
    try {
      await Config.create<AnyKeys<IConfigEntry>>({
        key: 'enabledLanguages',
        value: JSON.stringify(''),
      });
    } catch (e) {
      error = e as Error;
    }

    assert.notEqual(error, undefined);
    assert.match(
      `${error?.message}`,
      /Config validation failed: validation.type: Path `validation.type` is required./,
    );
  });
  it('fails if value is missing', async () => {
    let error: Error | undefined;
    try {
      await Config.create({
        key: 'supportedLanguages',
        validation: { type: 'string[]' },
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
        value: JSON.stringify([]),
        appId: ['frontend'],
        validation: { type: 'number[]' },
      });
      // try to save the same
      doc = await Config.create<AnyKeys<IConfigEntry>>({
        key: 'supportedAttempts',
        value: JSON.stringify([8]),
        appId: ['frontend'],
        validation: { type: 'number[]' },
      });
    } catch (e) {
      error = e as Error;
    }

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /dup key: { key: "supportedAttempts" }/);
  });
  it('fails if key is not supported for sourceValuesKey', async () => {
    let error: Error | undefined;
    try {
      await Config.create<AnyKeys<IConfigEntry>>({
        key: 'enabledAttempts',
        value: JSON.stringify(''),
        validation: { type: 'string', sourceValuesKey: 'fake' },
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
  it('fails if label of admin is missing', async () => {
    let error: Error | undefined;
    try {
      await Config.create({
        key: 'supportedLanguages',
        validation: { type: 'string[]' },
        value: 'abc',
        admin: {},
      });
    } catch (e) {
      error = e as Error;
    }

    assert.notEqual(error, undefined);
    assert.match(
      `${error?.message}`,
      /Config validation failed: admin\.label: Path `label` is required/,
    );
  });
  describe('getModelForConnection', () => {
    it('creates config entry with all fields', async () => {
      const ConfigModel = getModelForConnection(mongoose.connection);
      const a = new ConfigModel({
        key: 'supportedLanguages',
        value: JSON.stringify(['en', 'pl'].sort()),
        appId: ['admin', 'frontend'],
        validation: { type: 'string[]' },
        admin: {
          label: 'Supported languages',
        },
      });

      assert.equal(a.isNew, true);

      await a.save();

      assert.equal(a.isNew, false);
    });
  });
});
