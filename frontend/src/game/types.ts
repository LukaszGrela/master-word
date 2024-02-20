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

export type TGameState =
  | 'init'
  | 'start'
  | 'pending'
  | 'running'
  | 'lose'
  | 'win'
  | 'error';
