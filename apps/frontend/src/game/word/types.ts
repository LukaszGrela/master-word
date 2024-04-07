import { TValidationChar } from '@repo/backend-types';

export interface IProps {
  // row identifier
  id: string;

  // is the word active - user enters word
  active?: boolean;
  invalid?: boolean;

  // current word length
  wordLength: number;

  // when not active this holds the word to display (previous guess)
  word?: string;

  // when not mobile this provides user guessed word to be validated
  commit: (word: string) => void;

  className?: string;

  // is it a mobile and this component is static
  mobile?: boolean;

  // guessed word validation
  validated?: TValidationChar[];

  language?: string;
}
