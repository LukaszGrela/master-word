import { FC, useState, useEffect, useCallback, useMemo } from 'react';
import { createGameState } from '../../../../api/utils';
import { useLanguage } from '../../../../i18n';
import { useGameContext } from '../../../context';
import { InputGuessPanel } from '../../../panel';
import { TClickAction } from '../../../panel/types';

export const MobileInputGuessPanel: FC = () => {
  const { loading, game, maxAttempts, wordLength, error, guess } =
    useGameContext();
  const { getUIText: t } = useLanguage();

  const [showInputModal, setShowInputModal] = useState(false);
  useEffect(() => {
    const tapHandler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains('board')) {
        setShowInputModal(true);
      }
    };

    if (!loading) {
      document.addEventListener('click', tapHandler);
    }

    return () => {
      document.removeEventListener('click', tapHandler);
    };
  }, [loading]);

  const handlePanelAction = useCallback(
    (action: TClickAction, ...rest: unknown[]) => {
      if (action === 'guess') {
        // from input panel
        const [word] = rest as string[];

        setShowInputModal(false);
        guess(word);
      }
    },
    [guess],
  );

  const enrichedError = useMemo(() => {
    if (error && error.code === 6 /* INVALID_WORD */) {
      return {
        ...error,

        error: t('main-error-invalid-word'),
      };
    }
    return error;
  }, [error, t]);

  useEffect(() => {
    if (error && error.code === 6 /* INVALID_WORD */) {
      setShowInputModal(true);
    }
  }, [enrichedError, error]);

  const gameBoardState = useMemo(() => {
    return game?.state ?? createGameState(maxAttempts, wordLength);
  }, [game?.state, maxAttempts, wordLength]);
  const attempt = game?.attempt ?? 0;

  return (
    !game?.finished && (
      <InputGuessPanel
        show={showInputModal}
        initWord={gameBoardState[attempt].word.join('')}
        maxLength={wordLength}
        onClose={handlePanelAction}
        error={enrichedError}
      />
    )
  );
};
