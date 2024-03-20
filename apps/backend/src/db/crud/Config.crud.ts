import mongoose, { Connection } from 'mongoose';
import { IConfigEntry } from '@repo/backend-types/db';
import { getModelForConnection } from '../models/Config';

/**
 * Fetch configuration documents
 * @param appId Optional appId filter
 * @param connection Optional Connection instance - defaults to `mongoose.connection`
 * @returns List of configuration documents
 */
export const getConfiguration = async (
  appId?: string | string[],
  connection: Connection = mongoose.connection,
) => {
  const ConfigModel = getModelForConnection(connection);

  const filter: mongoose.FilterQuery<IConfigEntry> = {};
  if (appId) {
    filter.appId = appId;
  }

  const list = await ConfigModel.find(filter).exec();

  return list;
};

export const setConfigValue = async (
  key: string,
  value: string,
  appId: string[] = [], // TODO: make it optional
  connection: Connection = mongoose.connection,
) => {
  const ConfigModel = getModelForConnection(connection);

  const filter: mongoose.FilterQuery<IConfigEntry> = {
    key,
  };
  const doc = await ConfigModel.findOne(filter);

  if (!doc) {
    throw new Error(`Config for ${key} does not exist. Apply defaults first.`);
  } else {
    doc.value = value;

    doc.appId = appId;
  }

  return await doc.save();
};

export const setConfigDefaults = async (
  connection: Connection = mongoose.connection,
) => {
  const ConfigModel = getModelForConnection(connection);

  await ConfigModel.collection.drop();

  await ConfigModel.init();
  await ConfigModel.create<IConfigEntry>([
    {
      key: 'supportedAttempts',
      value: JSON.stringify([8]),
      appId: ['admin'],
      validation: {
        type: 'number[]',
        defaultsTo: JSON.stringify([8]),
      },
      admin: {
        label: 'Supported attempts',
      },
    },
    {
      key: 'enabledAttempts',
      value: JSON.stringify([8]),
      appId: ['admin', 'frontend'],
      validation: {
        type: 'number[]',
        defaultsTo: JSON.stringify([8]),
        sourceValuesKey: 'supportedAttempts',
      },
      admin: {
        label: 'Enabled attempts',
      },
    },
    {
      key: 'supportedLength',
      value: JSON.stringify([5]),
      appId: ['admin'],
      validation: {
        type: 'number[]',
        defaultsTo: JSON.stringify([5]),
      },
      admin: {
        label: 'Supported word length',
      },
    },
    {
      key: 'enabledLength',
      value: JSON.stringify([5]),
      appId: ['admin', 'frontend'],
      validation: {
        type: 'number[]',
        defaultsTo: JSON.stringify([5]),
        sourceValuesKey: 'supportedLength',
      },
      admin: {
        label: 'Enabled word length',
      },
    },
    {
      key: 'supportedLanguages',
      value: JSON.stringify(['en', 'pl']),
      appId: ['admin'],
      validation: {
        type: 'string[]',
        defaultsTo: JSON.stringify(['en', 'pl']),
      },
      admin: {
        label: 'Supported languages',
      },
    },
    {
      key: 'enabledLanguages',
      value: JSON.stringify(['en', 'pl']),
      appId: ['admin', 'frontend'],
      validation: {
        type: 'string[]',
        defaultsTo: JSON.stringify(['en', 'pl']),
        sourceValuesKey: 'supportedLanguages',
      },
      admin: {
        label: 'Enabled languages',
      },
    },
  ]);

  return await getConfiguration(undefined, connection);
};
