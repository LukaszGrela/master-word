import { Location, useLocation, useNavigate } from 'react-router-dom';
import {
  TGameRecord,
  TGameSession,
  TGameSessionFinished,
} from '@repo/backend-types';
import { displayTime, EStorageKeys, AppStorage } from '@repo/utils';
import { useLanguage } from '../../../i18n';
import { EPaths, getResultsPath } from '../enums';
import { useCallback } from 'react';
import { GameLanguage } from '../../language';
import Stars from '../../Stars';
import { HighScoreLabel } from '../../HighScoreLabel';

import './ResultsPage.scss';

const defaultGameRecord: TGameRecord = {
  score: 0,
  attempt: 0,
  word: '',
  language: '',
  timestamp_start: '0',
  finished: false,
  guessed: false,
  word_length: 5,
  state: [],
  max_attempts: 0,
};

export const ResultsPage = () => {
  const storage = AppStorage.getInstance();
  const navigate = useNavigate();
  const { getUIText: t } = useLanguage();
  const location = useLocation() as Location<TGameSession>;
  const gameSession = location.state;
  const {
    score,
    attempt,
    word,
    timestamp_start,
    finished,
    word_length,
    language,
  } = gameSession.game || defaultGameRecord;
  const highest = gameSession.highest;
  const highId = `${language}:${word_length}`;
  const win = location.pathname === getResultsPath('win');

  const playTimeMs = finished
    ? Number((gameSession.game! as TGameSessionFinished).timestamp_finish) -
      Number(timestamp_start)
    : 0;

  const playTime = playTimeMs > 0 ? displayTime(playTimeMs) : '';

  const handleAction = useCallback(
    (action: 'again' | 'quit' | 'save-session') => () => {
      if (action === 'save-session') {
        storage.setItem(EStorageKeys.GAME_SESSION, gameSession.session);
        navigate(EPaths.ROOT, { replace: true });
      }
      if (action === 'quit') {
        storage.removeItem(EStorageKeys.GAME_SESSION);
        navigate(EPaths.ROOT, { replace: true });
      }
      if (action === 'again') {
        navigate(EPaths.GAME, {
          replace: true,
          state: gameSession.session,
        });
      }
    },
    [gameSession.session, navigate, storage],
  );

  // new high score
  const showHighScore =
    !highest || !highest[highId]
      ? true
      : highest && highest[highId] && score > highest[highId].score;

  return (
    <div className="results">
      <h2>
        {win && t('result-win', { attempt })}
        {!win && t('result-lose', { wordToGuess: word })}
      </h2>

      <div className="score-container">
        <Stars score={score} />
        {showHighScore && <HighScoreLabel />}
      </div>

      {playTimeMs > 0 && (
        <p className="playtime">{t('result-playtime', { playTime })}</p>
      )}

      <GameLanguage />

      <div className="button-row">
        <button onClick={handleAction('save-session')} className={'secondary'}>
          {t('result-save-session-button')}
        </button>
        <button onClick={handleAction('quit')} className={'secondary'}>
          {t('result-quit-button')}
        </button>
        <button onClick={handleAction('again')} className={'primary'}>
          {t('result-again-button')}
        </button>
      </div>
    </div>
  );
};

/* v8 ignore start */
export function Component() {
  return <ResultsPage />;
}

Component.displayName = 'LazyResultsPage';
/* v8 ignore sstoptart */
