import { FC, useState, useEffect, Fragment, useMemo } from 'react';
import { TValidationChar } from '@repo/backend-types';
import { classNames, isLetter } from '@repo/utils';
import { Letter } from '../cell';
import { IProps } from './types';

const Word: FC<IProps> = ({
  active,
  invalid,

  wordLength,
  word,
  id,
  commit,
  className,
  mobile,
  validated,
  language,
}) => {
  const [index, setIndex] = useState(0);
  const [guessing, setGuessing] = useState(' '.repeat(wordLength));
  const [isIncorrect, setIncorrect] = useState(invalid);

  useEffect(() => {
    setIncorrect(invalid);
  }, [invalid]);

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
    /* v8 ignore start */
    const preventDefault = (e: KeyboardEvent): void => {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
    };
    /* v8 ignore stop */

    const handleKeyUp = (e: KeyboardEvent): void => {
      const action = e.key;
      if (action === 'Enter' && index === wordLength) {
        // submit word
        setIncorrect(false);
        commit(guessing);
      } else if (action === 'Backspace' && index > 0) {
        // remove letters
        const i = index - 1;
        const newGuess =
          guessing.substring(0, i) + ' ' + guessing.substring(i + 1);
        setIndex(i);
        setGuessing(newGuess);
        setIncorrect(false);
      } else if (action === 'Delete') {
        setIndex(0);
        setGuessing(' '.repeat(wordLength));
        setIncorrect(false);
      } else if (isLetter(action) && index <= wordLength) {
        // add letters
        const i = index < wordLength ? index : wordLength - 1;
        const newGuess =
          guessing.substring(0, i) +
          action.toLocaleUpperCase() +
          guessing.substring(i + 1);
        setIndex(i + 1);
        setGuessing(newGuess);
        setIncorrect(false);
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
            language={language}
            className={classNames(
              classes[i],
              className,
              i === 0 && 'first',
              i === wordLength - 1 && 'last',
            )}
            letter={letter}
            key={`letter-${id}-${i}`}
            data-testid={`letter-${id}-${i}`}
          />
        ));
    }

    return null;
  }, [active, className, id, validated, word, wordLength, language]);
  return (
    <Fragment>
      {active || !word
        ? guessing
            .split('')
            .map((letter, i) => (
              <Letter
                language={language}
                letter={letter}
                key={`letter-${id}-${i}`}
                data-testid={`letter-${id}-${i}`}
                className={classNames(
                  active && 'active',
                  className,
                  isIncorrect && 'wrong',
                  mobile && active && i === 0 && 'show-icon',
                  i === 0 && 'first',
                  i === wordLength - 1 && 'last',
                )}
              />
            ))
        : staticLetters}
    </Fragment>
  );
};

export default Word;
