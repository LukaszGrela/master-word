import mongoose from 'mongoose';
import { IConfigEntry } from '@repo/backend-types/db';
import { ConfigSchema } from '../schemas/ConfigSchema';

const Config = mongoose.model<IConfigEntry>('Config', ConfigSchema);
/* Config.on('index', function (err) {
  if (err) {
    console.error('Config index error: %s', err);
  } else {
    console.info('Config indexing complete');
  }
}); */
/**
 * Retrieve or define Model for given connection.
 * @param connection Mongoose connection instance for which model needs to be registered
 * @returns `IConfigEntry` model
 */
const getModelForConnection = (connection: mongoose.Connection) => {
  const ConfigModel = connection.model<IConfigEntry>('Config', ConfigSchema);
  /*   ConfigModel.on('index', function (err) {
    if (err) {
      console.error('Config index error: %s', err);
    } else {
      console.info('Config indexing complete');
    }
  });
 */ return ConfigModel;
};

export { Config, getModelForConnection };
