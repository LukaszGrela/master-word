import React from 'react';
import { ConfigContext } from './context';

export function useConfig() {
  return React.useContext(ConfigContext);
}
