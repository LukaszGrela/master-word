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
  console.log('BEFORE', config);
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
beforeEach(async () => {
  if (mongoose.connection.readyState === 0) {
    try {
      await connect(config);
      await clearDB();

      mongoose.connection.modelNames().map(async (model) => {
        await mongoose.connection.models[model].createIndexes();
      });
    } catch (e) {
      throw e;
    }
  } else {
    await clearDB();
    mongoose.connection.modelNames().map(async (model) => {
      await mongoose.connection.models[model].createIndexes();
    });
  }
});

afterEach(async () => {
  await clearDB();
});

after(async () => {
  await clearDB();
  await mongoose.disconnect();
});
