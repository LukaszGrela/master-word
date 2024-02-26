import { FC, useCallback, useEffect, useState } from 'react';
import t from '../../i18n';
import { TErrorResponse } from '../../api';
import { isCorrectWord } from '../../utils/isLetter';
import { EditIcon } from '../icons/EditIcon';
import { createPortal } from 'react-dom';
import { useRunAfterUpdate } from '../../utils/hooks/useRunAfterUpdate';
import { noop } from '../../utils/noop';
import './InputGuess.css';

type TOnCloseGuess = (action: 'guess', word: string) => void;
type TOnCloseStart = (action: 'start' | 'close') => void;
type TOnClose = TOnCloseGuess & TOnCloseStart;

const InputGuess: FC<{
  show: boolean;

  initWord: string;
  maxLength: number;
  onClose: TOnClose;
  error?: (TErrorResponse & { details?: string }) | null;
}> = ({ maxLength, initWord = '', onClose, error, show }) => {
  const [guess, setGuess] = useState(initWord);
  const [displayed, setDisplayed] = useState(show);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    setDisplayed(show);
    if (show) {
      setGuess(initWord);
    } else {
      setHidden(false);
      setGuess('');
    }
  }, [show, initWord]);

  useEffect(() => {
    if (error?.code === 6 && error?.details) {
      setGuess(error.details);
    }
  }, [error?.code, error?.details]);

  const handleCommit = useCallback(() => {
    onClose('guess', guess);
  }, [guess, onClose]);

  const runAfterUpdate = useRunAfterUpdate();
  const handleChangeText: React.ChangeEventHandler<HTMLInputElement> =
    useCallback(
      (e) => {
        const input = e.target;
        const value = input.value;
        const { selectionDirection, selectionEnd, selectionStart } = input;
        console.log({ selectionDirection, selectionEnd, selectionStart });
        if (value === '' || isCorrectWord(value)) {
          const newValue = value.toLocaleUpperCase();
          let setCursor = noop;

          if (guess !== newValue && value !== '') {
            setCursor = () => {
              input.selectionStart = selectionEnd;
              input.selectionEnd = selectionEnd;
            };
          }
          setGuess(newValue);
          runAfterUpdate(setCursor);
        }
      },
      [guess, runAfterUpdate]
    );

  const disableButton = guess.length < maxLength;
  const handleEnter: React.KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key === 'Enter' && !disableButton) {
        // commit
        onClose('guess', guess);
      }
    },
    [disableButton, guess, onClose]
  );

  const handleClose = useCallback(() => {
    setHidden(true);
  }, []);
  const handleShow = useCallback(() => {
    setHidden(false);
  }, []);

  useEffect(() => {
    const tapHandler = (e: MouseEvent) => {
      if ((e.target as HTMLElement).classList.contains('board')) {
        setHidden(false);
      }
    };

    if (show && hidden) {
      document.addEventListener('click', tapHandler);
    }

    return () => {
      document.removeEventListener('click', tapHandler);
    };
  }, [hidden, show]);

  return (
    displayed &&
    (hidden ? (
      createPortal(
        <div className='input-modal fab-container'>
          <button className='fab' onClick={handleShow}>
            <EditIcon />
          </button>
        </div>,
        document.body
      )
    ) : (
      <div className='panel input-modal'>
        <label htmlFor='guess'>{t('input-modal-label')}</label>
        <input
          type='text'
          name='guess'
          maxLength={maxLength}
          autoFocus
          value={guess}
          onChange={handleChangeText}
          onPaste={(e) => e.preventDefault()}
          onKeyUp={handleEnter}
          autoComplete='off'
          enterKeyHint='done'
          aria-errormessage={error?.code === 6 ? error?.error : undefined}
          aria-invalid={error?.code === 6}
        ></input>
        {!disableButton && (
          <div className='read-the-docs'>{t('input-modal-info-done')}</div>
        )}
        {disableButton && (
          <div className='read-the-docs'>
            {t('input-modal-info-start', { maxLength })}
          </div>
        )}
        <div className='button-row'>
          <button onClick={handleClose}>{t('input-modal-close-button')}</button>
          <button onClick={handleCommit} disabled={disableButton}>
            {t('input-modal-ok-button')}
          </button>
        </div>
      </div>
    ))
  );
};

export default InputGuess;
