export type TSupportedLanguages = 'pl' | 'en';
export const guardSupportedLanguages = (
  test: unknown,
): test is TSupportedLanguages => {
  return typeof test === 'string' && (test === 'pl' || test === 'en');
};
