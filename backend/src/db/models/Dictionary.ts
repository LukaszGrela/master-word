import mongoose from 'mongoose';
import { DictionarySchema } from '../schemas/DictionarySchema';

const Dictionary = mongoose.model('Dictionary', DictionarySchema);

export { Dictionary };
