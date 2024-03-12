export {};

declare global {
  interface String {
    /**
     * Replaces text in a string, using an object that supports replacement within a string.
     *
     * If you know the Regex used as serchValue you can type the replacer `..args` according to it, use the generic to pass the array.
     *
     * @param searchValue A object can search for and replace matches within a string.
     * @param replacer A function that returns the replacement text.
     */
    replace<A extends Array<unknown> = unknown[]>(
      searchValue: {
        [Symbol.replace](
          string: string,
          replacer: (substring: string, ...args: A) => string
        ): string;
      },
      replacer: (substring: string, ...args: A) => string
    ): string;
  }
}
