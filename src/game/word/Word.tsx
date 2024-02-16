import { FC, useState, useEffect, Fragment, useMemo } from 'react';
import { Letter } from '../cell';
import { classNames } from '../../utils/classNames';
import { isLetter } from '../../utils/isLetter';

const Word: FC<{
  active?: boolean;
  wordLength: number;
  word?: string;
  id: string;
  commit: (word: string) => void;
  compare?: string;
  className?: string;
}> = ({ active, wordLength, word, id, commit, compare, className }) => {
  const [index, setIndex] = useState(0);
  const [guessing, setGuessing] = useState(' '.repeat(wordLength));

  useEffect(() => {
    // word changed - reset
    if (word === '') {
      setIndex(0);
      setGuessing(' '.repeat(wordLength));
    }
  }, [word, wordLength]);

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
    if (active) {
      document.addEventListener('keydown', preventDefault);
      document.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('keydown', preventDefault);
    };
  }, [active, commit, guessing, index, wordLength]);

  const staticLetters = useMemo(() => {
    const classes = Array.from(Array(wordLength)).map(() => 'incorrect');
    // if !active && compare
    // do green pass
    // do orange pass
    if (!active && compare) {
      const from = guessing.split('');
      const to = compare.split('');
      // green pass
      for (let i = 0; i < from.length; i++) {
        const letter = from[i];

        if (letter === to[i]) {
          classes[i] = 'correct';
          from[i] = '';
          to[i] = '';
        }
      }

      // orange pass
      for (let i = 0; i < from.length; i++) {
        const letter = from[i];

        if (letter && to.includes(letter)) {
          classes[i] = 'misplaced';
          from[i] = '';
          const toIndex = to.findIndex((char) => char === letter);
          to[toIndex] = '';
        }
      }
    }

    if (word) {
      return word
        .split('')
        .map((letter, i) => (
          <Letter
            className={classNames(classes[i] || undefined, className)}
            letter={letter}
            key={`letter-${id}-${i}`}
          />
        ));
    }

    return null;
  }, [active, className, compare, guessing, id, word, wordLength]);

  return (
    <Fragment>
      {active || !word
        ? guessing
            .split('')
            .map((letter, i) => (
              <Letter
                letter={letter || '&nbsp;'}
                key={`letter-${id}-${i}`}
                className={classNames(active && 'active', className)}
              />
            ))
        : staticLetters}
    </Fragment>
  );
};

export default Word;
