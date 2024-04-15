import { FC, useMemo } from 'react';
import { Board } from '../../..';
import { createGameState } from '../../../../api/utils';
import { useGameContext } from '../../../context';
import Word from '../../../word/Word';

export const WordGameBoard: FC<{ mobile?: boolean }> = ({ mobile }) => {
  const { loading, game, language, maxAttempts, wordLength, error, guess } =
    useGameContext();

  const gameBoardState = useMemo(() => {
    
    return game?.state ?? createGameState(maxAttempts, wordLength);
  }, [game?.state, maxAttempts, wordLength]);
  const attempt = game?.attempt ?? 0;

  return (
    <div className="game-board">
      <Board className={language} columns={wordLength} rows={maxAttempts}>
        {gameBoardState.map((gameAttempt, index) => {
          const active = index === attempt && !loading;
          return (
            <Word
              language={language}
              mobile={mobile}
              commit={guess}
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
    </div>
  );
};
