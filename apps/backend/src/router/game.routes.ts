import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ErrorCodes } from '@repo/backend-types/enums';
import type { TValidateWordBody } from './types';
import { asString, isWordCorrect, randomWord } from './helpers';
import { WORD_LENGTH } from '../constants';

const router = Router();

// get random word
router.get('/random-word', async (req: Request, res: Response) => {
  // parameters
  const language = asString(req.query.language) ?? 'pl';
  const requestedLength = Number(asString(req.query.wordLength));
  const wordLength =
    Number.isFinite(requestedLength) && requestedLength > 0
      ? Math.floor(requestedLength)
      : WORD_LENGTH;

  try {
    const randomWordResponse = await randomWord(language, wordLength);

    res.status(StatusCodes.OK).json(randomWordResponse);
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid request' });
  }
});

router.post('/validate-word', async (req: Request, res: Response) => {
  // TODO: add enabled word length validation
  const { word, language = 'pl' } = req.body as TValidateWordBody;
  if (typeof word !== 'string' || !word) {
    // shows over
    res.status(StatusCodes.BAD_REQUEST).json({
      code: ErrorCodes.PARAMS_ERROR,
      error: 'Missing "word" field in body',
    });
    return;
  }
  if (typeof language !== 'string') {
    res.status(StatusCodes.BAD_REQUEST).json({
      code: ErrorCodes.PARAMS_ERROR,
      error: 'Field "language" must be a string',
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
