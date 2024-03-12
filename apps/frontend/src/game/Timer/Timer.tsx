import { FC, useEffect, useState } from 'react';
import { IProps } from './types';
import { toHMS } from '../../utils/datetime/toHMS';

const prefix0 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);
const displayTime = (ms: number): string => {
  const hms = toHMS(ms);

  if (!hms.h && !hms.m) {
    return `00:${prefix0(hms.s >> 0)}`;
  }

  if (!hms.h && hms.m !== undefined) {
    return `${prefix0(hms.m)}:${prefix0(hms.s)}`;
  }

  if (hms.h !== undefined && hms.m !== undefined) {
    return `${prefix0(hms.h)}:${prefix0(hms.m)}:${prefix0(hms.s)}`;
  }

  return '00:00';
};

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
