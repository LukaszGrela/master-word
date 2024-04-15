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

/**
 * Makes partial selected as `K` fields.
 * Note: rest is not changed
 */
export type TPartialPick<T, K extends keyof T> = Partial<Pick<T, K>> &
  Omit<T, K>;

/**
 * Makes required selected as `K` fields.
 * Note: rest is not changed
 */
export type TRequiredPick<T, K extends keyof T> = Required<Pick<T, K>> &
  Omit<T, K>;

export type TOptionData<T = string> = {
  label: string;
  value: T;
};

export type TArrayElementType<A extends readonly unknown[]> =
  A extends readonly (infer ElementType)[] ? ElementType : never;
