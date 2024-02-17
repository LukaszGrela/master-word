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
        {gameState === 'win' && `You have won in ${attempt} attempts`}
        {gameState === 'lose' &&
          `You have lost, word to guess was ${wordToGuess}`}

        {gameState === 'running' && 'Game is running'}
        {showLoading && <>&nbsp;</>}
      </h2>

      <button onClick={handleAction} className={classNames(hiddenFinalResult)}>
        Guess another word
      </button>

      {showLoading && (
        <h2 className='loading'>
          <span>Loading...</span>
        </h2>
      )}
    </div>
  );
};

export default Result;
