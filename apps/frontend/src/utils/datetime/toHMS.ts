export const toHMS = (ms: number): { h?: number; m?: number; s: number } => {
  let sec = ms / 1000;

  // 0..59
  if (sec < 60) {
    return { s: sec };
  }

  // e.g. sec % 60 -> seconds, minutes sec-= %60 / 60
  sec = Math.round(sec);
  const secReminder = sec % 60;
  sec -= secReminder;


  let min = sec / 60;

  if (min < 60) {
    return { m: min, s: secReminder };
  }

  const minReminder = min % 60;
  min -= minReminder;


  const hrs = min / 60;

  return { h: hrs, m: minReminder, s: secReminder };
};
