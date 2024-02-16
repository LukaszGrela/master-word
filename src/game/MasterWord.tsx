import { FC, useCallback, useEffect, useState } from 'react';
import { ATTEMPTS, Board, WORD_LENGTH } from './index';
import { IMasterWord, TGameState } from './types';
import { classNames } from '../utils/classNames';
import Word from './word/Word';
import words from '../assets/5/dictionary.json';
import { ResultPanel } from './panel';
import { TClickAction } from './panel/types';

import './MasterWord.css';

const validateWord = async (word: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(word !== 'LOSER');
    }, 1000);
  });
};

const getRandomWord = async (): Promise<string> => {
  const word =
    words[Math.floor(Math.random() * words.length)].toLocaleUpperCase();

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(word);
    }, 1000);
  });
};

const MasterWord: FC<IMasterWord> = ({
  wordLength = WORD_LENGTH,
  attempts = ATTEMPTS,
}) => {
  const [wordToGuess, setWordToGuess] = useState('');

  const attemptsList = Array.from(Array(attempts)).map(() => '');

  const [gameState, setGameState] = useState<TGameState>('init');
  const [game, setGame] = useState<string[]>(attemptsList.concat());
  const [attempt, setAttempt] = useState(0);

  const handleWordCommit = useCallback(
    async (word: string) => {
      setGameState('pending');
      const isValid = await validateWord(word);
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
      asyncInit();
    }
  }, [gameState, startGame]);

  async function handlePanelAction(action: TClickAction) {
    if (action === 'start') {
      await startGame();
    }
  }

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
      </div>
      <p className='read-the-docs'>
        Start typing your guess, press Enter to confirm.
      </p>
    </div>
  );
};

export default MasterWord;
