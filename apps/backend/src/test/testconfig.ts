import { after, afterEach, before, beforeEach } from 'node:test';
import connect from '../db/connect';
import mongoose from 'mongoose';

const config = {
  mongo: {
    db: 'test',
    hostString: 'localhost:27017/test',
  },
};

before(async () => {
  await connect(config);

  mongoose.connection
    .once('open', () => 'Made test connection!')
    .on('error', console.error);
});

function clearDB() {
  const drops: Promise<boolean>[] = [];
  for (let i in mongoose.connection.collections) {
    drops.push(mongoose.connection.collections[i].drop());
  }
  return Promise.allSettled(drops);
}
function rebuildIndexes() {
  const createIndexes: Promise<void>[] = [];

  mongoose.connection.modelNames().map((model) => {
    createIndexes.push(mongoose.connection.models[model].createIndexes());
  });

  return Promise.allSettled(createIndexes);
}
beforeEach(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await connect(config);
      await rebuildIndexes();
    } catch (e) {
      throw e;
    }
  } else {
    await rebuildIndexes();
  }
});

afterEach(async () => {
  await clearDB();
});

after(async () => {
  await clearDB();
  await mongoose.disconnect();
});
