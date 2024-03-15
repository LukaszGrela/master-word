import { Location, useLocation, useNavigate } from 'react-router-dom';
import { TGameSessionRecord } from '@repo/backend-types';
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
  const location = useLocation() as Location<TGameSessionRecord>;
  const gameSession = location.state;

  console.log('gameSession', gameSession);

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
  // new high score
  const showHighScore =
    gameSession.highest && gameSession.game.score > gameSession.highest.score;

  return (
    <div className="results">
      <h2>
        {win && t('result-win', { attempt: gameSession.game.attempt })}
        {!win && t('result-lose', { wordToGuess: gameSession.game.word })}
      </h2>

      <div className="score-container">
        <Stars score={gameSession.game.score} />
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
