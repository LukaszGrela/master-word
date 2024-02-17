// const english = /^[a-zA-Z]$/i;
const accented = /^[\p{Letter}\p{Mark}]$/iu;
export const isLetter = (letter: string): boolean => accented.test(letter);
