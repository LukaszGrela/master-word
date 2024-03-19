import { useAppSelector } from './base';
import type { IConfigState } from '../slices/config';

export const useConfigState = (): IConfigState =>
  useAppSelector((state) => state.config);
