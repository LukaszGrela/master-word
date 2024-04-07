import { toHMS } from '@repo/utils';

const prefix0 = (n: number): string => (n < 10 ? `0${n}` : `${n}`);

export const displayTime = (ms: number): string => {
  const { h, m, s } = toHMS(ms);

  if (!h && !m) {
    return `00:${prefix0(s >> 0)}`;
  }

  if (!h && m !== undefined) {
    return `${prefix0(m)}:${prefix0(s)}`;
  }

  if (h !== undefined && m !== undefined) {
    return `${prefix0(h)}:${prefix0(m)}:${prefix0(s)}`;
    /* v8 ignore start */
  }

  return '00:00'; // it should never reach here
};
/* v8 ignore stop */
