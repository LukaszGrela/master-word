import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import type { IConfigEntry } from '@repo/backend-types/db';
import mongoose, { AnyKeys } from 'mongoose';
import { Config } from '../models/Config';
import {
  getConfiguration,
  setConfigDefaults,
  setConfigValue,
} from '../crud/Config.crud';

describe('Config CRUD operations', () => {
  let ids: mongoose.Types.ObjectId[];

  beforeEach(async () => {
    await Config.init();
    await Config.create<AnyKeys<IConfigEntry>>([
      {
        key: 'supportedLanguages',
        value: ['en', 'pl'],
        appId: ['frontend', 'admin'],
      },
      {
        key: 'supportedAttempts',
        value: [6, 7, 8],
        appId: ['frontend'],
        defaultsTo: [],
      },
    ]);

    ids = (await Config.find({}).exec()).map((d) => d._id);
  });

  describe('setConfigDefaults', () => {
    it('sets defaults', async () => {
      let list = await setConfigDefaults();
      assert.equal(list.length, 6);

      list = await setConfigDefaults(mongoose.connection);
      assert.equal(list.length, 6);
    });
  });

  describe('getConfiguration', () => {
    it('returns all configuration entries', async () => {
      let list = await getConfiguration();
      assert.equal(list.length, 2);

      list = await getConfiguration(undefined, mongoose.connection);
      assert.equal(list.length, 2);
    });
    it('returns configuration entries for given appId', async () => {
      let list = await getConfiguration('frontend');
      assert.equal(list.length, 2);
      list = await getConfiguration('admin');
      assert.equal(list.length, 1);
      list = await getConfiguration('not-existing');
      assert.equal(list.length, 0);
    });
  });

  describe('setConfigValue', () => {
    it('Fails to modify non existing new config entry', async () => {
      await Config.init();
      await Config.collection.drop();

      let empty = await Config.find({});
      assert.equal(empty.length, 0);

      let error: Error | undefined;
      try {
        const doc = await setConfigValue(
          'supportedLanguages',
          ['en', 'it', 'pl'],
          ['frontend', 'admin'],
        );
      } catch (e) {
        error = e as Error;
      }

      assert.notEqual(error, undefined);
      assert.match(
        `${error?.message}`,
        /Config for supportedLanguages does not exist. Apply defaults first./,
      );

      empty = await Config.find({});
      assert.equal(empty.length, 0);
    });
    it('updates existing config entry', async () => {
      const current = await Config.findOne({
        key: 'supportedLanguages',
      });
      assert.notEqual(current, null);

      const value = current!.value as string[];
      // add italy
      value.push('it');
      value.sort();

      // save
      const doc = await setConfigValue('supportedLanguages', value);

      // check
      const modified = await Config.findOne({
        key: 'supportedLanguages',
      });
      assert.notEqual(modified, null);
      assert.deepEqual(modified!.value, value);
    });
    it('changes the appId', async () => {
      const current = await Config.findOne({
        key: 'supportedLanguages',
      });
      assert.notEqual(current, null);

      // save
      await setConfigValue('supportedLanguages', current!.value, ['frontend']);

      // check
      const modified = await Config.findOne({
        key: 'supportedLanguages',
      });
      assert.notEqual(modified, null);
      assert.deepEqual(modified!.appId, ['frontend']);
    });
    it('defaults the appId to empty array', async () => {
      const current = await Config.findOne({
        key: 'supportedLanguages',
      });
      assert.notEqual(current, null);

      // save
      await setConfigValue(
        'supportedLanguages',
        current!.value,
        undefined,
        mongoose.connection,
      );

      // check
      const modified = await Config.findOne({
        key: 'supportedLanguages',
      });
      assert.notEqual(modified, null);
      assert.equal(modified!.appId.length, 0);
    });
  });
});
