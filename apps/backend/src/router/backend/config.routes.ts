import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  getConfiguration,
  setConfigDefaults,
  setConfigValue,
} from '../../db/crud/Config.crud';
import { asString, ensureLoggedIn, respondBadRequest } from '../helpers';
import {
  dictionaryDevConnection,
  ensureDictionaryDevConnection,
} from './dictionary/helpers';
import {
  IConfigEntry,
  TProcessConfigResultEntry,
} from '@repo/backend-types/db';

const router = Router();

router.get(
  '/configuration',

  ensureDictionaryDevConnection(),
  ensureLoggedIn(),

  async (req: Request, res: Response) => {
    // parameters
    const appId = asString(req.query.appId);

    try {
      const connection = dictionaryDevConnection();
      const config = await getConfiguration(appId, connection);
      res.status(StatusCodes.OK).json(config);
    } catch (error) {
      respondBadRequest(res, error);
    }
  },
);

// Destructive: drops and recreates the Config collection. Must never be a GET
// (which is prefetchable/CSRF-able) and requires explicit confirmation.
router.post(
  '/configuration/reset',

  ensureDictionaryDevConnection(),
  ensureLoggedIn(),

  async (req: Request, res: Response) => {
    const { confirm } = (req.body ?? {}) as { confirm?: unknown };
    if (confirm !== true) {
      res.status(StatusCodes.BAD_REQUEST).json({
        error: 'Refusing to reset configuration without explicit confirmation.',
      });
      return;
    }

    try {
      const connection = dictionaryDevConnection();
      const config = await setConfigDefaults(connection);
      res.status(StatusCodes.OK).json(config);
    } catch (error) {
      respondBadRequest(res, error);
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
      respondBadRequest(res, error);
    }
  },
);

function* processConfigList(input: IConfigEntry[]) {
  const toProcess = input.concat();
  const connection = dictionaryDevConnection();

  while (toProcess.length) {
    const config = toProcess.pop();
    if (!config) yield Promise.reject('Invalid empty entry in the list.');
    yield new Promise<TProcessConfigResultEntry>((resolve, reject) => {
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
      const result: TProcessConfigResultEntry[] = [];
      for await (const iterator of processing) {
        result.push(iterator);
      }

      res.status(StatusCodes.OK).json(result);
    } catch (error) {
      respondBadRequest(res, error);
    }
  },
);

export default router;
