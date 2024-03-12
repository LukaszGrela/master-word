import { TGameSession } from '../../api';
import { TGameState } from '../types';

export type TClickAction = 'start' | 'guess' | 'close';

export interface IProps {
  gameState: TGameState;
  gameSession?: TGameSession;

  onClick: (action: TClickAction, ...rest: unknown[]) => void;
}
