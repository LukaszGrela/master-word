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
        key: 'attemptsList',
        value: JSON.stringify([]),
        appId: ['frontend'],
      });
      // try to save the same
      doc = await Config.create<AnyKeys<IConfigEntry>>({
        key: 'attemptsList',
        value: JSON.stringify([8]),
        appId: ['frontend'],
      });
    } catch (e) {
      error = e as Error;
    }

    assert.notEqual(error, undefined);
    assert.match(`${error?.message}`, /dup key: { key: "attemptsList" }/);
  });
  describe('getModelForConnection', () => {
    it('creates config entry with all fields', async () => {
      const ConfigModel = getModelForConnection(mongoose.connection);
      const a = new ConfigModel({
        key: 'supportedLanguages',
        value: JSON.stringify(['en', 'pl'].sort()),
        appId: ['admin', 'frontend'],
      });

      assert.equal(a.isNew, true);

      await a.save();

      assert.equal(a.isNew, false);
    });
  });
});
