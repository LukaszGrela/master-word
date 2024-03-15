import { Schema } from 'mongoose';
import { SupportedLanguage } from './customTypes/SupportedLanguage';

const { Types } = Schema;

const UnknownWordSchema = new Schema({
  date: { type: Types.Date, required: true },
  words: {
    type: [
      new Schema({
        language: { type: SupportedLanguage, required: true },
        word: { type: Types.String, required: true },
        length: { type: Types.Number, required: true },
      }),
    ],
  },
});

UnknownWordSchema.index(
  {
    date: 1,
  },
  { unique: true },
);

export { UnknownWordSchema };
