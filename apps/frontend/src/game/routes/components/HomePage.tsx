import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EPaths } from '../enums';
import { useLanguage } from '../../../i18n';
import { GameLanguage } from '../../language';
import { useConfig } from '../../../config';
import './HomePage.scss';

export const HomePage = () => {
  const { loading, refresh } = useConfig();
  const { getUIText: t } = useLanguage();
  const navigate = useNavigate();

  const handleAction = useCallback(() => {
    navigate(EPaths.GAME);
  }, [navigate]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div className="page home">
      <div className="title">
        <h1>{t('main-title')}</h1>
        <h4>{t('main-subtitle')}</h4>
      </div>
      <p className="description">{t('home-game-description')}</p>

      <GameLanguage />

      <div className="button-row">
        {/*         <button onClick={handleAction} className='secondary' disabled={true}>
          {t('home-archive-button')}
        </button> */}

        <button onClick={handleAction} className="primary" disabled={loading}>
          {t('start-button')}
        </button>
      </div>
    </div>
  );
};
