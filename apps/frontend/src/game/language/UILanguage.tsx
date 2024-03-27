import { FC, useEffect, useMemo, useState } from 'react';
import { EStorageKeys, AppStorage, noop } from '@repo/utils';
import { getFlag } from '@repo/shared-ui';
import { useLanguage } from '../../i18n';
import LanguageSelector from './LanguageSelector';
import { ILanguageListItem } from './types';

const UILanguage: FC = () => {
  const { loadedLanguage, loadTranslation, getUIText: t } = useLanguage();

  const [selectedTranslation, setTranslation] = useState<string | undefined>(
    loadedLanguage,
  );

  useEffect(() => {
    setTranslation(loadedLanguage);
  }, [loadedLanguage]);

  const uiList: ILanguageListItem[] = useMemo(() => {
    return [
      {
        value: 'pl',
        title: t('translation-button-pl'),
        icon: getFlag('pl'),
      },
      {
        value: 'en',
        title: t('translation-button-en'),
        icon: getFlag('en'),
      },
    ] as ILanguageListItem[];
  }, [t]);

  const handleTranslationChange = (language: string): void => {
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
      list={uiList}
      language={selectedTranslation}
      onClick={handleTranslationChange}
    />
  );
};

export default UILanguage;
