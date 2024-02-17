import { FC, useCallback } from 'react';
import { IProps } from './types';
import { classNames } from '../../utils/classNames';

const Result: FC<IProps> = ({
  gameState,
  attempt,
  wordToGuess,
  onClick,
}): JSX.Element => {
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
