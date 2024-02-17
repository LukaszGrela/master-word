import { FC, useCallback, useState } from 'react';
import './InputGuess.css';

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
      if (e.code === 'Enter' && !disableButton) {
        // commit
        onClose('guess', guess);
      }
    },
    [disableButton, guess, onClose]
  );

  return (
    <div className='panel input-modal'>
      <label htmlFor='guess'>Enter word to guess</label>
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
      ></input>
      {!disableButton && (
        <div className='read-the-docs'>Tap Confirm or Enter to commit</div>
      )}
      {disableButton && (
        <div className='read-the-docs'>Enter 5 letter word to guess</div>
      )}
      <button onClick={handleCommit} disabled={disableButton}>
        Confirm
      </button>
    </div>
  );
};

export default InputGuess;
