import { ReactNode } from 'react';

export interface IBoard {
  rows: number;
  columns: number;
  children?: ReactNode;
}

export interface ICell {
  className?: string;
}

export interface IMasterWord {
  attempts?: number;
  wordLength?: number;
}

export type TGameState = 'init' | 'pending' | 'running' | 'lose' | 'win';

// Wrong - X, Misplaced - M, Correct - C
export type TValidationChar = 'X' | 'M' | 'C';
