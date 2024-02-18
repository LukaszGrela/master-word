import { FC, useState, useEffect, Fragment, useMemo } from 'react';
import { Letter } from '../cell';
import { classNames } from '../../utils/classNames';
import { isLetter } from '../../utils/isLetter';
import { IProps } from './types';
import { TValidationChar } from '../types';

const Word: FC<IProps> = ({
  active,

  wordLength,
  word,
  id,
  commit,
  className,
  mobile,
  validated,
}) => {
  const [index, setIndex] = useState(0);
  const [guessing, setGuessing] = useState(' '.repeat(wordLength));

  useEffect(() => {
    // word changed - reset
    if (word === '') {
      setIndex(0);
      setGuessing(' '.repeat(wordLength));
    }
    if (mobile && word && word !== '') {
      setIndex(word.length - 1);
      setGuessing(word);
    }
  }, [mobile, word, wordLength]);

  useEffect(() => {
    const preventDefault = (e: KeyboardEvent): void => {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
    };
    const handleKeyUp = (e: KeyboardEvent): void => {
      const action = e.key;
      if (action === 'Enter' && index === wordLength) {
        // submit word
        commit(guessing);
      } else if (action === 'Backspace' && index > 0) {
        // remove letters
        const i = index - 1;
        const newGuess =
          guessing.substring(0, i) + ' ' + guessing.substring(i + 1);
        setIndex(i);
        setGuessing(newGuess);
      } else if (isLetter(action) && index <= wordLength) {
        // add letters
        const i = index < wordLength ? index : wordLength - 1;
        const newGuess =
          guessing.substring(0, i) +
          action.toLocaleUpperCase() +
          guessing.substring(i + 1);
        setIndex(i + 1);
        setGuessing(newGuess);
      }
    };

    // listen to key up event
    if (active && !mobile) {
      document.addEventListener('keydown', preventDefault);
      document.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('keydown', preventDefault);
    };
  }, [active, commit, guessing, index, mobile, wordLength]);

  const staticLetters = useMemo(() => {
    let classes = Array.from(Array(wordLength)).map(() => 'incorrect');

    if (!active && validated) {
      classes = validated.map((char: TValidationChar) => {
        if (char === 'M') {
          return 'misplaced';
        }
        if (char === 'C') {
          return 'correct';
        }
        return 'incorrect';
      });
    }

    if (word) {
      return word
        .split('')
        .map((letter, i) => (
          <Letter
            className={classNames(classes[i] || 'incorrect', className)}
            letter={letter}
            key={`letter-${id}-${i}`}
          />
        ));
    }

    return null;
  }, [active, className, id, validated, word, wordLength]);

  return (
    <Fragment>
      {active || !word
        ? guessing
            .split('')
            .map((letter, i) => (
              <Letter
                letter={letter || '&nbsp;'}
                key={`letter-${id}-${i}`}
                className={classNames(
                  active && 'active',
                  className,
                  mobile && active && i === 0 && 'show-icon'
                )}
              />
            ))
        : staticLetters}
    </Fragment>
  );
};

export default Word;
