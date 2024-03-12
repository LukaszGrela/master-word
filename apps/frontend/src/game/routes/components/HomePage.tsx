import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EPaths } from '../enums';
import { useLanguage } from '../../../i18n';
import { GameLanguage } from '../../language';
import './HomePage.scss';

export const HomePage = () => {
  const { getUIText: t } = useLanguage();
  const navigate = useNavigate();

  const handleAction = useCallback(() => {
    navigate(EPaths.GAME);
  }, [navigate]);

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

        <button onClick={handleAction} className="primary">
          {t('start-button')}
        </button>
      </div>
    </div>
  );
};
