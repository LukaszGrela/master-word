import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EStorageKeys, AppStorage } from '@repo/utils';
import { EPaths } from '../enums';
import { useLanguage } from '../../../i18n';
import { GameLanguage } from '../../language';
import { useConfig } from '../../../config';
import { TGamePageLocationState } from '../../types';
import { ATTEMPTS, WORD_LENGTH } from '../../constants';
import './HomePage.scss';

export const HomePage = () => {
  const storage = AppStorage.getInstance();
  const { loading, refresh } = useConfig();
  const { getUIText: t } = useLanguage();
  const navigate = useNavigate();

  const session = storage.getItem(EStorageKeys.GAME_SESSION);

  const handleAction = useCallback(
    (action: 'start-new' | 'continue' | 'archived-games') => () => {
      const locationState: TGamePageLocationState = {
        language: storage.getItem(EStorageKeys.GAME_LANGUAGE),
        maxAttempts: +(storage.getItem(EStorageKeys.GAME_ATTEMPTS) || ATTEMPTS),
        wordLength: +(
          storage.getItem(EStorageKeys.GAME_WORD_LENGTH) || WORD_LENGTH
        ),
      };
      if (action === 'start-new') {
        storage.removeItem(EStorageKeys.GAME_SESSION);
        navigate(EPaths.GAME, { state: locationState });
      }
      if (action === 'continue') {
        navigate(EPaths.GAME, { state: { ...locationState, session } });
      }
    },
    [navigate, session, storage],
  );

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
        {/*         <button onClick={handleAction('archived-games')} className='secondary' disabled={true}>
          {t('home-archive-button')}
        </button> */}

        {session && (
          <button
            onClick={handleAction('continue')}
            className="primary"
            disabled={loading}
          >
            {t('continue-button')}
          </button>
        )}
        <button
          onClick={handleAction('start-new')}
          className={session ? 'secondary' : 'primary'}
          disabled={loading}
        >
          {t('start-button')}
        </button>
      </div>
    </div>
  );
};

/* v8 ignore start */
export function Component() {
  return <HomePage />;
}

Component.displayName = 'LazyHomePage';
/* v8 ignore stop */
