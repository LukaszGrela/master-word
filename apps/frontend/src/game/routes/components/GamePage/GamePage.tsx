import { FC, useEffect } from 'react';
import { getBowserDetails } from '@repo/utils';
import { useLanguage } from '../../../../i18n';
import { GameProvider, useGameContext } from '../../../context';
import { Location, useLocation, useNavigate } from 'react-router-dom';
import { TGamePageLocationState } from '../../../types';
import { EPaths, getResultsPath } from '../../enums';
import { Info } from './Info';
import { Legend } from './Legend';
import { LoadingPanel } from './LoadingPanel';
import { MobileInputGuessPanel } from './MobileInputGuessPanel';
import { TimerWrapper } from './TimerWrapper';
import { WordGameBoard } from './WordGameBoard';
import './GamePage.scss';

export const GamePageInner: FC = () => {
  const location = useLocation() as Location<TGamePageLocationState>;
  const navigate = useNavigate();
  const {
    language,
    maxAttempts,
    wordLength,
    session: locationSession,
  } = location.state || {};
  const bowser = getBowserDetails();
  const { getUIText: t } = useLanguage();

  const { init, error, game, highest, session } = useGameContext();

  useEffect(() => {
    if (error) {
      if (error.code === 2 /* SESSION_ERROR */) {
        // clear session
        const urlSession = location.state?.session;
        if (location.state && urlSession === session) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars
          const { usr, ...rest } = window.history.state;
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unused-vars

          const { session, ...restUsr } = usr /* v8 ignore next */ || {};
          window.history.replaceState(
            {
              ...rest,
              // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
              usr: {
                ...restUsr,
              },
            },
            '',
          );
        }
        // TODO: review this part, as it seems to not work as intended
        if (session === urlSession) {
          // session in the url, reload with new url
          const url = new URL(window.location.href);
          url.searchParams.delete('session');
          window.location.assign(url);
        }
      } else if (error.code !== 6 /* not INVALID_WORD */) {
        // navigate to error page
        navigate(EPaths.GAME_ERROR, {
          // no back to game
          replace: true,
          state: { error, session: { session, game } },
        });
      }
    }
  }, [error, game, location.state, navigate, session]);

  useEffect(() => {
    if (!language) {
      // go back to home page
      navigate(EPaths.ROOT);
    } else {
      // init game
      init(language, maxAttempts, wordLength, locationSession);
    }
  }, [init, language, maxAttempts, navigate, locationSession, wordLength]);

  useEffect(() => {
    if (game && game.finished) {
      // navigate to result page
      navigate(getResultsPath(game.guessed ? 'win' : 'lose'), {
        // no back to game
        replace: true,
        state: {
          game,
          session,
          highest,
        },
      });
    }
  }, [game, highest, navigate, session]);

  const isMobile = bowser.platform.type === 'mobile';
  return (
    <div className="game-page">
      <div className="header">
        <h1>{t('main-title')}</h1>
        <TimerWrapper />
      </div>
      <Info
        text={t(
          bowser.platform.type !== 'mobile'
            ? 'main-desktop-info'
            : 'main-mobile-info',
        )}
      />
      <Legend
        incorrect={t('main-legend-incorrect')}
        misplaced={t('main-legend-misplaced')}
        correct={t('main-legend-correct')}
      />
      <WordGameBoard mobile={isMobile} />
      {isMobile && <MobileInputGuessPanel />}
      <LoadingPanel />
    </div>
  );
};

/* v8 ignore start */
export const GamePage: FC = () => {
  return (
    <GameProvider>
      <GamePageInner />
    </GameProvider>
  );
};

export function Component() {
  return <GamePage />;
}

Component.displayName = 'LazyGamePage';
/* v8 ignore stop */
