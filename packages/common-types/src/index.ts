/**
 *
 */
export interface IDictionary<T = unknown> {
  [key: string]: T;
}

/**
 * https://greladesign.co/blog/2024/02/19/typescript-make-stricter-required
 */
export type TStrictRequired<T, E = null | undefined> = {
  [P in keyof T]-?: Exclude<T[P], E>;
};
export type PartialPick<T, K extends keyof T> = Partial<Omit<T, K>> &
  Pick<T, K>;

export type TOptionData<T = string> = {
  label: string;
  value: T;
};

export type TArrayElementType<A extends readonly unknown[]> =
  A extends readonly (infer ElementType)[] ? ElementType : never;
