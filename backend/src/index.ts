import express from 'express';
import cors from 'cors';
import { gameRoutes, backendDictionaryRoutes } from './router';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connect from './db/connect';

dotenv.config({
  path: ['.env.local', '.env'],
});

const PORT = process.env.PORT || 3001;

const masterWordApp = express();

masterWordApp.use(express.json());

masterWordApp.use(
  cors({
    methods: ['GET' /*,'HEAD','PUT','PATCH','POST','DELETE'*/],
    origin: [
      'https://master-word.greladesign.co',
      'https://master-word-admin.greladesign.co',
      'http://localhost:5173',
      'http://localhost:5174',
    ],
  })
);

masterWordApp.use(
  express.urlencoded({
    extended: true,
  })
);

masterWordApp.use('/api', gameRoutes);
masterWordApp.use('/api/backend', backendDictionaryRoutes);
const server = masterWordApp.listen(PORT, async () => {
  console.log(`Master Word server started, listening on port ${PORT}`);
  await connect();
  console.log('DB Connection status', mongoose.connection.readyState);
});

process.on('exit', async function () {
  await mongoose.disconnect();

  server.close();
});
