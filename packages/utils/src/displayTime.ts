import { toHMS } from './datetime/toHMS';

export const displayTime = (ms: number): string => {
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
