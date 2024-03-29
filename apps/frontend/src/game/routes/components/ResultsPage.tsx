import { Location, useLocation, useNavigate } from 'react-router-dom';
import {
  TGameRecord,
  TGameSession,
  TGameSessionFinished,
} from '@repo/backend-types';
import { displayTime } from '@repo/utils';
import { useLanguage } from '../../../i18n';
import { EPaths, getResultsPath } from '../enums';
import { useCallback } from 'react';
import { GameLanguage } from '../../language';
import Stars from '../../Stars';
import { HighScoreLabel } from '../../HighScoreLabel';

import './ResultsPage.scss';

export const ResultsPage = () => {
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
  } =
    gameSession.game ||
    ({
      score: 0,
      highest: {},
      attempt: 0,
      word: '',
      language: '',
      timestamp_start: '0',
      finished: false,
      guessed: false,
      word_length: 5,
      state: [],
      max_attempts: 0,
    } as TGameRecord);
  const highest = gameSession.highest;
  const highId = `${language}:${word_length}`;
  const win = location.pathname === getResultsPath('win');

  const playTimeMs = finished
    ? Number((gameSession.game! as TGameSessionFinished).timestamp_finish) -
      Number(timestamp_start)
    : 0;

  const playTime = playTimeMs > 0 ? displayTime(playTimeMs) : '';

  const handleAction = useCallback(
    (action: 'again' | 'quit') => () => {
      if (action === 'quit') {
        navigate(EPaths.ROOT, { replace: true });
      }
      if (action === 'again') {
        navigate(EPaths.GAME, {
          replace: true,
          state: gameSession.session,
        });
      }
    },
    [gameSession.session, navigate],
  );
  // new high score
  const showHighScore =
    highest && highest[highId] && score > highest[highId].score;

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

export function Component() {
  return <ResultsPage />;
}

Component.displayName = 'LazyResultsPage';
