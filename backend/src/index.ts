import express from 'express';
import cors from 'cors';
import { gameRoutes } from './router';

const PORT = process.env.PORT || 3001;

const masterWordApp = express();

masterWordApp.use(express.json());

masterWordApp.use(
  cors({
    methods: ['GET' /*,'HEAD','PUT','PATCH','POST','DELETE'*/],
    origin: ['https://master-word.greladesign.co', 'http://localhost:5173'],
  })
);

masterWordApp.use(
  express.urlencoded({
    extended: true,
  })
);

masterWordApp.use('/api', gameRoutes);

masterWordApp.listen(PORT, () => {
  console.log(`Master Word server started, listening on port ${PORT}`);
});
