import { TOptionData } from '@repo/common-types';
import { ReactNode } from 'react';
import { EPaths } from '../../routes/enums/paths';

export const MENU_SEPARATOR_ITEM = 'SEPARATOR' as const;
export interface IMenuItems extends TOptionData {
  icon?: ReactNode;
  link?: EPaths;
}

export interface IProps {
  title?: string;

  menu?: IMenuItems[];
}
