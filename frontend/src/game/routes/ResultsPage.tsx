import { Location, useLocation, useNavigate } from 'react-router-dom';
import { TGameSessionRecord, TSupportedLanguages } from '../../api';
import { useLanguage } from '../../i18n';
import { EPaths, getResultsPath } from './enums';
import { displayTime } from '../../utils/displayTime';
import { useCallback, useState } from 'react';
import { LanguageSelector } from '../language';
import { AppStorage } from '../../utils/localStorage';
import { EStorageKeys } from '../../utils/localStorage/enums';

export const ResultsPage = () => {
  const storage = AppStorage.getInstance();
  const navigate = useNavigate();
  const { getUIText: t, loadedLanguage } = useLanguage();
  const location = useLocation() as Location<TGameSessionRecord>;
  const gameSession = location.state;

  const win = location.pathname === getResultsPath('win');

  const playTime =
    gameSession && gameSession.game.finished
      ? displayTime(
          Number(gameSession.game.timestamp_finish) -
            Number(gameSession.game.timestamp_start)
        )
      : 0;

  const [wordLanguage, setWordLanguage] = useState<
    TSupportedLanguages | undefined
  >(
    (storage.getItem(EStorageKeys.GAME_LANGUAGE) ||
      loadedLanguage ||
      'pl') as TSupportedLanguages
  );

  const handleWordLanguageChange = (language: TSupportedLanguages): void => {
    AppStorage.getInstance().setItem(EStorageKeys.GAME_LANGUAGE, language);
    setWordLanguage(language);
  };

  const handleAction = useCallback(
    (action: 'again' | 'quit') => () => {
      if (action === 'quit') {
        navigate(EPaths.ROOT, { replace: true });
      }
      if (action === 'again') {
        navigate(EPaths.GAME, {
          replace: true,
          state: gameSession.session,
        });
      }
    },
    [gameSession.session, navigate]
  );

  return (
    <div className='results'>
      <h2>
        {win && t('result-win', { attempt: gameSession.game.attempt })}
        {!win && t('result-lose', { wordToGuess: gameSession.game.word })}
      </h2>
      <p className='playtime'>{t('result-playtime', { playTime })}</p>

      <p className='language-info'>{t('result-language-info')}</p>
      <LanguageSelector
        className='game-language'
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

      <div className='button-row'>
        <button onClick={handleAction('quit')} className={'secondary'}>
          {t('result-quit-button')}
        </button>
        <button onClick={handleAction('again')} className={'primary'}>
          {t('result-again-button')}
        </button>
      </div>
    </div>
  );
};
