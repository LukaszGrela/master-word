import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getConfiguration, setConfigDefaults } from '../../db/crud/Config.crud';

const router = Router();

router.get('/config', async (req: Request, res: Response) => {
  try {
    let config = await getConfiguration('frontend');
    if (config.length === 0) {
      config = await setConfigDefaults();
    }
    res.status(StatusCodes.OK).json(config);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
});

export default router;
