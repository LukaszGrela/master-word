import { Schema } from 'mongoose';
import { SupportedLanguage } from './customTypes/SupportedLanguage';

const { Types } = Schema;

const DictionarySchema = new Schema({
  language: { type: SupportedLanguage, required: true },
  length: { type: Types.Number, required: true },
  letter: { type: Types.String, maxLength: 1, required: true },
  words: {
    type: [
      {
        type: Types.String,
        maxlength: 5, // TODO: this will be dependent on the length prop
        minlength: 5,
      },
    ],
  },
});

DictionarySchema.index(
  { letter: 1, language: 1, length: 1 },
  { unique: true, sparse: true },
);

DictionarySchema.pre('save', function (next) {
  let err: Error | undefined = undefined;

  if (this.words.length > 0) {
    // check words are valid
    // 1. Word must start with the same character as the letter denotes
    const firstInvalid = this.words.find(
      (word) => word.charAt(0) !== this.letter,
    );
    if (firstInvalid) {
      err = new Error(
        `DictionarySchema: path 'words' must contain entries starting with letter '${this.letter}', first invalid entry is '${firstInvalid}'`,
      );
    }
    if (!err) {
      // 2. entries must be unique
      const sorted = this.words.toSorted();
      const uniqueWords = Array.from(new Set(sorted));

      if (sorted.length !== uniqueWords.length) {
        err = new Error(
          `DictionarySchema: path 'words' must contain unique entries.`,
        );
      }
    }
  }

  // If you call `next()` with an argument, that argument is assumed to be
  // an error.
  next(err);
});

export { DictionarySchema };
