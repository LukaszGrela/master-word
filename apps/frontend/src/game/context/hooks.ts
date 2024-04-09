import React from 'react';
import { GameContext } from './GameContext';

export function useGameContext() {
  return React.useContext(GameContext);
}
