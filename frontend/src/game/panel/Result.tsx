import { FC, useCallback, useState } from 'react';
import { IProps } from './types';
import { classNames } from '../../utils/classNames';
import { toHMS } from '../../utils/datetime/toHMS';
import t from '../../i18n';
import { LanguageSelector } from '../language';
import { AppStorage } from '../../utils/localStorage';
import { TSupportedLanguages } from '../../api';
import { EStorageKeys } from '../../utils/localStorage/enums';
import './Result.css';

const displayTime = (ms: number): string => {
  const hms = toHMS(ms);

  if (!hms.h && !hms.m) {
    return `${hms.s.toFixed(3)}s`;
  }

  if (!hms.h && hms.m !== undefined) {
    return `${hms.m}m ${hms.s}s`;
  }

  if (hms.h !== undefined && hms.m !== undefined) {
    return `${hms.h}h ${hms.m}m ${hms.s}s`;
  }

  return '';
};

const Result: FC<IProps> = ({
  gameState,
  gameSession,
  onClick,
}): JSX.Element => {
  const storage = AppStorage.getInstance();
  const wordToGuess = gameSession?.word || '';
  const attempt = gameSession?.attempt || 0;

  const playTime =
    gameSession && gameSession.finished
      ? displayTime(
          Number(gameSession.timestamp_finish) -
            Number(gameSession.timestamp_start)
        )
      : 0;

  const handleAction = useCallback(() => {
    onClick('start');
  }, [onClick]);

  const [wordLanguage, setWordLanguage] = useState<
    TSupportedLanguages | undefined
  >(
    (storage.getItem(EStorageKeys.GAME_LANGUAGE) ||
      storage.getItem(EStorageKeys.UI_LANGUAGE) ||
      'pl') as TSupportedLanguages
  );

  const handleWordLanguageChange = (language: TSupportedLanguages): void => {
    AppStorage.getInstance().setItem(EStorageKeys.GAME_LANGUAGE, language);
    setWordLanguage(language);
  };

  const hiddenResult = gameState === 'running' && 'hidden';
  const hiddenFinalResult =
    !(gameState === 'win' || gameState === 'lose' || gameState === 'init') &&
    'hidden';
  const showLoading = gameState === 'pending' || gameState === 'start';

  return (
    <div className={classNames('result', 'panel', hiddenResult)}>
      <h2 className={classNames(hiddenFinalResult)}>
        {gameState === 'win' && t('result-win', { attempt })}
        {gameState === 'lose' && t('result-lose', { wordToGuess })}
        {gameState === 'running' && t('result-running')}
        {gameState === 'init' && t('result-start-the-game')}
        {showLoading && <>&nbsp;</>}
      </h2>
      {gameSession?.finished && !showLoading && (
        <p className='playtime'>{t('result-playtime', { playTime })}</p>
      )}
      {!hiddenFinalResult && (
        <p className='language-info'>{t('result-language-info')}</p>
      )}
      {!hiddenFinalResult && (
        <LanguageSelector
          className='game-language'
          language={wordLanguage}
          onClick={handleWordLanguageChange}
          screenReaderInfo={t('result-language-selector-sr')}
        />
      )}
      {gameState === 'init' && (
        <button
          onClick={handleAction}
          className={classNames(hiddenFinalResult)}
        >
          {t('result-start-button')}
        </button>
      )}
      {(gameState === 'win' || gameState === 'lose') && (
        <button
          onClick={handleAction}
          className={classNames(hiddenFinalResult)}
        >
          {t('result-again-button')}
        </button>
      )}

      {showLoading && (
        <h2 className='loading'>
          <span>{t('loading')}</span>
        </h2>
      )}
    </div>
  );
};

export default Result;
