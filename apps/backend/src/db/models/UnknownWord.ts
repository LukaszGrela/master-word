import mongoose from 'mongoose';
import { IUnknownWordEntry } from '@repo/backend-types/db';
import { UnknownWordSchema } from '../schemas/UnknownWordSchema';

const UnknownWord = mongoose.model<IUnknownWordEntry>(
  'UnknownWord',
  UnknownWordSchema,
);

/**
 * Retrieve or define Model for given connection.
 * @param connection Mongoose connection instance for which model needs to be registered
 * @returns `IUnknownWordEntry` model
 */
const getModelForConnection = (connection: mongoose.Connection) => {
  return connection.model<IUnknownWordEntry>('UnknownWord', UnknownWordSchema);
};

export { UnknownWord, getModelForConnection };
