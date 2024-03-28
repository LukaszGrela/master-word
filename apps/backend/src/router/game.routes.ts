import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';
import type { TGameSession } from '@repo/backend-types';
import { ErrorCodes } from '@repo/backend-types/enums';
import type {
  TRandomWordResponse,
  TRandomWordQuery,
  TIsCorrectWordResponse,
  TInitQuery,
  TNextAttemptQuery,
  TSessionQuery,
  TValidateWordBody,
} from './types';
import { calculateScore, resetGameSession, validateWord } from './helpers';
import { MAX_ATTEMPTS, WORD_LENGTH } from '../constants';
import { logUnknownWord } from './backend/dictionary/helpers';
import {
  wordExists,
  getRandomWord as apiGetRandomWord,
} from '../db/crud/Dictionary.crud';
import { getConfiguration } from '../db/crud/Config.crud';

const router = Router();

async function getRandomWord(
  language = 'pl',
  wordLength: number = WORD_LENGTH,
): Promise<TRandomWordResponse> {
  if (language !== 'en') {
    try {
      const word = await apiGetRandomWord(language, wordLength);
      return {
        word,
        language,
      } as TRandomWordResponse;
    } catch (error) {
      console.log(error);
      return Promise.reject({
        code: ErrorCodes.RANDOM_WORD_ERROR,
        error: `Can't retrieve ${language} word.`,
        language,
      });
    }
  } else {
    // call external API endpoint
    try {
      const result = await fetch(
        'https://words.dev-apis.com/word-of-the-day?random=1',
      );
      const response = (await result.json()) as { error?: string };

      if (result.ok) {
        return { ...response, language: 'en' } as TRandomWordResponse;
      } else {
        throw response.error;
      }
    } catch (error) {
      console.log(error);
      return Promise.reject({
        code: ErrorCodes.RANDOM_WORD_ERROR,
        language: 'en',
        error: "Can't retrieve english word.",
      });
    }
  }
}

// get random word
router.get('/random-word', async (req: Request, res: Response) => {
  // parameters
  const { language = 'pl', wordLength = WORD_LENGTH } =
    req.query as unknown as TRandomWordQuery;

  try {
    const randomWordResponse = await getRandomWord(language, wordLength);

    res.status(StatusCodes.OK).json(randomWordResponse);
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
});

const isCorrectWord = async (
  word: string,
  language: string,
  wordLength: number = WORD_LENGTH,
) => {
  if (language === 'en') {
    try {
      const response = await fetch('https://words.dev-apis.com/validate-word', {
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ word }),
      });
      const data = JSON.parse(await response.text()) as TIsCorrectWordResponse;
      if (response.ok) {
        if (!data.validWord) {
          return { ...data, language, error: 'Invalid word' };
        }
        return { ...data, language };
      } else {
        // endpoint returned error
        console.log(data);
        return {
          ...data,
          word,
          validWord: true,
          error: 'Validation endpoint error',
          language,
        };
      }
    } catch (error) {
      console.log(error);
      // something is broken, accept word for game play
      return {
        word,
        validWord: true,
        error: (error as Error).message || 'Validation endpoint error',
        language,
      };
    }
  } else {
    const needle = word.toLocaleLowerCase();
    // search for the word
    const result = await wordExists(needle, language, wordLength);

    if (result) {
      // correct
      return {
        word,
        language,
        validWord: true,
      };
    } else {
      // incorrect
      return {
        word,
        language,
        validWord: false,
        error: 'Word not found',
      };
    }
  }
};

const gameSessions = new Map<string, TGameSession>();

router.get('/init', async (req: Request, res: Response) => {
  // TODO: add init word length
  const wordLength = WORD_LENGTH;
  const { session, language = 'pl', ...rest } = req.query as TInitQuery;
  const maxAttempts = Number(rest.maxAttempts || MAX_ATTEMPTS);
  const config = await getConfiguration('frontend');

  const enabledLanguagesConfig = config.find(
    ({ key }) => key === 'enabledLanguages',
  );

  if (!enabledLanguagesConfig) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.CONFIGURATION,
      error: 'Can not start new game. Misconfiguration.',
    });
    return;
  } else {
    const enabledLanguages = enabledLanguagesConfig.value as string[];
    if (Array.isArray(enabledLanguages) && enabledLanguages.length > 0) {
      // verify requested language
      if (enabledLanguages.indexOf(language) === -1) {
        res.status(StatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.SESSION_ERROR,
          error: 'Invalid session id',
        });
        return;
      }
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: ErrorCodes.CONFIGURATION,
        error: 'Can not start new game. Misconfiguration.',
      });
      return;
    }
  }

  let response: TGameSession | undefined;
  if (session) {
    // read and return
    if (gameSessions.has(session)) {
      response = gameSessions.get(session);
    } else {
      // session doesnt exist
      res.status(StatusCodes.BAD_REQUEST).json({
        code: ErrorCodes.SESSION_ERROR,
        error: 'Invalid session id',
      });
      return;
    }
  } else {
    // create and return
    try {
      const word = await getRandomWord(language, wordLength);
      const id = uuid();
      response = {
        session: id,
        game: resetGameSession(language, word.word, maxAttempts),
      };
      gameSessions.set(id, response);
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: ErrorCodes.GENERAL_ERROR,
        error: 'Can not start new game.',
      });
      return;
    }
  }
  if (!response) {
    // session doesnt exist
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.GENERAL_ERROR,
      error: 'Can not start new game.',
    });
    return;
  } else {
    // all good - send game response
    if (response.game.finished) {
      if (response.game.guessed) {
        // previous game was finished, compare score with highest
        const timePlayed =
          Number(response.game.timestamp_finish) -
          Number(response.game.timestamp_start);
        const score = response.game.score;
        // check with previous
        if (
          !response.highest ||
          score > response.highest.score ||
          (score === response.highest.score &&
            timePlayed >= response.highest.timeMs)
        ) {
          // it is higher update
          response.highest = {
            attempts: response.game.attempt,
            score,
            timeMs: timePlayed,
          };
        }
      }

      try {
        const word = await getRandomWord(language, wordLength);
        response = {
          ...response,
          game: resetGameSession(language, word.word, maxAttempts),
        };
        // store/update
        gameSessions.set(response.session, response);
      } catch (error) {
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          code: ErrorCodes.GENERAL_ERROR,
          error: 'Can not start new game.',
        });
        return;
      }
    }

    console.log('Game started', response.session);
    console.log('details', response.game.language, response.game.word);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { word, ...game } = response.game;
    // deliver in progress session
    res.status(StatusCodes.OK).json({
      session: response.session,
      game,
    });
  }
});

const assureNextAttemptAllowed = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { session, guess } = req.query as TNextAttemptQuery;

  if (!session) {
    // shows over
    res.status(StatusCodes.BAD_REQUEST).json({
      code: ErrorCodes.SESSION_ERROR,
      error: 'Invalid session id',
    });
    return;
  }
  if (!guess) {
    // shows over
    res.status(StatusCodes.BAD_REQUEST).json({
      code: ErrorCodes.PARAMS_ERROR,
      error: 'Missing "guess" parameter',
    });
    return;
  }

  // grab game data
  const gameSession = gameSessions.get(session);
  if (!gameSession) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.SESSION_NO_GAME_ERROR,
      error: 'Game for that session does not exist.',
    });
    return;
  }

  if (guess.length !== gameSession!.game.word_length) {
    // shows over
    res.status(StatusCodes.BAD_REQUEST).json({
      code: ErrorCodes.PARAMS_ERROR,
      error: `Param "guess" has invalid length, allowed is ${gameSession!.game.word_length}`,
    });
    return;
  }

  if (gameSession.game.finished) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.SESSION_GAME_FINISHED_ERROR,
      error: 'Game for that session is already finished.',
    });
    return;
  }

  // good
  next();
};

router.get(
  '/next-attempt',
  assureNextAttemptAllowed,
  async (req: Request, res: Response) => {
    const { session, guess } = req.query as Required<TNextAttemptQuery>;

    // grab game data
    const gameSession = gameSessions.get(session)!;

    if (gameSession.game.attempt === 0) {
      // start time from the first word guess
      gameSession.game.timestamp_start = `${new Date().getTime()}`;
    }

    // isCorrectWord
    const isCorrect = await isCorrectWord(
      guess,
      gameSession.game.language,
      gameSession.game.word_length,
    );
    if (!isCorrect.validWord) {
      // reject the word
      if (gameSession.game.language !== 'en') {
        // TODO implement for polish when dictionary will contain > 1000 words
        // log the word, it is possible that it is correct but missing from dictionary
        console.log('LOG NEW WORD:', gameSession.session, isCorrect);
        try {
          await logUnknownWord({
            word: guess,
            language: gameSession.game.language,
            length: gameSession.game.word_length,
          });
        } catch (error) {
          console.error(error);
        }
      } else {
        // english has external validation
        // shows over
        res.status(StatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.INVALID_WORD,
          error: isCorrect.error,
        });
        return;
      }
    }

    // validate guess attempt
    const guessUpr = guess.toLocaleUpperCase();
    const guessed = guessUpr === gameSession.game.word;
    const validationResult = validateWord(
      guessUpr.split(''),
      gameSession.game.word.split(''),
      guessed,
    );

    // process game params
    gameSession.game.attempt += 1;
    gameSession.game.guessed = guessed;

    gameSession.game.finished =
      guessed || gameSession.game.attempt === gameSession.game.max_attempts;

    gameSession.game.state.push({
      validated: validationResult.validated,
      word: guessUpr.split(''),
    });

    if (gameSession.game.finished) {
      gameSession.game.timestamp_finish = `${new Date().getTime()}`;
    }

    // update local state
    gameSessions.set(session, gameSession);

    // send response
    if (gameSession.game.finished) {
      if (gameSession.game.guessed) {
        const timePlayed =
          Number(gameSession.game.timestamp_finish) -
          Number(gameSession.game.timestamp_start);
        const score = calculateScore(
          true,
          gameSession.game.attempt,
          timePlayed,
        );
        gameSession.game.score = score;
      }

      res.status(StatusCodes.OK).json(gameSession);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { word, ...game } = gameSession.game;
      res.status(StatusCodes.OK).json({
        session: gameSession.session,
        game,
      });
    }
  },
);

router.get('/game-session', async (req: Request, res: Response) => {
  const { session } = req.query as TSessionQuery;
  if (!session) {
    // shows over
    res.status(StatusCodes.BAD_REQUEST).json({
      code: ErrorCodes.SESSION_ERROR,
      error: 'Invalid session id',
    });
    return;
  }

  const gameSession = gameSessions.get(session);

  if (!gameSession) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.SESSION_NO_GAME_ERROR,
      error: 'Game for that session does not exist.',
    });
    return;
  }

  // send response
  if (gameSession.game.finished) {
    res.status(StatusCodes.OK).json(gameSession);
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { word, ...game } = gameSession.game;
    res.status(StatusCodes.OK).json({
      session: gameSession.session,
      game,
    });
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

  const result = await isCorrectWord(word, language, WORD_LENGTH);

  res.status(StatusCodes.OK).json(result);
});

export default router;
