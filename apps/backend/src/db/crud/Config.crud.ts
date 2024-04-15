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
  value: string | number | boolean | string[] | number[] | boolean[],
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

  try {
    await ConfigModel.collection.drop(); // this will throw 'NamespaceNotFound' when there is no collection to drop
  } catch(error) {
    if((error as Error).name!=='MongoServerError') {
      throw error
    }
  }

  await ConfigModel.init();
  await ConfigModel.create<IConfigEntry>([
    {
      key: 'supportedAttempts',
      value: [8],
      appId: ['admin'],
      defaultsTo: [8],
    },
    {
      key: 'enabledAttempts',
      value: [8],
      appId: ['admin', 'frontend'],
      defaultsTo: [8],
      sourceValuesKey: 'supportedAttempts',
    },
    {
      key: 'supportedLength',
      value: [5],
      appId: ['admin'],
      defaultsTo: [5],
    },
    {
      key: 'enabledLength',
      value: [5],
      appId: ['admin', 'frontend'],
      defaultsTo: [5],
      sourceValuesKey: 'supportedLength',
    },
    {
      key: 'supportedLanguages',
      value: ['en', 'pl'],
      appId: ['admin'],
      defaultsTo: ['en', 'pl'],
    },
    {
      key: 'enabledLanguages',
      value: ['en', 'pl'],
      appId: ['admin', 'frontend'],
      defaultsTo: ['en', 'pl'],
      sourceValuesKey: 'supportedLanguages',
    },
  ]);

  return await getConfiguration(undefined, connection);
};
