/*  istanbul ignore file */
import { guardTConfigEntryKey } from '@repo/backend-types/db';
import mongoose, { AnyObject } from 'mongoose';

const { SchemaType } = mongoose;

const NAME = 'SupportedConfigKey' as const;

export class SupportedConfigKey extends SchemaType {
  static schemaName = NAME;

  constructor(key: string, options?: AnyObject) {
    super(key, options, NAME);
  }

  cast(val: unknown) {
    if (typeof val === 'string') {
      if (guardTConfigEntryKey(val)) {
        return val;
      } else {
        throw new Error(`${NAME}: ${val} is not supported configuration key.`);
      }
    }

    throw new Error(`${NAME}: ${val} is not a string`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(mongoose.Schema.Types as any)[NAME] = SupportedConfigKey;
