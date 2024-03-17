/*  istanbul ignore file */
import mongoose, { AnyObject } from 'mongoose';

const { SchemaType } = mongoose;

const SUPPORTED_LANG = 'supportedLanguages' as const;
const ATTEMPTS_LIST = 'attemptsList' as const;

export const configKeys = [SUPPORTED_LANG, ATTEMPTS_LIST];

const NAME = 'SupportedConfigKey' as const;

export class SupportedConfigKey extends SchemaType {
  static schemaName = NAME;

  constructor(key: string, options?: AnyObject) {
    super(key, options, NAME);
  }

  cast(val: unknown) {
    if (typeof val === 'string') {
      switch (val) {
        case SUPPORTED_LANG:
        case ATTEMPTS_LIST:
          return val;

        default:
          throw new Error(
            `${NAME}: ${val} is not supported configuration key.`,
          );
      }
    }

    throw new Error(`${NAME}: ${val} is not a string`);
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(mongoose.Schema.Types as any)[NAME] = SupportedConfigKey;
