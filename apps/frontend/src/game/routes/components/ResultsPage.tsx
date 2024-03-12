import { Location, useLocation, useNavigate } from 'react-router-dom';
import { TGameSessionRecord } from '../../../api';
import { useLanguage } from '../../../i18n';
import { EPaths, getResultsPath } from '../enums';
import { displayTime } from '@repo/utils';
import { useCallback } from 'react';
import { GameLanguage } from '../../language';
import Stars from '../../Stars';

import './ResultsPage.scss';

export const ResultsPage = () => {
  const navigate = useNavigate();
  const { getUIText: t } = useLanguage();
  const location = useLocation() as Location<TGameSessionRecord>;
  const gameSession = location.state;

  const win = location.pathname === getResultsPath('win');

  const playTimeMs = gameSession.game.finished
    ? Number(gameSession.game.timestamp_finish) -
      Number(gameSession.game.timestamp_start)
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

  let score = 0; // out of 3 max
  if (win) {
    score = 0.5; // max attempts
    const { attempt } = gameSession.game;
    console.log('attempt', attempt);
    if (attempt < 8) {
      score = 1;
    }
    if (attempt < 6) {
      score = 2;
    }
    if (attempt < 4) {
      score = 3;
    }

    // time extras
    const seconds = playTimeMs / 1000;
    console.log(seconds);
    if (seconds <= 15) {
      score += 3;
    }
    if (seconds > 15 && seconds <= 35) {
      score += 2;
    }
    if (seconds > 34 && seconds <= 60) {
      score += 1;
    }
    if (seconds > 60 && seconds <= 90) {
      score += 0.5;
    }
  }

  return (
    <div className="results">
      <h2>
        {win && t('result-win', { attempt: gameSession.game.attempt })}
        {!win && t('result-lose', { wordToGuess: gameSession.game.word })}
      </h2>

      <Stars score={score} />

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
