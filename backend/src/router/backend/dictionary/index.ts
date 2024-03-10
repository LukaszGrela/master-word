import { Router, Request, Response } from 'express';
import { ensureLoggedIn } from '../../helpers';
import {
  TAddManyWordsRequestBody,
  TAddWordRequestBody,
  TApproveRejectRequestBody,
  TDictionaryStatsQuery,
  TTableData,
} from './types';
import { StatusCodes } from 'http-status-codes';
import {
  addManyWords,
  addWord,
  countWords,
  getLanguages,
} from '../../../db/crud/Dictionary.crud';
import {
  dictionaryDevConnection,
  ensureDictionaryDevConnection,
  logUnknownWord,
} from './helpers';
import { getAll, removeWordById } from '../../../db/crud/UnknownWord.crud';
import { TSupportedLanguages } from '../../../types';

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

function* processApprovingWords(input: TTableData[]) {
  const wordsToProcess = input.concat();

  let connection = dictionaryDevConnection();

  while (wordsToProcess.length > 0) {
    const word = wordsToProcess.pop();
    if (!word) return;

    yield new Promise<string>(async (resolve, reject) => {
      try {
        await addWord(
          word.word,
          word.language as TSupportedLanguages,
          word.length
        );
        // remove word from unknown-words
        await removeWordById(
          connection!,
          word.parentId,
          word.word,
          word.language as TSupportedLanguages,
          word.length
        );
        resolve(word.word);
      } catch (error) {
        console.error(word, error);
        reject(
          new Error(`word:${word.word}, error:${(error as Error).message}`)
        );
      }
    });
  }
}

// approve unknown word
router.post(
  '/approve-words',
  ensureDictionaryDevConnection(),
  ensureLoggedIn(),
  async (req: Request, res: Response) => {
    const { words } = req.body as TApproveRejectRequestBody;

    let connection = dictionaryDevConnection();
    if (!connection) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'No DB Connection error' });
      return;
    }
    if (!words || words.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        name: 'Error',
        message: "Body param 'words' must contain at least one entry.",
      });
      return;
    }

    try {
      const success: string[] = [];
      const failure: Error[] = [];
      //
      const processing = processApprovingWords(words);
      //
      for await (const iterator of processing) {
        console.log(iterator);
        if (typeof iterator === 'string') {
          // promise resolved
          success.push(iterator);
        } else {
          // promise rejected
          failure.push(iterator);
        }
      }
      //
      console.log('Response sent');
      //
      res
        .status(StatusCodes.OK)
        .json(
          `${success.length} words were approved.${
            failure.length > 0
              ? `${failure.length} words failed to approve.`
              : ''
          }`
        );
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Unknown error' });
    }
  }
);

function* processRejectingWords(input: TTableData[]) {
  const wordsToProcess = input.concat();

  let connection = dictionaryDevConnection();

  while (wordsToProcess.length > 0) {
    const word = wordsToProcess.pop();
    if (!word) return;

    yield new Promise<string>(async (resolve, reject) => {
      try {
        // remove word from unknown-words
        await removeWordById(
          connection!,
          word.parentId,
          word.word,
          word.language as TSupportedLanguages,
          word.length
        );
        resolve(word.word);
      } catch (error) {
        console.error(word, error);
        reject(
          new Error(`word:${word.word}, error:${(error as Error).message}`)
        );
      }
    });
  }
}

// reject unknown word
router.post(
  '/reject-words',
  ensureDictionaryDevConnection(),
  ensureLoggedIn(),
  async (req: Request, res: Response) => {
    const { words } = req.body as TApproveRejectRequestBody;

    let connection = dictionaryDevConnection();
    if (!connection) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'No DB Connection error' });
      return;
    }
    if (!words || words.length === 0) {
      res.status(StatusCodes.BAD_REQUEST).json({
        name: 'Error',
        message: "Body param 'words' must contain at least one entry.",
      });
      return;
    }

    try {
      const success: string[] = [];
      const failure: Error[] = [];
      //
      const processing = processRejectingWords(words);
      //
      for await (const iterator of processing) {
        console.log(iterator);
        if (typeof iterator === 'string') {
          // promise resolved
          success.push(iterator);
        } else {
          // promise rejected
          failure.push(iterator);
        }
      }
      //
      console.log('Response sent');
      //
      res
        .status(StatusCodes.OK)
        .json(
          `${success.length} words were rejected.${
            failure.length > 0
              ? `${failure.length} words failed to reject.`
              : ''
          }`
        );
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Unknown error' });
    }
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

router.get(
  '/dictionary-stats',
  ensureDictionaryDevConnection(),
  ensureLoggedIn(),
  async (req: Request, res: Response) => {
    const { language = 'pl', length = 5 } = req.query as TDictionaryStatsQuery;
    try {
      let connection = dictionaryDevConnection();
      if (connection) {
        const list = await countWords(language, Number(length));

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

router.get(
  '/dictionary-languages',
  ensureDictionaryDevConnection(),
  ensureLoggedIn(),
  async (req: Request, res: Response) => {
    const { length = 5 } = req.query as { length?: number };

    try {
      let connection = dictionaryDevConnection();
      if (connection) {
        const list = await getLanguages(Number(length));

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

export default router;
