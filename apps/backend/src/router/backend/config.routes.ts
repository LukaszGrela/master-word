import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  getConfiguration,
  setConfigDefaults,
  setConfigValue,
} from '../../db/crud/Config.crud';
import { ensureLoggedIn } from '../helpers';
import {
  dictionaryDevConnection,
  ensureDictionaryDevConnection,
} from './dictionary/helpers';
import { IConfigEntry, TConfigEntryKey } from '@repo/backend-types/db';

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

router.post(
  '/configuration/set/:configKey',

  ensureDictionaryDevConnection(),
  ensureLoggedIn(),

  async (req: Request, res: Response) => {
    const { configKey } = req.params;

    const { appId, key, value } = req.body as IConfigEntry;

    try {
      if (configKey !== key) {
        throw new Error(
          `Payload mismatch, declared config key is incorrect. ${configKey}!=${key}`,
        );
      }

      const connection = dictionaryDevConnection();
      const result = await setConfigValue(key, value, appId, connection);

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.BAD_REQUEST).json(error);
    }
  },
);
type TProcessConfigResult = {
  key: TConfigEntryKey;
  result?: IConfigEntry;
  error?: unknown;
};
function* processConfigList(input: IConfigEntry[]) {
  const toProcess = input.concat();
  const connection = dictionaryDevConnection();

  while (toProcess.length) {
    const config = toProcess.pop();
    if (!config) yield Promise.reject('Invalid empty entry in the list.');
    yield new Promise<TProcessConfigResult>((resolve, reject) => {
      const { appId, key, value } = config!;
      try {
        setConfigValue(key, value, appId, connection).then((result) => {
          resolve({ key, result });
        });
      } catch (error) {
        reject({ key, error });
      }
    });
  }
}

router.post(
  '/configuration/set-multiple',

  ensureDictionaryDevConnection(),
  ensureLoggedIn(),

  async (req: Request, res: Response) => {
    const list = req.body as IConfigEntry[];

    if (!list || list.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        name: 'Error',
        message: 'Body array must contain at least one entry.',
      });
      return;
    }

    try {
      const processing = processConfigList(list);
      const result: TProcessConfigResult[] = [];
      for await (const iterator of processing) {
        result.push(iterator);
      }

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.BAD_REQUEST).json(error);
    }
  },
);

export default router;
