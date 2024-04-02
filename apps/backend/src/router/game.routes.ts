import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ErrorCodes } from '@repo/backend-types/enums';
import type { TRandomWordQuery, TValidateWordBody } from './types';
import { isWordCorrect, randomWord } from './helpers';
import { WORD_LENGTH } from '../constants';

const router = Router();

// get random word
router.get('/random-word', async (req: Request, res: Response) => {
  // parameters
  const { language = 'pl', wordLength = WORD_LENGTH } =
    req.query as unknown as TRandomWordQuery;

  try {
    const randomWordResponse = await randomWord(language, wordLength);

    res.status(StatusCodes.OK).json(randomWordResponse);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
});

router.post('/validate-word', async (req: Request, res: Response) => {
  // TODO: add enabled word length validation
  const { word, language = 'pl' } = req.body as TValidateWordBody;
  if (!word) {
    // shows over
    res.status(StatusCodes.BAD_REQUEST).json({
      code: ErrorCodes.PARAMS_ERROR,
      error: 'Missing "word" field in body',
    });
    return;
  }
  if (word.length !== WORD_LENGTH) {
    // shows over
    res.status(StatusCodes.BAD_REQUEST).json({
      code: ErrorCodes.PARAMS_ERROR,
      error: `Field "word" has invalid length, allowed is ${WORD_LENGTH}`,
    });
    return;
  }

  const result = await isWordCorrect(word, language, WORD_LENGTH);

  res.status(StatusCodes.OK).json(result);
});

export default router;
