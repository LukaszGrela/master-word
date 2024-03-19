import { FC, useCallback, useMemo } from 'react';
import { classNames } from '@repo/utils';
import { IProps } from './types';
import { useLanguage } from '../../i18n';

import './LanguageSelector.scss';

const LanguageSelector: FC<IProps> = ({
  language,
  onClick,
  className,
  list,
  translationOverride,
}): JSX.Element => {
  const { getUIText: t } = useLanguage();

  const handleLanguageChange = useCallback(
    (selected: string): void => {
      if (language !== selected) {
        onClick(selected);
      }
    },
    [language, onClick],
  );

  const options = useMemo(() => {
    return list.map(({ value, label, icon, title }) => (
      <button
        key={value}
        title={title}
        className={classNames(
          'translation-btn',
          language === value && 'selected',
        )}
        onClick={() => {
          handleLanguageChange(value);
        }}
      >
        {label && <span className="label">{label}</span>}
        {icon && <span className="flag">{icon}</span>}
      </button>
    ));
  }, [handleLanguageChange, language, list]);

  return (
    <div className={classNames('language-selector', 'translation', className)}>
      <span className="hidden sr">
        {translationOverride?.screenReaderInfo ?? t('translation-info-sr')}
      </span>
      {options}
    </div>
  );
};

export default LanguageSelector;
