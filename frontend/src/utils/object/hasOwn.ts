export const hasOwn = <K extends string | number | symbol>(
  o: unknown,
  k: K
): boolean => Object.prototype.hasOwnProperty.call(o, k);
