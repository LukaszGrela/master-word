import { useCallback, useEffect, useState } from 'react';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import {
  TErrorResponse,
  TGameSessionRecord,
  TSupportedLanguages,
  getInit,
  getNextAttempt,
  guardTErrorResponse,
} from '../../../api';
import { useLanguage } from '../../../i18n';
import { getBowserDetails } from '../../../utils/bowser';
import { ATTEMPTS, Board, WORD_LENGTH } from '../../index';
import { InputGuessPanel } from '../../panel';
import { TGameState } from '../../types';
import Word from '../../word/Word';
import { createGameState } from '../../../api/utils';
import { AppStorage } from '../../../utils/localStorage';
import { EStorageKeys } from '../../../utils/localStorage/enums';
import { TClickAction } from '../../panel/types';
import { getResultsPath } from '../enums';
import './GamePage.scss';
import Spinner from '../../Spinner/Spinner';
import { Timer } from '../../Timer';

const emptyGameState = createGameState(ATTEMPTS, WORD_LENGTH);

export const GamePage = () => {
  const location = useLocation() as Location<string | undefined>;
  const navigate = useNavigate();
  const storage = AppStorage.getInstance();
  const bowser = getBowserDetails();
  const { getUIText: t } = useLanguage();

  const [error, setError] = useState<
    (TErrorResponse & { details?: string }) | null
  >(null);
  const [gameState, setGameState] = useState<TGameState>('start');
  const [gameSession, setGameSession] = useState<TGameSessionRecord | null>(
    null,
  );
  const urlSession = location.state;
  const session = gameSession?.session ?? urlSession ?? undefined;
  const wordLength = gameSession?.game?.word_length ?? WORD_LENGTH;
  const attempts = gameSession?.game?.max_attempts ?? ATTEMPTS;
  const game = gameSession?.game?.state ?? emptyGameState.concat();
  const attempt = gameSession?.game?.attempt ?? 0;

  // game word language
  const language = (storage.getItem('word-language') ||
    storage.getItem('ui-language') ||
    'pl') as TSupportedLanguages;

  const clearSession = useCallback(() => {
    if (location.state && location.state === session) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
      const { usr, ...rest } = window.history.state;
      window.history.replaceState(
        {
          ...rest,
        },
        '',
      );
    }
    if (session === urlSession) {
      // session in the url, reload with new url
      const url = new URL(window.location.href);
      url.searchParams.delete('session');
      window.location.assign(url);
    }

    setGameSession(null); // clear session
  }, [location.state, session, urlSession]);

  useEffect(() => {
    const controller = new AbortController();
    const getInitSync = () => {
      getInit({
        language,
        signal: controller.signal,
        session,
      })
        .then((sessionRecord) => {
          setGameSession(sessionRecord);
          setGameState('running');
        })
        .catch((error): void => {
          console.error(error);
          // handle custom error
          if (guardTErrorResponse(error)) {
            // if provided session is invalid, discard it and try again
            if (error.code === 2) {
              clearSession();
              setGameState('start');
              return;
            } else {
              setError(error);
            }
          } else if (error instanceof DOMException) {
            // abort error is OK
            return;
          } else {
            setError({ code: -1, error: (error as Error).message });
          }
          setGameState('error');
        });
    };

    if (gameState === 'start') {
      getInitSync();
    }

    return () => {
      controller.abort();
    };
  }, [clearSession, gameState, language, session]);

  const handleWordCommit = useCallback(
    (guess: string) => {
      const word = guess.toLocaleUpperCase();

      // reset error
      setError(null);

      if (!gameSession) return;

      setGameState('pending');

      getNextAttempt({
        guess: word,
        session: gameSession.session,
      })
        .then((response) => {
          setGameSession(response);
          // make sure language is not changed
          AppStorage.getInstance().setItem(
            EStorageKeys.GAME_LANGUAGE,
            response.game.language,
          );
          //
          if (!response.game.finished) {
            setGameState('running');
          } else {
            // navigate to result page
            navigate(getResultsPath(response.game.guessed ? 'win' : 'lose'), {
              // no back to game
              replace: true,
              state: response,
            });
          }
        })
        .catch((error) => {
          // session error is a showstopper here
          if (guardTErrorResponse(error)) {
            // if provided session is invalid, discard it and try again
            if (
              error.code === 2 /* ErrorCodes.SESSION_ERROR */ ||
              error.code === 3 /* ErrorCodes.GENERAL_ERROR */
            ) {
              clearSession();
              setGameState('start');
              return;
            } else if (error.code === 6 /* INVALID_WORD */) {
              setError({
                code: error.code,
                error: t('main-error-invalid-word'),
                details: guess,
              });

              // if it is a mobile open the input modal
              if (bowser.platform.type === 'mobile') {
                setShowInputModal(true);
              }
            }
          } else if (error instanceof DOMException) {
            // abort error is OK (abort is never ok)
            return;
          }
          // no action for other errors
          setGameState('running');
        });
    },
    [gameSession, navigate, clearSession, t, bowser.platform.type],
  );

  const [showInputModal, setShowInputModal] = useState(false);
  useEffect(() => {
    const tapHandler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains('board')) {
        setShowInputModal(true);
      }
    };

    if (bowser.platform.type === 'mobile' && gameState === 'running') {
      document.addEventListener('click', tapHandler);
    }

    return () => {
      document.removeEventListener('click', tapHandler);
    };
  }, [bowser.platform.type, gameState]);

  const handlePanelAction = useCallback(
    (action: TClickAction, ...rest: unknown[]) => {
      if (action === 'guess') {
        // from input panel
        const [guess] = rest as string[];

        setShowInputModal(false);
        handleWordCommit(guess);
      }
    },
    [handleWordCommit],
  );

  return (
    <div className="game-page">
      <div className="header">
        <h1>{t('main-title')}</h1>
        <Timer
          startMs={
            gameSession && gameSession.game.attempt > 0
              ? Number(gameSession.game.timestamp_start)
              : undefined
          }
        />
      </div>
      <p className="read-the-docs">
        {bowser.platform.type !== 'mobile' && t('main-desktop-info')}
        {bowser.platform.type === 'mobile' && t('main-mobile-info')}
      </p>
      <div className="legend">
        <span className="incorrect">{t('main-legend-incorrect')}</span>
        <span className="misplaced">{t('main-legend-misplaced')}</span>
        <span className="correct">{t('main-legend-correct')}</span>
      </div>
      <div className="game-board">
        <Board
          className={language}
          columns={wordLength}
          rows={attempts}
          key={gameState === 'start' ? gameState : 'running'}
        >
          {game.map((gameAttempt, index) => {
            const active = index === attempt && gameState === 'running';
            return (
              <Word
                mobile={bowser.platform.type === 'mobile'}
                commit={handleWordCommit}
                active={active}
                invalid={!!error && error.code === 6 && active}
                wordLength={wordLength}
                word={gameAttempt.word.join('')}
                id={`${index}`}
                key={`${index}`}
                validated={gameAttempt.validated}
                className={index < attempt ? 'inactive' : undefined}
              />
            );
          })}
        </Board>
        {(gameState === 'pending' || gameState === 'start') && (
          <h2 className="loading panel">
            <Spinner />
            <span>{t('loading')}</span>
          </h2>
        )}
        {!gameSession?.game.finished && (
          <InputGuessPanel
            show={showInputModal}
            initWord={game[attempt].word.join('')}
            maxLength={wordLength}
            onClose={handlePanelAction}
            error={error}
          />
        )}
      </div>
    </div>
  );
};
