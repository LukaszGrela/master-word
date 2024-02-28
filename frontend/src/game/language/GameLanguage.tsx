import { FC, useState } from 'react';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../../i18n';
import { TSupportedLanguages } from '../../api';
import { EStorageKeys } from '../../utils/localStorage/enums';
import { AppStorage } from '../../utils/localStorage';

import './GameLanguage.scss';

const GameLanguage: FC = () => {
  const storage = AppStorage.getInstance();
  const { getUIText: t } = useLanguage();

  const [wordLanguage, setWordLanguage] = useState<
    TSupportedLanguages | undefined
  >(
    (storage.getItem(EStorageKeys.GAME_LANGUAGE) ||
      storage.getItem(EStorageKeys.UI_LANGUAGE) ||
      'pl') as TSupportedLanguages
  );

  const handleWordLanguageChange = (language: TSupportedLanguages): void => {
    AppStorage.getInstance().setItem(EStorageKeys.GAME_LANGUAGE, language);
    setWordLanguage(language);
  };

  return (
    <div className='game-language'>
      <p className='language-info'>{t('result-language-info')}</p>
      <LanguageSelector
        language={wordLanguage}
        onClick={handleWordLanguageChange}
        translationOverride={{
          screenReaderInfo: t('result-language-selector-sr'),
          buttonTitles: {
            en: t('result-language-selector-btn-title-en'),
            pl: t('result-language-selector-btn-title-pl'),
          },
          buttonLabels: {
            en: t('word-language-selector-btn-label-en'),
            pl: t('word-language-selector-btn-label-pl'),
          },
        }}
      />
    </div>
  );
};

export default GameLanguage;
