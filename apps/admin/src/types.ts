import { ReactNode } from 'react';
import { TOptionData } from '@repo/common-types';

export interface ILanguageSelectorOption extends TOptionData {
  flag?: ReactNode;
}
