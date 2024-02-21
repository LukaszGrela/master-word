import { TSupportedLanguages } from '../../api';

export interface IProps {
  language: TSupportedLanguages | undefined;
  onClick: (selected: TSupportedLanguages) => void;

  screenReaderInfo?: string;
  className?: string;
}
