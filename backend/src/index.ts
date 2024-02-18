import express from 'express';
import router from './router';

const PORT = process.env.PORT || 3001;

const masterWordApp = express();

masterWordApp.use(express.json());
masterWordApp.use(
  express.urlencoded({
    extended: true,
  })
);

masterWordApp.use('/api', router);

masterWordApp.listen(PORT, () => {
  console.log(`Master Word server started, listening on port ${PORT}`);
});
