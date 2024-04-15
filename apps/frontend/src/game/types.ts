import { ReactNode } from 'react';

export interface IBoard {
  rows: number;
  columns: number;
  children?: ReactNode;
  className?: string;
}

export interface ICell {
  className?: string;
  'data-testid'?: string;
}

export interface IMasterWord {
  attempts?: number;
  wordLength?: number;
}

export type TGameState =
  | 'init'
  | 'start'
  | 'pending'
  | 'running'
  | 'lose'
  | 'win'
  | 'error';

export type TGamePageLocationState = {
  session?: string;
  language?: string | null;
  maxAttempts: number;
  wordLength: number;
};
