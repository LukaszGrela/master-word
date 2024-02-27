import { FC, useCallback, useEffect, useState } from 'react';
import { ATTEMPTS, Board, WORD_LENGTH } from './index';
import { IMasterWord, TGameState } from './types';
import { classNames } from '../utils/classNames';
import Word from './word/Word';
import { InputGuessPanel, ResultPanel } from './panel';
import { TClickAction } from './panel/types';
import { getBowserDetails } from '../utils/bowser';
import {
  getInit,
  getNextAttempt,
  TErrorResponse,
  TGameSessionRecord,
  guardTErrorResponse,
  TSupportedLanguages,
} from '../api';
import { createGameState } from '../api/utils';
import { getUrlSearch } from '../utils/getUrlSearch';
import { noop } from '../utils/noop';
import { AppStorage } from '../utils/localStorage';
import { LanguageSelector } from './language';
import { EStorageKeys } from '../utils/localStorage/enums';
import { useLanguage } from '../i18n';

import './MasterWord.css';

const emptyGameState = createGameState(ATTEMPTS, WORD_LENGTH);

const MasterWord: FC<IMasterWord> = () => {
  const { getUIText: t, loadedLanguage, loadTranslation } = useLanguage();

  const storage = AppStorage.getInstance();
  const bowser = getBowserDetails();

  const urlSession = getUrlSearch().get('session');

  const [error, setError] = useState<
    (TErrorResponse & { details?: string }) | null
  >(null);
  const [gameState, setGameState] = useState<TGameState>('init');
  const [gameSession, setGameSession] = useState<TGameSessionRecord | null>(
    null
  );

  const session = gameSession?.session ?? urlSession ?? undefined;
  const wordLength = gameSession?.game?.word_length ?? WORD_LENGTH;
  const attempts = gameSession?.game?.max_attempts ?? ATTEMPTS;
  const game = gameSession?.game?.state ?? emptyGameState.concat();
  const attempt = gameSession?.game?.attempt ?? 0;
  // game word language
  const language = (storage.getItem('word-language') ||
    storage.getItem('ui-language') ||
    'pl') as TSupportedLanguages;

  const startGame = useCallback(() => {
    setGameState('start');
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const getInitSync = () => {
      console.log('getInitSync', session, language);

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
          // handle custom error
          if (guardTErrorResponse(error)) {
            // if provided session is invalid, discard it and try again
            if (error.code === 2) {
              setGameSession(null); // clear session
              if (session === urlSession) {
                // session in the url, reload with new url
                const url = new URL(window.location.href);
                url.searchParams.delete('session');
                window.location.assign(url);
              }
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
  }, [gameState, language, session, urlSession]);

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
            response.game.language
          );
          //
          if (!response.game.finished) {
            setGameState('running');
          } else {
            setGameState(response.game.guessed ? 'win' : 'lose');
          }
        })
        .catch((error) => {
          console.log(error);
          // session error is a showstopper here
          if (guardTErrorResponse(error)) {
            // if provided session is invalid, discard it and try again
            if (
              error.code === 2 /* ErrorCodes.SESSION_ERROR */ ||
              error.code === 3 /* ErrorCodes.GENERAL_ERROR */
            ) {
              setGameSession(null); // clear session
              setGameState('init');
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
    [gameSession, t, bowser.platform.type]
  );

  const handlePanelAction = useCallback(
    (action: TClickAction, ...rest: unknown[]) => {
      if (action === 'start') {
        // from result panel
        startGame();
      }
      if (action === 'guess') {
        // from input panel
        const [guess] = rest as string[];

        setShowInputModal(false);
        handleWordCommit(guess);
      }
    },
    [handleWordCommit, startGame]
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

  const [selectedTranslation, setTranslation] = useState<
    TSupportedLanguages | undefined
  >(loadedLanguage);

  const handleTranslationChange = (language: TSupportedLanguages): void => {
    const used = loadedLanguage;
    if (language !== used) {
      loadTranslation(language)
        .then(() => {
          AppStorage.getInstance().setItem(EStorageKeys.UI_LANGUAGE, language);
          setTranslation(language);
        })
        .catch(noop);
    }
  };

  return (
    <div className={classNames('master-word', 'game', gameState)}>
      <div className='title'>
        <h1>{t('main-title')}</h1>
        <h4>{t('main-subtitle')}</h4>
      </div>
      {gameState !== 'init' && (
        <>
          <p className='read-the-docs'>
            {bowser.platform.type !== 'mobile' && t('main-desktop-info')}
            {bowser.platform.type === 'mobile' && t('main-mobile-info')}
          </p>
          <div className='legend'>
            <span className='incorrect'>{t('main-legend-incorrect')}</span>
            <span className='misplaced'>{t('main-legend-misplaced')}</span>
            <span className='correct'>{t('main-legend-correct')}</span>
          </div>
        </>
      )}
      <div className='game-board'>
        <Board
          className={language}
          columns={wordLength}
          rows={attempts}
          key={gameState === 'init' ? gameState : 'running'}
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

        <ResultPanel
          gameState={gameState}
          gameSession={gameSession?.game}
          onClick={handlePanelAction}
        />

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
      <p className='read-the-docs'>
        GrelaDesign (c) 2024 [v{import.meta.env.VITE_VERSION}]
      </p>
      <LanguageSelector
        language={selectedTranslation}
        onClick={handleTranslationChange}
      />
    </div>
  );
};

export default MasterWord;
