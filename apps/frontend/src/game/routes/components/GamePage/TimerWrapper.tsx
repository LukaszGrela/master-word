import { FC } from 'react';
import { Timer } from '../../../Timer';
import { useGameContext } from '../../../context';

export const TimerWrapper: FC = () => {
  const { loading, game } = useGameContext();
  return (
    <Timer
      startMs={
        !loading && game && game.attempt > 0 && !game.finished
          ? Number(game.timestamp_start)
          : undefined
      }
    />
  );
};
