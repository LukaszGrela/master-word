import { TOptionData } from '@repo/common-types';
import { ReactNode } from 'react';
import { EPaths } from '../../routes/enums/paths';

export const MENU_SEPARATOR_ITEM = 'SEPARATOR' as const;

export enum EMenuItemTypes {
  SEPARATOR = 'SEPARATOR',
  LINK = 'link',
  GAME = 'game',
  LOGOUT = 'logout',
}
export interface IMenuItems extends TOptionData<EMenuItemTypes> {
  icon?: ReactNode;
  link?: EPaths;
}

export interface IProps {
  title?: string;

  menu?: IMenuItems[];
}
