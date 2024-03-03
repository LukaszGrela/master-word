/* istanbul ignore file */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { TConfig } from './types';

dotenv.config({
  path: ['.env.local', '.env.secret', '.env'],
});

const config = JSON.parse(`${process.env.APP_CONFIG}` || '{}') as TConfig;
//mongodb://localhost:27017/
export default function connect(
  overrideConfig: TConfig & { pass?: string } = config
) {
  const mongoUsr = overrideConfig.mongo.user
    ? `${overrideConfig.mongo.user}:${encodeURIComponent(
        overrideConfig.pass || process.env.MONGO_PASSWORD || ''
      )}@`
    : '';
  const mongoUri = 'mongodb://' + mongoUsr + overrideConfig.mongo.hostString;
  return mongoose.connect(mongoUri);
}
