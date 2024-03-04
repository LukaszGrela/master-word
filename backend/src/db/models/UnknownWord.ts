import mongoose from 'mongoose';
import { UnknownWordSchema } from '../schemas/UnknownWordSchema';
import { IUnknownWordEntry } from '../types';

const UnknownWord = mongoose.model<IUnknownWordEntry>(
  'UnknownWord',
  UnknownWordSchema
);

const registerWithConnection = (connection: mongoose.Connection) => {
  return connection.model<IUnknownWordEntry>('UnknownWord', UnknownWordSchema);
};

export { UnknownWord, registerWithConnection };
