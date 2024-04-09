import { FC } from 'react';
import { useLanguage } from '../../../../i18n';
import Spinner from '../../../Spinner/Spinner';
import { useGameContext } from '../../../context';

export const LoadingPanel: FC = () => {
  const { getUIText: t } = useLanguage();
  const { loading } = useGameContext();

  return loading ? (
    <h2 className="loading panel">
      <Spinner />
      <span>{t('loading')}</span>
    </h2>
  ) : null;
};
