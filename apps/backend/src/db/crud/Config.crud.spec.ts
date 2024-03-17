import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert';
import type { IConfigEntry } from '@repo/backend-types/db';
import mongoose, { AnyKeys } from 'mongoose';
import { Config } from '../models/Config';
import { getConfiguration, setConfigValue } from '../crud/Config.crud';

describe('Config CRUD operations', () => {
  let ids: mongoose.Types.ObjectId[];

  beforeEach(async () => {
    await Config.init();
    await Config.create<AnyKeys<IConfigEntry>>([
      {
        key: 'supportedLanguages',
        value: JSON.stringify(['en', 'pl']),
        appId: ['frontend', 'admin'],
      },
      {
        key: 'attemptsList',
        value: JSON.stringify([6, 7, 8]),
        appId: ['frontend'],
      },
    ]);

    ids = (await Config.find({}).exec()).map((d) => d._id);
  });

  describe('getConfiguration', () => {
    it('returns all configuration entries', async () => {
      const list = await getConfiguration();

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
    it('creates new config entry', async () => {
      await Config.collection.drop();

      const empty = await Config.find({});
      assert.equal(empty.length, 0);

      const doc = await setConfigValue(
        'supportedLanguages',
        JSON.stringify(['en', 'it', 'pl']),
        ['frontend', 'admin'],
      );

      const notEmpty = await Config.find({});
      assert.equal(notEmpty.length, 1);
    });
    it('updates existing config entry', async () => {
      const current = await Config.findOne({
        key: 'supportedLanguages',
      });
      assert.notEqual(current, null);

      const value = JSON.parse(current!.value) as string[];
      // add italy
      value.push('it');
      value.sort();

      // save
      const doc = await setConfigValue(
        'supportedLanguages',
        JSON.stringify(value),
      );

      // check
      const modified = await Config.findOne({
        key: 'supportedLanguages',
      });
      assert.notEqual(modified, null);
      assert.equal(modified!.value, JSON.stringify(value));
    });
  });
});
