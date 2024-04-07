import { FC, useEffect, useState } from 'react';
import { IProps } from './types';
import { displayTime } from './helpers';

const Timer: FC<IProps> = ({ startMs }) => {
  const [time, setTime] = useState('00:00');

  useEffect(() => {
    const timeout = setInterval(() => {
      if (startMs !== undefined) {
        const now = new Date().getTime();
        const ms = now - startMs;

        setTime(displayTime(ms));
      } else {
        setTime('00:00');
      }
    }, 500);
    return () => {
      clearInterval(timeout);
    };
  }, [startMs]);

  return <span className="timer">{time}</span>;
};

export default Timer;
