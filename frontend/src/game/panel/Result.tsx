import { FC, useCallback } from 'react';
import { IProps } from './types';
import { classNames } from '../../utils/classNames';
import { toHMS } from '../../utils/datetime/toHMS';

const displayTime = (ms: number): string => {
  const hms = toHMS(ms);

  if (!hms.h && !hms.m) {
    return `${hms.s.toFixed(3)}s`;
  }

  if (!hms.h && hms.m !== undefined) {
    return `${hms.m}m ${hms.s}s`;
  }

  if (hms.h !== undefined && hms.m !== undefined) {
    return `${hms.h}h ${hms.m}m ${hms.s}s`;
  }

  return '';
};

const Result: FC<IProps> = ({
  gameState,
  gameSession,
  onClick,
}): JSX.Element => {
  const wordToGuess = gameSession?.word || '';
  const attempt = gameSession?.attempt || 0;

  const playTime =
    gameSession && gameSession.finished
      ? displayTime(
          Number(gameSession.timestamp_finish) -
            Number(gameSession.timestamp_start)
        )
      : 0;

  const handleAction = useCallback(() => {
    onClick('start');
  }, [onClick]);

  const hiddenResult = gameState === 'running' && 'hidden';
  const hiddenFinalResult =
    !(gameState === 'win' || gameState === 'lose') && 'hidden';
  const showLoading = gameState === 'pending' || gameState === 'init';

  return (
    <div className={classNames('result', 'panel', hiddenResult)}>
      <h2 className={classNames(hiddenFinalResult)}>
        {gameState === 'win' && `Wygrałeś w ${attempt} próbach`}
        {gameState === 'lose' &&
          `Przegrałeś, słowo do odgadnięcia to ${wordToGuess}`}

        {gameState === 'running' && 'Gra w toku'}
        {showLoading && <>&nbsp;</>}
      </h2>
      {gameSession?.finished && <p>Czas rozgrywki: {playTime}</p>}
      <button onClick={handleAction} className={classNames(hiddenFinalResult)}>
        Odgadnij następne słowo
      </button>

      {showLoading && (
        <h2 className='loading'>
          <span>Wczytuję...</span>
        </h2>
      )}
    </div>
  );
};

export default Result;
