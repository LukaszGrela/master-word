import { FC, useCallback, useState } from 'react';
import './InputGuess.css';
import t from '../../i18n';

// const reg = /^[\p{Letter}\p{Mark}]+$/iu;

const InputGuess: FC<{
  initWord: string;
  maxLength: number;
  onClose: (action: 'guess' | 'start', word: string) => void;
}> = ({ maxLength, initWord = '', onClose }) => {
  const [guess, setGuess] = useState(initWord);
  const handleCommit = useCallback(() => {
    onClose('guess', guess);
  }, [guess, onClose]);

  const handleChangeText: React.ChangeEventHandler<HTMLInputElement> =
    useCallback((e) => {
      const value = e.target.value;

      setGuess(value.toLocaleUpperCase());
    }, []);

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

  return (
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
      ></input>
      {!disableButton && (
        <div className='read-the-docs'>{t('input-modal-info-done')}</div>
      )}
      {disableButton && (
        <div className='read-the-docs'>
          {t('input-modal-info-start', { maxLength })}
        </div>
      )}
      <button onClick={handleCommit} disabled={disableButton}>
        {t('input-modal-ok-button')}
      </button>
    </div>
  );
};

export default InputGuess;
