/*  istanbul ignore file */
import { guardTValidationChar } from '@repo/backend-types';
import mongoose, { AnyObject } from 'mongoose';

const { SchemaType } = mongoose;

const NAME = 'ValidationChar' as const;

export class ValidationChar extends SchemaType {
  static schemaName = NAME;

  constructor(key: string, options?: AnyObject) {
    super(key, options, NAME);
  }

  cast(val: unknown) {
    if (Array.isArray(val)) {
      val.forEach((letter) => {
        if (!guardTValidationChar(letter)) {
          throw new Error(
            `${NAME}: ${val} is not supported validation char key.`,
          );
        }
      });
      return val;
    }

    throw new Error(`${NAME}: ${val} is not an array`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(mongoose.Schema.Types as any)[NAME] = ValidationChar;
