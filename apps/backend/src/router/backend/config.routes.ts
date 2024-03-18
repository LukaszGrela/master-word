import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getConfiguration, setConfigDefaults } from '../../db/crud/Config.crud';
import { ensureLoggedIn } from '../helpers';
import {
  dictionaryDevConnection,
  ensureDictionaryDevConnection,
} from './dictionary/helpers';

const router = Router();

router.get(
  '/configuration',

  ensureDictionaryDevConnection(),
  ensureLoggedIn(),

  async (req: Request, res: Response) => {
    // parameters
    const { appId } = req.query as unknown as { appId?: string | string[] };

    try {
      const connection = dictionaryDevConnection();
      const config = await getConfiguration(appId, connection);
      res.status(StatusCodes.OK).json(config);
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.BAD_REQUEST).json(error);
    }
  },
);

router.get(
  '/configuration/reset',

  ensureDictionaryDevConnection(),
  ensureLoggedIn(),

  async (req: Request, res: Response) => {
    try {
      const connection = dictionaryDevConnection();
      const config = await setConfigDefaults(connection);
      res.status(StatusCodes.OK).json(config);
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.BAD_REQUEST).json(error);
    }
  },
);

export default router;
