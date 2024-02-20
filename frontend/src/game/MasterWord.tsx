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
import t, { getLoadedLanguage, loadTranslation } from '../i18n';
import { noop } from '../utils/noop';

import './MasterWord.css';
import { AppStorage } from '../utils/localStorage';

const emptyGameState = createGameState(ATTEMPTS, WORD_LENGTH);

const MasterWord: FC<IMasterWord> = () => {
  const bowser = getBowserDetails();
  const urlSession = getUrlSearch().get('session');

  const [, setError] = useState<TErrorResponse | null>(null);
  const [gameState, setGameState] = useState<TGameState>('init');
  const [gameSession, setGameSession] = useState<TGameSessionRecord | null>(
    null
  );

  const session = gameSession?.session ?? urlSession ?? undefined;
  const wordLength = gameSession?.game?.word_length ?? WORD_LENGTH;
  const attempts = gameSession?.game?.max_attempts ?? ATTEMPTS;
  const game = gameSession?.game?.state ?? emptyGameState.concat();
  const attempt = gameSession?.game?.attempt ?? 0;

  const startGame = useCallback(() => {
    setGameState('init');
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const getInitSync = () => {
      console.log('getInitSync', session);
      getInit({
        language: 'pl',
        signal: controller.signal,
        session /* continue the same session game if exists */,
      })
        .then((sessionRecord) => {
          setGameSession(sessionRecord);
          setGameState('running');
        })
        .catch((error): void => {
          // handle custom error
          if (guardTErrorResponse(error)) {
            // if provided session is invalid, discard it and try again
            if (error.code === 2 /* ErrorCodes.SESSION_ERROR */) {
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

    if (gameState === 'init') {
      getInitSync();
    }

    return () => {
      controller.abort();
    };
  }, [gameState, session, urlSession]);

  const handleWordCommit = useCallback(
    (guess: string) => {
      const word = guess.toLocaleUpperCase();

      if (!gameSession) return;

      setGameState('pending');

      getNextAttempt({
        guess: word,
        session: gameSession.session,
      })
        .then((response) => {
          setGameSession(response);
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
            }
          } else if (error instanceof DOMException) {
            // abort error is OK (abort is never ok)
            return;
          }
          // no action for other errors
          setGameState('running');
        });
    },
    [gameSession]
  );

  const handlePanelAction = useCallback(
    (action: TClickAction, ...rest: unknown[]) => {
      if (action === 'start') {
        startGame();
      }
      if (action === 'guess') {
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
  >(getLoadedLanguage());

  const handleTranslationChange = (language: TSupportedLanguages): void => {
    const used = getLoadedLanguage();
    if (language !== used) {
      loadTranslation(language)
        .then(() => {
          AppStorage.getInstance().setItem('ui-language', language);
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
        <p className='read-the-docs'>
          {bowser.platform.type !== 'mobile' && t('main-desktop-info')}
          {bowser.platform.type === 'mobile' && t('main-mobile-info')}
        </p>
      )}
      <div className='game-board'>
        <Board
          columns={wordLength}
          rows={attempts}
          key={gameState === 'init' ? gameState : 'running'}
        >
          {game.map((gameAttempt, index) => {
            return (
              <Word
                mobile={bowser.platform.type === 'mobile'}
                commit={handleWordCommit}
                active={index === attempt && gameState === 'running'}
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

        {showInputModal && (
          <InputGuessPanel
            initWord={game[attempt].word.join('')}
            maxLength={wordLength}
            onClose={handlePanelAction}
          />
        )}
      </div>
      <p className='read-the-docs'>
        GrelaDesign (c) 2024 [v{import.meta.env.VITE_VERSION}]
      </p>
      <div className='translation'>
        <span className='hidden'>{t('translation-info-sr')}</span>
        <button
          title={t('translation-button-polish')}
          className={classNames(
            'translation-btn',
            selectedTranslation === 'pl' && 'selected'
          )}
          onClick={() => {
            handleTranslationChange('pl');
          }}
        >
          🇵🇱
        </button>
        <button
          title={t('translation-button-english')}
          className={classNames(
            'translation-btn',
            selectedTranslation === 'en' && 'selected'
          )}
          onClick={() => {
            handleTranslationChange('en');
          }}
        >
          🇺🇸
        </button>
      </div>
    </div>
  );
};

export default MasterWord;
