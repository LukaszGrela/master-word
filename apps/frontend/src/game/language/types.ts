import { ReactNode } from 'react';

export interface ILanguageListItem {
  value: string;
  title: string;
  label?: string;
  icon?: ReactNode;
}
export interface IProps {
  language: string | undefined;
  onClick: (selected: string) => void;

  className?: string;

  list: ILanguageListItem[];

  translationOverride?: {
    screenReaderInfo?: string;
  };
}
