import { Schema } from 'mongoose';

const { Types } = Schema;

const UnknownWordSchema = new Schema({
  date: { type: Types.Date, required: true },
  words: {
    type: [
      new Schema({
        language: {
          type: Types.String,
          required: true,
          maxlength: 2,
          minlength: 2,
        },
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
