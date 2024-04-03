import {
  Location,
  useLocation,
  useNavigate,
  useRouteError,
} from 'react-router-dom';
import { TGameSession } from '@repo/backend-types';
import { useLanguage } from '../../../i18n';
import { GameLanguage } from '../../language';
import { useCallback } from 'react';
import { EPaths } from '../enums';
import { TErrorResponse } from '../../../api';

export const GameErrorPage = () => {
  const { getUIText: t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation() as Location<
    { session: TGameSession; error: TErrorResponse } | undefined
  >;
  const gameSession = location.state?.session;
  const gameError = location.state?.error;

  const routerError = useRouteError() as {
    statusText?: string;
    message?: string;
  };

  console.error(location.state?.error);
  console.error(routerError);
  const handleAction = useCallback(
    (action: 'again' | 'quit') => () => {
      if (action === 'quit') {
        navigate(EPaths.ROOT, { replace: true });
      }
      if (action === 'again') {
        navigate(EPaths.GAME, {
          replace: true,
          state: gameSession?.session,
        });
      }
    },
    [gameSession?.session, navigate],
  );

  return (
    <div className="game-error">
      <h1>{t('general-error-title')}</h1>
      <h2>{t('game-error-subtitle')}</h2>
      <p>{t('general-error-message')}</p>
      {gameError && (
        <p>
          <i>Code: {gameError.code}</i> <i>Error: {gameError.error}</i>
        </p>
      )}
      {routerError && (
        <p>
          <i>{routerError.statusText || routerError.message}</i>
        </p>
      )}
      {gameSession && <GameLanguage />}
      <div className="button-row">
        <button onClick={handleAction('quit')} className={'secondary'}>
          {t('general-error-btn-home')}
        </button>
        {gameSession && (
          <button onClick={handleAction('again')} className={'primary'}>
            {t('result-again-button')}
          </button>
        )}
      </div>
    </div>
  );
};

/* v8 ignore start */
export function Component() {
  return <GameErrorPage />;
}
Component.displayName = 'LazyGameErrorPage';
/* v8 ignore stop */
