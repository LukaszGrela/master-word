import { Router, Request, Response } from 'express';
import { ensureLoggedIn } from '../../helpers';
import { TAddManyWordsRequestBody, TAddWordRequestBody } from './types';
import { StatusCodes } from 'http-status-codes';
import { addManyWords, addWord } from '../../../db/crud/Dictionary.crud';
import {
  dictionaryDevConnection,
  ensureDictionaryDevConnection,
  logUnknownWord,
} from './helpers';
import { getAll } from '../../../db/crud/UnknownWord.crud';

const router = Router();

// add word to dictionary
router.post(
  '/add-word',
  ensureDictionaryDevConnection(),
  ensureLoggedIn(),
  async (req: Request, res: Response) => {
    const { word, language, length } = req.body as TAddWordRequestBody;
    try {
      await addWord(word, language, length);
      res.status(StatusCodes.OK).json(`Word '${word}' was added.`);
      return;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.indexOf('addWord:') === 0) {
          res
            .status(StatusCodes.BAD_REQUEST)
            .json({ name: 'Error', message: error.message });
          return;
        }
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Unknown error' });
    }
  }
);

// log unknown word
router.post(
  '/logger/unknown-word',
  ensureDictionaryDevConnection(), // assure default connection
  async (req: Request, res: Response) => {
    try {
      await logUnknownWord(req.body as TAddWordRequestBody);
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Unknown error' });
    }
  }
);

// list unknown word entries
router.get(
  '/list',
  ensureDictionaryDevConnection(),
  ensureLoggedIn(),
  async (req: Request, res: Response) => {
    try {
      let connection = dictionaryDevConnection();
      if (connection) {
        const list = await getAll(connection);

        res.status(StatusCodes.OK).json(list);
      } else {
        throw new Error('No DB Connection error');
      }
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Unknown error' });
    }
  }
);

// approve unknown word
router.post(
  '/approve-words',
  ensureDictionaryDevConnection(),
  ensureLoggedIn(),
  async (req: Request, res: Response) => {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Not implemented' });
  }
);
// reject unknown word
router.post(
  '/reject-words',
  ensureDictionaryDevConnection(),
  ensureLoggedIn(),
  async (req: Request, res: Response) => {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Not implemented' });
  }
);

// add words in bulk
router.post(
  '/add-many-words',
  ensureDictionaryDevConnection(),
  ensureLoggedIn(),
  async (req: Request, res: Response) => {
    const { words, language, length } = req.body as TAddManyWordsRequestBody;
    try {
      await addManyWords(words, language, length);
      res.status(StatusCodes.OK).json(`${words.length} words were added.`);
      return;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.indexOf('addManyWords:') === 0) {
          res
            .status(StatusCodes.BAD_REQUEST)
            .json({ name: 'Error', message: error.message });
          return;
        }
      }
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Unknown error' });
    }
  }
);

export default router;
