import { Schema } from 'mongoose';
import { SupportedConfigKey } from './customTypes/SupportedConfigKey';

const ConfigSchema = new Schema({
  key: { type: SupportedConfigKey, required: true },
  value: { type: Schema.Types.String, required: true },
  appId: { type: [{ type: Schema.Types.String }] },
});

ConfigSchema.index({ key: 1 }, { unique: true });

export { ConfigSchema };
