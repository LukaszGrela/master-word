import mongoose, { AnyObject } from 'mongoose';
import { guardSupportedLanguages } from '../../../types';

const { SchemaType } = mongoose;

export class SupportedLanguage extends SchemaType {
  static schemaName = 'SupportedLanguage' as const;
  constructor(key: string, options?: AnyObject) {
    super(key, options, 'SupportedLanguage');
  }

  cast(val: any) {
    if (typeof val === 'string') {
      if (guardSupportedLanguages(val)) {
        return val;
      }
      throw new Error(`SupportedLanguage: ${val} is not supported language.`);
    }

    throw new Error(`SupportedLanguage: ${val} is not a string`);
  }
}

(mongoose.Schema.Types as any)['SupportedLanguage'] = SupportedLanguage;
