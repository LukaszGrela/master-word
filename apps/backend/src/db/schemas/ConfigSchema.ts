import { Schema } from 'mongoose';
import { SupportedConfigKey } from './customTypes/SupportedConfigKey';

const ConfigSchema = new Schema({
  key: { type: SupportedConfigKey, required: true },
  value: { type: Schema.Types.String, required: true },
  appId: { type: [{ type: Schema.Types.String }] },
  validation: {
    type: { type: Schema.Types.String, required: true },
    defaultsTo: {
      type: Schema.Types.String,
    },
    sourceValuesKey: {
      type: SupportedConfigKey,
    },
  },
  admin: {
    type: { label: { type: Schema.Types.String, required: true } },
    required: false,
  },
});

ConfigSchema.index({ key: 1 }, { unique: true });

export { ConfigSchema };
