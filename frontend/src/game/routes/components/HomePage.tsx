import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EPaths } from '../enums';
import { useLanguage } from '../../../i18n';
import { LanguageSelector } from '../../language';
import { TSupportedLanguages } from '../../../api';
import { AppStorage } from '../../../utils/localStorage';
import { EStorageKeys } from '../../../utils/localStorage/enums';
import './HomePage.scss';

export const HomePage = () => {
  const storage = AppStorage.getInstance();
  const { getUIText: t } = useLanguage();
  const navigate = useNavigate();

  const handleAction = useCallback(() => {
    navigate(EPaths.GAME);
  }, [navigate]);

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
    <div className='page home'>
      <div className='title'>
        <h1>{t('main-title')}</h1>
        <h4>{t('main-subtitle')}</h4>
      </div>
      <p className='description'>{t('home-game-description')}</p>
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
          }}
        />
      </div>
      <div className='button-row'>
        {/*         <button onClick={handleAction} className='secondary' disabled={true}>
          {t('home-archive-button')}
        </button> */}

        <button onClick={handleAction} className='primary'>
          {t('start-button')}
        </button>
      </div>
    </div>
  );
};
