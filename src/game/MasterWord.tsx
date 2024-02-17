import { FC, useCallback, useEffect, useState } from 'react';
import { ATTEMPTS, Board, WORD_LENGTH } from './index';
import { IMasterWord, TGameState } from './types';
import { classNames } from '../utils/classNames';
import Word from './word/Word';
import words from '../assets/5/dictionary.json';
import { InputGuessPanel, ResultPanel } from './panel';
import { TClickAction } from './panel/types';
import { noop } from '../utils/noop';
import { getBowserDetails } from '../utils/bowser';

import './MasterWord.css';

const validateWord = async (word: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (word && word.length === 5) {
        resolve(word !== 'LOSER');
      } else {
        resolve(false);
      }
    }, 10);
  });
};

const getRandomWord = async (): Promise<string> => {
  const word =
    words[Math.floor(Math.random() * words.length)].toLocaleUpperCase();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(word);
    }, 10);
  });
};

const MasterWord: FC<IMasterWord> = ({
  wordLength = WORD_LENGTH,
  attempts = ATTEMPTS,
}) => {
  const bowser = getBowserDetails();

  const [wordToGuess, setWordToGuess] = useState('');

  const attemptsList = Array.from(Array(attempts)).map(() => '');

  const [gameState, setGameState] = useState<TGameState>('init');
  const [game, setGame] = useState<string[]>(attemptsList.concat());
  const [attempt, setAttempt] = useState(0);

  const handleWordCommit = useCallback(
    (guess: string) => {
      const word = guess.toLocaleUpperCase();

      setGameState('pending');

      validateWord(word)
        .then((isValid) => {
          if (isValid) {
            // store word attempt in game
            setGame((list) => {
              list[attempt] = word;
              return list;
            });

            if (word === wordToGuess) {
              setAttempt(attempt + 1);
              setGameState('win');
            } else {
              if (attempt + 1 < attempts) {
                setAttempt(attempt + 1);
                setGameState('running');
              } else {
                // game over
                setAttempt(attempts);
                setGameState('lose');
              }
            }
          } else {
            setGameState('running');
          }
        })
        .catch(() => {
          setGameState('running');
        });
    },
    [attempt, attempts, wordToGuess]
  );

  const startGame = useCallback(async () => {
    setGameState('pending');
    const word = await getRandomWord();
    setGame(attemptsList.concat());
    setWordToGuess(word);
    setAttempt(0);
    setGameState('running');
  }, [attemptsList]);

  useEffect(() => {
    const asyncInit = async () => {
      await startGame();
    };
    if (gameState === 'init') {
      asyncInit().catch(noop);
    }
  }, [gameState, startGame]);

  const handlePanelAction = useCallback(
    (action: TClickAction, ...rest: unknown[]) => {
      if (action === 'start') {
        startGame().catch(noop);
      }
      if (action === 'guess') {
        const [guess] = rest;

        setShowInputModal(false);
        handleWordCommit(guess as string);
      }
    },
    [handleWordCommit, startGame]
  );

  const [showInputModal, setShowInputModal] = useState(false);
  useEffect(() => {
    const tapHandler = () => {
      setShowInputModal(true);
    };

    if (bowser.platform.type === 'mobile' && gameState === 'running') {
      document.addEventListener('click', tapHandler);
    }

    return () => {
      document.removeEventListener('click', tapHandler);
    };
  }, [bowser.platform.type, gameState]);

  return (
    <div className={classNames('master-word', 'game', gameState)}>
      <div className='title'>
        <h1>Master Word</h1>
      </div>
      <div className='game-board'>
        <Board columns={wordLength} rows={attempts}>
          {game.map((word, index) => {
            return (
              <Word
                mobile={bowser.platform.type === 'mobile'}
                commit={handleWordCommit}
                active={index === attempt && gameState === 'running'}
                wordLength={wordLength}
                word={word}
                id={`${index}`}
                key={`${index}`}
                compare={index < attempt ? wordToGuess : undefined}
                className={index < attempt ? 'inactive' : undefined}
              />
            );
          })}
        </Board>
        <ResultPanel
          attempt={attempt}
          gameState={gameState}
          wordToGuess={wordToGuess}
          onClick={handlePanelAction}
        />
        {showInputModal && (
          <InputGuessPanel
            initWord={game[attempt]}
            maxLength={wordLength}
            onClose={handlePanelAction}
          />
        )}
      </div>
      <p className='read-the-docs'>
        {bowser.platform.type !== 'mobile' &&
          'Start typing your guess, press Enter to confirm.'}
        {bowser.platform.type === 'mobile' &&
          'Touch edit icon to enter your guess.'}
      </p>{' '}
      <p className='read-the-docs'>
        GrelaDesign (c) 2024 [v{import.meta.env.VITE_VERSION}]
      </p>
    </div>
  );
};

export default MasterWord;
