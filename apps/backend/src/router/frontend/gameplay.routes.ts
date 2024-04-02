import { Router, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { v4 as uuid } from 'uuid';
import { ErrorCodes } from '@repo/backend-types/enums';
import { getConfiguration } from '../../db/crud/Config.crud';
import { TInitQuery, TNextAttemptQuery } from '../types';
import {
  calculateScore,
  isWordCorrect,
  randomWord,
  resetGameSession,
  validateWord,
} from '../helpers';
import { MAX_ATTEMPTS, WORD_LENGTH } from '../../constants';
import {
  createNewGameSession,
  findSession,
} from '../../db/crud/GameSession.crud';
import { logUnknownWord } from '../backend/dictionary/helpers';
import { TGameSession } from '@repo/backend-types';

/**
 * Game play has following endpoints
 *
 * GET /game/init - initiate new game for new or existing session
 * GET /game/guess - attempt to guess word
 *
 */
const router = Router();

const canInitSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { language = 'pl' } = req.query as TInitQuery;
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

  next();
};

interface IMasterWordRequest extends Request {
  masterWord?: {
    session?: string;
  };
}

/**
 * Initiate new game session if needed
 */
const initNewSession = async (
  req: IMasterWordRequest,
  res: Response,
  next: NextFunction,
) => {
  const { session, language = 'pl', ...rest } = req.query as TInitQuery;
  const wordLength = WORD_LENGTH;
  const maxAttempts = Number(rest.maxAttempts || MAX_ATTEMPTS);

  if (!session) {
    // no session, start from scratch
    try {
      const word = await randomWord(language, wordLength);
      const id = uuid();

      await createNewGameSession(id, language, word.word, maxAttempts);

      // new session id saved in request
      req.masterWord = {
        ...(req.masterWord || {}),
        session: id,
      };
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: ErrorCodes.GENERAL_ERROR,
        error: 'Can not start new game.',
      });
      return;
    }
  } else {
    // session id given, search for a game
    try {
      const gameSession = await findSession(session);
      if (!gameSession) {
        // session doesnt exist
        res.status(StatusCodes.BAD_REQUEST).json({
          code: ErrorCodes.SESSION_ERROR,
          error: 'Invalid session id',
        });
        return;
      }
      // fill game session
      if (!gameSession.game) {
        const word = await randomWord(language, wordLength);
        gameSession.game = resetGameSession(language, word.word, maxAttempts);
        await gameSession.save();
      }
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: ErrorCodes.GENERAL_ERROR,
        error: 'Can not start new game.',
      });
      return;
    }
  }

  // session created or exist
  next();
};

/**
 * Starts new game or continues the old, not finished one.
 */
const initNewGame = async (req: IMasterWordRequest, res: Response) => {
  const { session } = req.query as TInitQuery;

  const sessionId = session || req.masterWord?.session;
  if (sessionId) {
    try {
      // get game session
      const gameSession = await findSession(sessionId);
      if (!gameSession) throw new Error('Could not find game session.');

      if (!gameSession.game) {
        throw new Error('The game should be initialised.');
      }

      if (gameSession.game.finished) {
        // this should also not happen
        // final guess will clear the game
        throw new Error('The game was already finished.');
      }

      // game not finished carry on with existing
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { word, ...game } = gameSession.toJSON<TGameSession>().game!;
      // deliver in progress session
      res.status(StatusCodes.OK).json({
        session: gameSession.session,
        game,
      });
      return;
    } catch (error) {
      console.log(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: ErrorCodes.GENERAL_ERROR,
        error: 'Can not start new game.',
      });
      return;
    }
  } else {
    console.log('Missing session identifier');
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.GENERAL_ERROR,
      error: 'Can not start new game.',
    });
    return;
  }
};

router.get('/init', canInitSession, initNewSession, initNewGame);

const assureNextAttemptAllowed = async (
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

  // get game session
  const gameSession = await findSession(session);

  if (!gameSession) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.SESSION_NO_GAME_ERROR,
      error: 'Game for that session does not exist.',
    });
    return;
  }
  if (!gameSession.game) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.SESSION_NO_GAME_ERROR,
      error: 'No game initialised for that session.',
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

const nextAttempt = async (req: Request, res: Response, next: NextFunction) => {
  const { session, guess } = req.query as Required<TNextAttemptQuery>;

  try {
    const gameSession = await findSession(session);
    if (!gameSession) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: ErrorCodes.SESSION_NO_GAME_ERROR,
        error: 'Game for that session does not exist.',
      });
      return;
    }
    if (!gameSession.game) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: ErrorCodes.SESSION_NO_GAME_ERROR,
        error: 'No game initialised for that session.',
      });
      return;
    }

    if (gameSession.game.attempt === 0) {
      // start time from the first word guess
      gameSession.game.timestamp_start = `${new Date().getTime()}`;
      await gameSession.save();
    }

    // isWordCorrect
    const isCorrect = await isWordCorrect(
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
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.GENERAL_ERROR,
      error: 'Error while guessing.',
    });
    return;
  }

  next();
};
const checkFinished = async (req: Request, res: Response) => {
  const { session, guess } = req.query as Required<TNextAttemptQuery>;

  try {
    const gameSession = await findSession(session);
    if (!gameSession) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: ErrorCodes.SESSION_NO_GAME_ERROR,
        error: 'Game for that session does not exist.',
      });
      return;
    }
    if (!gameSession.game) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        code: ErrorCodes.SESSION_NO_GAME_ERROR,
        error: 'No game initialised for that session.',
      });
      return;
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
    const language = gameSession.game.language;
    const wordLength = gameSession.game.word_length;
    const highScoreId = `${language}:${wordLength}`;
    const highScorePath = `highest.${highScoreId}`;
    const copyHighScore = gameSession.toJSON<TGameSession>().highest;
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

        // update highscore after copying highscore object (so comparison of highscore is working:)
        if (!gameSession.highest) {
          gameSession.highest = {};
        }

        if (gameSession.get(highScorePath)) {
          // compare and update
          const highscore = gameSession.get(highScorePath);
          if (
            score > highscore.score ||
            (score === highscore.score && timePlayed >= highscore.timeMs)
          ) {
            // store updated score
            gameSession.set(highScorePath, {
              attempts: gameSession.game.attempt,
              score,
              timeMs: timePlayed,
              language,
              length: wordLength,
            });
          }
        } else {
          // store new highscore
          gameSession.set(highScorePath, {
            attempts: gameSession.game.attempt,
            score,
            timeMs: timePlayed,
            language,
            length: wordLength,
          });
        }
        //
      }
      // archive game object
      const game = gameSession.toJSON<TGameSession>().game;

      console.warn('TODO: implement archiving the game object', game);

      const response = gameSession.toJSON<TGameSession>();

      // clear game object
      gameSession.game = undefined;

      await gameSession.save();

      res.status(StatusCodes.OK).json({
        ...response,
        // use a copy so it has one behind state, so frontend can compare
        highest: copyHighScore,
      });
    } else {
      // continue with the game
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { word, ...game } = gameSession.toJSON<TGameSession>().game!;

      await gameSession.save();

      res.status(StatusCodes.OK).json({
        session: gameSession.session,
        game,
      });
    }
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.GENERAL_ERROR,
      error: 'Error while finishing attempt.',
    });
    return;
  }
};
router.get('/guess', assureNextAttemptAllowed, nextAttempt, checkFinished);

/*
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
  if (!gameSession.game) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.SESSION_NO_GAME_ERROR,
      error: 'No game initialised for that session.',
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
*/

export default router;
