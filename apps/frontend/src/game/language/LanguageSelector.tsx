import { FC, useCallback } from 'react';
import { IProps } from './types';
import { classNames } from '@repo/utils';
import { TSupportedLanguages } from '../../api';
import { useLanguage } from '../../i18n';

import './LanguageSelector.scss';

const LanguageSelector: FC<IProps> = ({
  language,
  onClick,
  className,
  translationOverride,
}): JSX.Element => {
  const { getUIText: t } = useLanguage();

  const handleLanguageChange = useCallback(
    (selected: TSupportedLanguages): void => {
      if (language !== selected) {
        onClick(selected);
      }
    },
    [language, onClick],
  );
  return (
    <div className={classNames('language-selector', 'translation', className)}>
      <span className="hidden sr">
        {translationOverride?.screenReaderInfo ?? t('translation-info-sr')}
      </span>
      <button
        title={
          translationOverride?.buttonTitles?.pl ??
          t('translation-button-polish')
        }
        className={classNames(
          'translation-btn',
          language === 'pl' && 'selected',
        )}
        onClick={() => {
          handleLanguageChange('pl');
        }}
      >
        {translationOverride?.buttonLabels?.pl && (
          <span className="label">{translationOverride?.buttonLabels?.pl}</span>
        )}
        <span className="flag">🇵🇱</span>
      </button>
      <button
        title={
          translationOverride?.buttonTitles?.en ??
          t('translation-button-english')
        }
        className={classNames(
          'translation-btn',
          language === 'en' && 'selected',
        )}
        onClick={() => {
          handleLanguageChange('en');
        }}
      >
        {translationOverride?.buttonLabels?.en && (
          <span className="label">{translationOverride?.buttonLabels?.en}</span>
        )}
        <span className="flag">🇺🇸</span>
      </button>
    </div>
  );
};

export default LanguageSelector;
