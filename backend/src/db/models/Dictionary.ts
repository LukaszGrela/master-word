import mongoose from 'mongoose';
import { DictionarySchema } from '../schemas/DictionarySchema';
import { IDictionaryEntry } from '../types';

const Dictionary = mongoose.model<IDictionaryEntry>(
  'Dictionary',
  DictionarySchema
);

export { Dictionary };
