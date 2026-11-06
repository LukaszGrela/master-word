import { after, afterEach, before, beforeEach } from 'mocha';
import connect from '../db/connect';
import mongoose from 'mongoose';

const testConfig = {
  mongo: {
    db: 'test',
    hostString: '127.0.0.1:27017/test',
  },
};

export function clearDB() {
  const collections = Object.values(mongoose.connection.collections);

  return Promise.allSettled(collections.map((document) => document.drop()));
}
export function rebuildIndexes() {
  const createIndexes: Promise<void>[] = [];

  mongoose.connection.modelNames().forEach((model) => {
    createIndexes.push(mongoose.connection.models[model].createIndexes());
  });

  return Promise.allSettled(createIndexes);
}
export { testConfig };
