export {};

declare global {
  export interface ObjectConstructor {
    /**
     * Returns an array of key/values of the enumerable properties of an object
     * @param o Object that contains the properties and methods. This can be an object that you created or an existing Document Object Model (DOM) object.
     */
    entries<A extends readonly unknown[]>(
      o: A,
    ): A extends readonly (infer ElementType)[]
      ? [number, ElementType][]
      : never;
    entries<O, K extends keyof O = keyof O>(o: O): [K, O[K]][];
  }
}
