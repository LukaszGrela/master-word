import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { useImmer } from 'use-immer';
import { TGameSession } from '@repo/backend-types';
import { GameContext } from './GameContext';
import { IGameContext } from './types';
import {
  TErrorResponse,
  getInit,
  getNextAttempt,
  toErrorResponse,
} from '../../api';
import { ATTEMPTS, WORD_LENGTH } from '../constants';

const SESSION_NOT_SET = 'session-not-set' as const;
export const GameProvider: FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TErrorResponse | undefined>();

  const [gameData, setGameData] = useImmer<
    TGameSession & Pick<IGameContext, 'language' | 'maxAttempts' | 'wordLength'>
  >({
    session: SESSION_NOT_SET,
    language: 'pl',
    maxAttempts: ATTEMPTS,
    wordLength: WORD_LENGTH,
  });

  const initBusy = useRef<boolean>(false);
  const init = useCallback(
    (
      language: string,
      maxAttempts: number,
      wordLength: number,
      session?: string,
    ) => {
      if (initBusy.current === false) {
        initBusy.current = true;
        setError(undefined);
        setLoading(true);
        setGameData((draft) => {
          draft.language = language;
          draft.maxAttempts = maxAttempts;
          draft.wordLength = wordLength;
        });
        getInit({
          language,
          maxAttempts,
          session,
          wordLength,
        })
          .then((gameSession) => {
            setGameData((draft) => {
              draft.session = gameSession.session;
              draft.game = gameSession.game;
              if (gameSession.highest) {
                draft.highest = gameSession.highest;
              } else {
                draft.highest = undefined;
              }
              if (gameSession.game) {
                draft.wordLength = gameSession.game.word_length;
                draft.maxAttempts = gameSession.game.max_attempts;
                draft.language = gameSession.game.language;
              }
            });
            setLoading(false);
          })
          .catch((error: unknown) => {
            // abort controller errors are ok
            if (!(error instanceof DOMException)) {
              // others are logged
              setError(toErrorResponse(error as Error));
              setLoading(false);
            }
          })
          .finally(() => {
            initBusy.current = false;
          });
      }
    },
    [setGameData],
  );

  const guessBusy = useRef<boolean>(false);
  const guess = useCallback(
    (word: string) => {
      if (
        gameData.session !== SESSION_NOT_SET &&
        guessBusy.current === false &&
        initBusy.current === false
      ) {
        guessBusy.current = true;
        setError(undefined);

        setLoading(true);
        getNextAttempt({
          guess: word.toLocaleUpperCase(),
          session: gameData.session,
        })
          .then((gameState) => {
            setGameData((draft) => {
              if (!draft.game) {
                draft.game = gameState.game;
              } else {
                if (gameState.game.finished) {
                  draft.highest = gameState.highest;
                  draft.game = gameState.game;
                } else {
                  const { attempt, state } = gameState.game;
                  if (attempt === 1) {
                    draft.game.timestamp_start = gameState.game.timestamp_start;
                  }
                  draft.game.attempt = attempt;
                  const row = draft.game.state.at(attempt - 1);
                  const sourceRow = state.at(attempt - 1);
                  if (row && sourceRow) {
                    // update only current state
                    row.word = sourceRow.word;
                    row.validated = sourceRow.validated;
                  }
                }
              }
            });
            setLoading(false);
          })
          .catch((error: unknown) => {
            // abort controller errors are ok
            if (!(error instanceof DOMException)) {
              // others are logged
              const enrichedError = toErrorResponse(error as Error);
              if (enrichedError.code === 6 /* INVALID_WORD */) {
                enrichedError.details = word;
              }
              setError(enrichedError);
              setLoading(false);
            }
          })
          .finally(() => {
            guessBusy.current = false;
          });
      }
    },
    [gameData.session, setGameData],
  );

  const value = useMemo((): IGameContext => {
    return {
      loading,
      init,
      guess,

      error,

      language: gameData.language,
      maxAttempts: gameData.maxAttempts,
      wordLength: gameData.wordLength,
      game: gameData?.game,
      highest: gameData?.highest,
      session:
        gameData.session === SESSION_NOT_SET ? undefined : gameData.session,
    };
  }, [
    error,
    gameData?.game,
    gameData?.highest,
    gameData.language,
    gameData.maxAttempts,
    gameData.session,
    gameData.wordLength,
    guess,
    init,
    loading,
  ]);
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
