import { TGameState } from '../types';

export type TClickAction = 'start';

export interface IProps {
  gameState: TGameState;

  attempt: number;
  wordToGuess: string;

  onClick: (action: TClickAction) => void;
}
