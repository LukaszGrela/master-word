import { FC, useEffect, useState } from 'react';
import LanguageSelector from './LanguageSelector';
import { TSupportedLanguages } from '../../api';
import { useLanguage } from '../../i18n';
import { EStorageKeys } from '../../utils/localStorage/enums';
import { AppStorage } from '../../utils/localStorage';
import { noop } from '../../utils/noop';

const UILanguage: FC = () => {
  const { loadedLanguage, loadTranslation } = useLanguage();

  const [selectedTranslation, setTranslation] = useState<
    TSupportedLanguages | undefined
  >(loadedLanguage);

  useEffect(() => {
    setTranslation(loadedLanguage);
  }, [loadedLanguage]);

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

  return (
    <LanguageSelector
      language={selectedTranslation}
      onClick={handleTranslationChange}
    />
  );
};

export default UILanguage;
