import mongoose from 'mongoose';
import { setConfigDefaults } from './crud/Config.crud';
import { Config } from './models/Config';

export const applyDefaults = () => {
  console.log('DB:applyDefaults');

  const callback = async () => {
    console.group('DB: connected, applying defaults.');
    // Config defaults
    const configCount = await Config.countDocuments({});
    if (!(configCount > 0)) {
      // empty DB
      try {
        await setConfigDefaults();
        console.log('config defaults applied');
      } catch (error) {
        console.error(error);
        console.log('failed to set config defaults.');
      }
    }
    console.groupEnd();
  };

  if (mongoose.connection.readyState === 1) {
    // already connected fire callback
    callback();
  }

  // listen to event
  mongoose.connection.on('connected', callback);
};
