import mongoose from 'mongoose';
import { DictionarySchema } from '../schemas/DictionarySchema';
import { IDictionaryEntry } from '../types';

const Dictionary = mongoose.model<IDictionaryEntry>(
  'Dictionary',
  DictionarySchema,
);

/**
 * Retrieve or define Model for given connection.
 * @param connection Mongoose connection instance for which model needs to be registered
 * @returns `IDictionaryEntry` model
 */
const getModelForConnection = (connection: mongoose.Connection) => {
  return connection.model<IDictionaryEntry>('Dictionary', DictionarySchema);
};

export { Dictionary, getModelForConnection };
