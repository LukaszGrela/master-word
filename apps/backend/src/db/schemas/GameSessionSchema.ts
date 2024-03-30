import { Schema } from 'mongoose';
import { ValidationChar } from './customTypes/ValidationChar';
import { TGameRecord, TGameStep } from '@repo/backend-types';
const { Boolean, String, Map, Number } = Schema.Types;

const nonEmptyValidator = {
  validator: function (this: TGameStep, value: string[]) {
    return Promise.resolve(value.length > 0);
  },
  message: function ({ path }: { path: string; value: TGameStep[] }) {
    return `Path ${path} must not be empty.`;
  },
};

const GameStepSchema = new Schema({
  word: { type: [String], required: true, validate: nonEmptyValidator },
  validated: {
    type: ValidationChar,
    required: true,
    validate: nonEmptyValidator,
  },
});

const GameRecordSchema = new Schema({
  language: { type: String, required: true },
  timestamp_start: { type: String, required: true },
  max_attempts: { type: Number, required: true },
  attempt: { type: Number, required: true },
  word: { type: String, required: true },
  word_length: { type: Number, required: true },
  guessed: { type: Boolean, required: true },
  score: { type: Number, required: true },

  state: {
    type: [GameStepSchema],
    required: function (this: TGameRecord) {
      return this.attempt > 0;
    },
    validate: {
      validator: function (value: TGameStep[]) {
        return Promise.resolve(
          ((this as TGameRecord).attempt > 0 && value.length > 0) ||
            ((this as TGameRecord).attempt === 0 && value.length === 0),
        );
      },
      message: function ({ path }: { path: string; value: TGameStep[] }) {
        return `Path ${path} must not be empty when attempt greater than 0.`;
      },
    },
  },

  finished: { type: Boolean, required: true },
  timestamp_finish: {
    type: String,
    required: function (this: TGameRecord) {
      return this.finished;
    },
  },
});

const GameSessionSchema = new Schema({
  session: { type: String, required: true },
  highest: {
    type: Map,
    of: {
      score: { type: Number, required: true },
      timeMs: { type: Number, required: true },
      attempts: { type: Number, required: true },
    },
  },
  game: GameRecordSchema,
});

GameSessionSchema.index(
  {
    session: 1,
  },
  { unique: true },
);

export { GameSessionSchema, GameRecordSchema };
