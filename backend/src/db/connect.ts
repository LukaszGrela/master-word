/* istanbul ignore file */
import dotenv from 'dotenv';
import mongoose, { ConnectOptions } from 'mongoose';
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
  // Note: EvenNode provides the database name within the hostString
  const mongoUri = 'mongodb://' + mongoUsr + overrideConfig.mongo.hostString;

  const options: ConnectOptions = {
    maxPoolSize: 10,
    minPoolSize: 5,
  };

  return mongoose.connect(mongoUri, options);
}
// TODO: game user connection - readonly dictionary, readWrite session
// TODO: dictionary dev connection - readWrite dictionary
// TODO: word logger connection - write - unknown words dictionary

async function createDictionaryDevConnection() {
  const mongoUsr = 'master-word-backend-dev';
  const usrPass = encodeURIComponent(
    process.env.MONGO_BACKEND_DEV_PASSWORD || ''
  );

  const user = process.env.NODE_ENV !== 'test' ? `${mongoUsr}:${usrPass}@` : '';

  const mongoUri = `mongodb://${user}${config.mongo.hostString}/${config.mongo.db}`;

  const connection = await mongoose
    .createConnection(mongoUri, {
      maxPoolSize: 10,
      minPoolSize: 5,
    })
    .asPromise();

  return connection;
}

export { createDictionaryDevConnection };
