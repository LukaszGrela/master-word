import mongoose from 'mongoose';
import { IConfigEntry } from '@repo/backend-types/db';
import { ConfigSchema } from '../schemas/ConfigSchema';

const Config = mongoose.model<IConfigEntry>('Config', ConfigSchema);

/**
 * Retrieve or define Model for given connection.
 * @param connection Mongoose connection instance for which model needs to be registered
 * @returns `IConfigEntry` model
 */
const getModelForConnection = (connection: mongoose.Connection) => {
  return connection.model<IConfigEntry>('Config', ConfigSchema);
};

export { Config, getModelForConnection };
