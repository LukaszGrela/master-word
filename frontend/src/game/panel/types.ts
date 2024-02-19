import { TGameState } from '../types';

export type TClickAction = 'start' | 'guess';

export interface IProps {
  gameState: TGameState;

  attempt: number;
  wordToGuess: string;

  onClick: (action: TClickAction, ...rest: unknown[]) => void;
}
