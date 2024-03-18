import { FC, useMemo, useState } from 'react';
import { EStorageKeys, AppStorage } from '@repo/utils';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../../i18n';
import { useConfig } from '../../config';
import { ILanguageListItem } from './types';
import { getFlag } from '../../i18n/helpers/getFlag';

import './GameLanguage.scss';

const GameLanguage: FC = () => {
  const { config } = useConfig();
  const storage = AppStorage.getInstance();
  const { getUIText: t } = useLanguage();

  const [wordLanguage, setWordLanguage] = useState<string | undefined>(
    storage.getItem(EStorageKeys.GAME_LANGUAGE) ||
      storage.getItem(EStorageKeys.UI_LANGUAGE) ||
      'pl',
  );

  const handleWordLanguageChange = (language: string): void => {
    AppStorage.getInstance().setItem(EStorageKeys.GAME_LANGUAGE, language);
    setWordLanguage(language);
  };

  const languages = useMemo(() => {
    return config.enabledLanguages.map(
      (language) =>
        ({
          value: language,
          label: t(`word-language-selector-btn-label-${language}`),
          title: t(`result-language-selector-btn-title-${language}`),
          icon: getFlag(language),
        }) as ILanguageListItem,
    );
  }, [config.enabledLanguages, t]);

  return (
    <div className="game-language">
      <p className="language-info">{t('result-language-info')}</p>
      <LanguageSelector
        list={languages}
        language={wordLanguage}
        onClick={handleWordLanguageChange}
        translationOverride={{
          screenReaderInfo: t('result-language-selector-sr'),
        }}
      />
    </div>
  );
};

export default GameLanguage;
