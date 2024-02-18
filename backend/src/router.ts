import { Router, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import fs from 'fs/promises';
import { v4 as uuid } from 'uuid';
import { ErrorCodes } from './enums';

const router = Router();

let localDictionary: string[] = [];

type TRandomWordResponse = {
  language: 'pl' | 'en';
  word: string;
  error?: string;
};
type TRandomWordQuery = {
  language: 'pl' | 'en';
  wordLength: number;
};

async function getLocalDictionary(
  language = 'pl',
  wordLength = 5
): Promise<string[]> {
  const file = `dictionaries/${wordLength}/${language}.json`;
  // load file then pick
  try {
    const data = await fs.readFile(file, {
      encoding: 'utf-8',
    });
    return JSON.parse(data) as string[];
  } catch (error) {
    console.log(error);
    return Promise.reject({
      code: ErrorCodes.LOCAL_DICTIONARY_ERROR,
      error: `Can't retrieve dictionary: ${file}.`,
      language,
    });
  }
  //
}

async function getRandomWord(
  language = 'pl',
  wordLength = 5
): Promise<TRandomWordResponse> {
  if (language === 'pl') {
    // localDictionary
    if (!(localDictionary && localDictionary.length > 0)) {
      // load file then pick
      try {
        const data = await getLocalDictionary(language, wordLength);
        localDictionary = data;
      } catch (error) {
        console.log(error);
        return Promise.reject({
          code: ErrorCodes.RANDOM_WORD_ERROR,
          error: "Can't retrieve polish word.",
          language: 'pl',
        });
      }
      //
    }
    // pick
    const word =
      localDictionary[Math.floor(Math.random() * localDictionary.length)];

    return {
      word,
      language: 'pl',
    } as TRandomWordResponse;
  } else {
    // call external API endpoint
    try {
      const result = await fetch(
        'https://words.dev-apis.com/word-of-the-day?random=1'
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
  const { language = 'pl', wordLength = 5 } =
    req.query as unknown as TRandomWordQuery;

  try {
    const randomWordResponse = await getRandomWord(language, wordLength);

    res.status(StatusCodes.OK).json(randomWordResponse);
  } catch (error) {
    res.status(StatusCodes.BAD_REQUEST).json(error);
  }
});

type TIsCorrectWordResponse = {
  word: string;
  validWord: boolean;
  language: 'pl' | 'en';

  error?: string;
};
const isCorrectWord = async (word: string, language: 'pl' | 'en') => {
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
        error: (error as Error).message,
        language,
      };
    }
  } else {
    if (!(localDictionary && localDictionary.length > 0)) {
      // load file then pick
      try {
        const data = await getLocalDictionary(language, 5);
        localDictionary = data;
      } catch (error) {
        console.log(error);
        // something is broken, accept word for game play
        return {
          word,
          validWord: true,
          error: (error as Error).message || (error as any).error,
          language,
        };
      }
      //
    }
    // search for the word
    // dictionary contains lower case words
    if (localDictionary.indexOf(word.toLocaleLowerCase()) !== -1) {
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

// the game
type TSessionQuery = { session?: string };
type TInitQuery = TSessionQuery & { language?: 'pl' | 'en' };

// Wrong - X, Misplaced - M, Correct - C
type TValidationChar = 'X' | 'M' | 'C';
type TGameState = {
  word: string[];
  validated: TValidationChar[];
};

type TGameSessionFinished = {
  finished: true;
  timestamp_finish: string;
};
type TGameSessionIncomplete = {
  finished: false;
};

type TGameSession = {
  language: 'pl' | 'en';

  timestamp_start: string;
  max_attempts: number;
  attempt: number;
  word: string;
  word_length: number;
  state: TGameState[];
  guessed: boolean;
} & (TGameSessionFinished | TGameSessionIncomplete);

type TGameSessionRecord = {
  session: string;
  game: TGameSession;
};

const MAX_ATTEMTPS = 8 as const;
const WORD_LENGTH = 5 as const;
const gameSessions = new Map<string, TGameSessionRecord>();

const resetGameSession = (
  language: 'pl' | 'en',
  word: string
): TGameSession => {
  return {
    language,
    max_attempts: MAX_ATTEMTPS,
    attempt: 0,
    word: word.toLocaleUpperCase(),
    word_length: word.length,
    state: [],
    finished: false,
    guessed: false,
    timestamp_start: `${new Date().getTime()}`,
  };
};

router.get('/init', async (req: Request, res: Response) => {
  const { session, language = 'pl' } = req.query as TInitQuery;

  let response: TGameSessionRecord | undefined;
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
      const word = await getRandomWord(language, WORD_LENGTH);
      const id = uuid();
      response = {
        session: id,
        game: resetGameSession(language, word.word),
      };
      gameSessions.set(id, response);
    } catch (error) {
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
      try {
        const word = await getRandomWord(language, WORD_LENGTH);
        response = {
          ...response,
          game: resetGameSession(response.game.language, word.word),
        };
        // store/update
        gameSessions.set(response.session, response);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          code: ErrorCodes.GENERAL_ERROR,
          error: 'Can not start new game.',
        });
        return;
      }
    }

    const { word, ...game } = response.game;
    // deliver in progress session
    res.status(StatusCodes.OK).json({
      session: response.session,
      game,
    });
  }
});

const validateWord = (
  guess: string[],
  compare: string[],
  isGuessed: boolean
): { guessed: boolean; validated: TValidationChar[] } => {
  const validated: TValidationChar[] = Array.from(Array(compare.length)).map(
    () => (isGuessed ? 'C' : 'X')
  );

  if (!isGuessed) {
    const from = guess.concat();
    const to = compare.concat();
    // green pass
    for (let i = 0; i < from.length; i++) {
      const letter = from[i];

      if (letter === to[i]) {
        validated[i] = 'C';
        from[i] = '';
        to[i] = '';
      }
    }

    // orange pass
    for (let i = 0; i < from.length; i++) {
      const letter = from[i];

      if (letter && to.includes(letter)) {
        validated[i] = 'M';
        from[i] = '';
        const toIndex = to.findIndex((char) => char === letter);
        to[toIndex] = '';
      }
    }
  }

  return {
    guessed: isGuessed,
    validated,
  };
};

type TNextAttemptQuery = TSessionQuery & { guess: string };

router.get('/next-attempt', async (req: Request, res: Response) => {
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
  if (guess.length !== WORD_LENGTH) {
    // shows over
    res.status(StatusCodes.BAD_REQUEST).json({
      code: ErrorCodes.PARAMS_ERROR,
      error: `Param "guess" has invalid length, allowed is ${WORD_LENGTH}`,
    });
    return;
  }

  // grab game data
  const gameSession = gameSessions.get(session);

  if (!gameSession) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.GENERAL_ERROR,
      error: 'Game for that session does not exist.',
    });
    return;
  } else if (gameSession.game.finished) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      code: ErrorCodes.GENERAL_ERROR,
      error: 'Game for that session is already finished.',
    });
  }
  // isCorrectWord
  const isCorrect = await isCorrectWord(guess, gameSession.game.language);
  if (!isCorrect.validWord) {
    // reject the word
    if (gameSession.game.language === 'pl') {
      // TODO implement for polish when dictionary will contain > 1000 words
      // log the word, it is possible that it is correct but missing from dictionary
      console.log('LOG NEW WORD:', isCorrect);
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
    guessed
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
    res.status(StatusCodes.OK).json(gameSession);
  } else {
    const { word, ...game } = gameSession.game;
    res.status(StatusCodes.OK).json({
      session: gameSession.session,
      game,
    });
  }
});

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
      code: ErrorCodes.GENERAL_ERROR,
      error: 'Game for that session does not exist.',
    });
    return;
  }

  // send response
  if (gameSession.game.finished) {
    res.status(StatusCodes.OK).json(gameSession);
  } else {
    const { word, ...game } = gameSession.game;
    res.status(StatusCodes.OK).json({
      session: gameSession.session,
      game,
    });
  }
});

router.post('/validate-word', async (req: Request, res: Response) => {});

export default router;
