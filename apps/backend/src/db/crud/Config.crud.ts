import mongoose, { AnyKeys, Connection } from 'mongoose';
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
  let doc = await ConfigModel.findOne(filter);

  if (!doc) {
    // create
    doc = await ConfigModel.create<AnyKeys<IConfigEntry>>({
      key,
      value,
      appId,
    });
  } else {
    doc.value = value;
    if (appId) {
      doc.appId = appId;
    }
  }

  return await doc.save();
};
