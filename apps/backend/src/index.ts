import express from 'express';
import cors from 'cors';
import {
  gameRoutes,
  backendDictionaryRoutes,
  frontendConfigRoutes,
  backendConfigRoutes,
} from './router';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connect from './db/connect';
import { applyDefaults } from './db/applyDefaults';
import { getVersion } from './utils/version';

dotenv.config({
  path: ['.env.local', '.env'],
});

(async () => {
  const APP_VERSION = await getVersion();

  const isDevelopment = process.env.NODE_ENV === 'development';
  if (isDevelopment) {
    mongoose.set('debug', true);
  }

  const PORT = process.env.PORT || 3001;

  const masterWordApp = express();

  masterWordApp.use(express.json());

  masterWordApp.use(
    cors({
      methods: ['GET', 'POST' /*,'HEAD','PUT','PATCH','DELETE'*/],
      origin: [
        'https://master-word.greladesign.co',
        'https://master-word-admin.greladesign.co',
        'http://localhost:5273',
        'http://localhost:5274',
      ],
    }),
  );

  masterWordApp.use(
    express.urlencoded({
      extended: true,
    }),
  );

  masterWordApp.use('/api', frontendConfigRoutes);
  masterWordApp.use('/api', gameRoutes);
  masterWordApp.use('/api/backend', backendConfigRoutes);
  masterWordApp.use('/api/backend', backendDictionaryRoutes);
  const server = masterWordApp.listen(PORT, async () => {
    console.log(`Master Word server started, listening on port ${PORT}`);
    console.log(`Server version: ${APP_VERSION}`);

    await connect();
    applyDefaults();

    console.log('DB Connection status', mongoose.connection.readyState);
  });

  process.on('exit', async function () {
    await mongoose.disconnect();

    server.close();
  });
})();
