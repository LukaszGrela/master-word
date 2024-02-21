import { TSupportedLanguages } from '../../api';

export interface IProps {
  language: TSupportedLanguages | undefined;
  onClick: (selected: TSupportedLanguages) => void;

  className?: string;

  translationOverride?: {
    screenReaderInfo?: string;
    buttonTitles?: {
      [key in TSupportedLanguages]: string | undefined;
    };
  };
}
