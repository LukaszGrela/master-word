import { FC, useCallback } from 'react';
import { IProps } from './types';
import t from '../../i18n';
import { classNames } from '../../utils/classNames';
import { TSupportedLanguages } from '../../api';
import './LanguageSelector.css';

const LanguageSelector: FC<IProps> = ({
  language,
  onClick,
  screenReaderInfo,
  className,
}): JSX.Element => {
  const handleLanguageChange = useCallback(
    (selected: TSupportedLanguages): void => {
      if (language !== selected) {
        onClick(selected);
      }
    },
    [language, onClick]
  );
  return (
    <div className={classNames('language-selector', 'translation', className)}>
      <span className='hidden sr'>
        {screenReaderInfo || t('translation-info-sr')}
      </span>
      <button
        title={t('translation-button-polish')}
        className={classNames(
          'translation-btn',
          language === 'pl' && 'selected'
        )}
        onClick={() => {
          handleLanguageChange('pl');
        }}
      >
        🇵🇱
      </button>
      <button
        title={t('translation-button-english')}
        className={classNames(
          'translation-btn',
          language === 'en' && 'selected'
        )}
        onClick={() => {
          handleLanguageChange('en');
        }}
      >
        🇺🇸
      </button>
    </div>
  );
};

export default LanguageSelector;
