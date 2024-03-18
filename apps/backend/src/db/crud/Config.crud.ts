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
  appId: string[] = [],
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

  await ConfigModel.create<IConfigEntry>([
    {
      key: 'supportedAttempts',
      value: JSON.stringify([8]),
      appId: ['frontend'],
      validation: {
        type: 'number[]',
        defaultsTo: JSON.stringify([8]),
      },
    },
    {
      key: 'enabledAttempts',
      value: JSON.stringify([8]),
      appId: ['frontend'],
      validation: {
        type: 'number[]',
        defaultsTo: JSON.stringify([8]),
      },
    },
    {
      key: 'supportedLength',
      value: JSON.stringify([5]),
      appId: ['frontend'],
      validation: {
        type: 'number[]',
        defaultsTo: JSON.stringify([5]),
      },
    },
    {
      key: 'enabledLength',
      value: JSON.stringify([5]),
      appId: ['frontend'],
      validation: {
        type: 'number[]',
        defaultsTo: JSON.stringify([5]),
      },
    },
    {
      key: 'supportedLanguages',
      value: JSON.stringify(['en', 'pl']),
      appId: ['frontend'],
      validation: {
        type: 'number[]',
        defaultsTo: JSON.stringify(['en', 'pl']),
      },
    },
    {
      key: 'enabledLanguages',
      value: JSON.stringify(['en', 'pl']),
      appId: ['frontend'],
      validation: {
        type: 'number[]',
        defaultsTo: JSON.stringify(['en', 'pl']),
      },
    },
  ]);

  return await getConfiguration(undefined, connection);
};
