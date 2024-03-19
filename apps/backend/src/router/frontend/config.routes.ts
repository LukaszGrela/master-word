import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { getConfiguration } from '../../db/crud/Config.crud';

const router = Router();

router.get('/config', async (req: Request, res: Response) => {
  try {
    const config = await getConfiguration('frontend');
    res.status(StatusCodes.OK).json(config);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
});

export default router;
