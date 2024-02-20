import { TGameSession } from '../../api';
import { TGameState } from '../types';

export type TClickAction = 'start' | 'guess';

export interface IProps {
  gameState: TGameState;
  gameSession?: TGameSession;

  onClick: (action: TClickAction, ...rest: unknown[]) => void;
}
