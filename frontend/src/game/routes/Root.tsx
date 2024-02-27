import { Outlet } from 'react-router-dom';
import { classNames } from '../../utils/classNames';
import { LanguageSelector } from '../language';
import { useState } from 'react';
import { TSupportedLanguages } from '../../api';
import { AppStorage } from '../../utils/localStorage';
import { EStorageKeys } from '../../utils/localStorage/enums';
import { noop } from '../../utils/noop';
import { useLanguage } from '../../i18n';
import Spinner from '../Spinner/Spinner';

export const Root = () => {
  const { loadedLanguage, loadTranslation, loading } = useLanguage();

  const [selectedTranslation, setTranslation] = useState<
    TSupportedLanguages | undefined
  >(loadedLanguage);

  const handleTranslationChange = (language: TSupportedLanguages): void => {
    const used = loadedLanguage;
    if (language !== used) {
      loadTranslation(language)
        .then(() => {
          AppStorage.getInstance().setItem(EStorageKeys.UI_LANGUAGE, language);
          setTranslation(language);
        })
        .catch(noop);
    }
  };

  const showLoading = loading && !loadedLanguage;

  return (
    <div className={classNames('master-word')}>
      {showLoading && <Spinner />}
      {!showLoading && (
        <>
          <Outlet />
          <p className='read-the-docs'>
            GrelaDesign (c) 2024 [v{import.meta.env.VITE_VERSION}]
          </p>
          <LanguageSelector
            language={selectedTranslation}
            onClick={handleTranslationChange}
          />
        </>
      )}
    </div>
  );
};
