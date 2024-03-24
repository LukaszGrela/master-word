import { Schema } from 'mongoose';
import { SupportedConfigKey } from './customTypes/SupportedConfigKey';

const ConfigSchema = new Schema({
  key: { type: SupportedConfigKey, required: true },
  value: { type: Schema.Types.Mixed, required: true },
  appId: { type: [{ type: Schema.Types.String }] },
  defaultsTo: {
    type: Schema.Types.Mixed,
  },
  sourceValuesKey: {
    type: SupportedConfigKey,
  },
});

ConfigSchema.index({ key: 1 }, { unique: true });

export { ConfigSchema };
