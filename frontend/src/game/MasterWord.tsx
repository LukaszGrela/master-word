import { FC, useCallback, useEffect, useState } from 'react';
import { ATTEMPTS, Board, WORD_LENGTH } from './index';
import { IMasterWord, TGameState, TValidationChar } from './types';
import { classNames } from '../utils/classNames';
import Word from './word/Word';
import { InputGuessPanel, ResultPanel } from './panel';
import { TClickAction } from './panel/types';
import { noop } from '../utils/noop';
import { getBowserDetails } from '../utils/bowser';
import { getRandomWord, validateWord } from '../api';

import './MasterWord.css';

type TAttempt = { word: string; validated?: TValidationChar[] };
const createGameState = (attempts: number): TAttempt[] =>
  Array.from(Array(attempts)).map(() => ({
    word: '',
  }));

const MasterWord: FC<IMasterWord> = ({
  wordLength = WORD_LENGTH,
  attempts = ATTEMPTS,
}) => {
  const bowser = getBowserDetails();

  const [wordToGuess, setWordToGuess] = useState(['']);

  const [gameState, setGameState] = useState<TGameState>('init');
  const [game, setGame] = useState<
    { word: string; validated?: TValidationChar[] }[]
  >(createGameState(attempts));

  const [attempt, setAttempt] = useState(0);

  const handleWordCommit = useCallback(
    (guess: string) => {
      const word = guess.toLocaleUpperCase();

      setGameState('pending');

      validateWord(word, wordToGuess)
        .then((response) => {
          console.log(response);
          const { guessed, result, valid, error } = response;
          if (valid) {
            // store word attempt in game
            setGame((list) => {
              list[attempt].word = word;
              list[attempt].validated = result;

              return list;
            });

            if (guessed) {
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
            console.log(error);
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
    const randomWordResponse = await getRandomWord();
    setGame(createGameState(attempts));
    setWordToGuess(randomWordResponse.word);
    setAttempt(0);
    setGameState('running');
  }, [attempts]);

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
        <h4>Odgadnij słowo które mam na myśli...</h4>
      </div>
      <p className='read-the-docs'>
        {bowser.platform.type !== 'mobile' &&
          'Zacznij wpisywać słowo, naciśnij Enter żeby potwierdzić.'}
        {bowser.platform.type === 'mobile' &&
          'Naciśnij linię z ikonką edycji by wprowadzić słowo.'}
      </p>
      <div className='game-board'>
        <Board columns={wordLength} rows={attempts}>
          {game.map((gameAttempt, index) => {
            return (
              <Word
                mobile={bowser.platform.type === 'mobile'}
                commit={handleWordCommit}
                active={index === attempt && gameState === 'running'}
                wordLength={wordLength}
                word={gameAttempt.word}
                id={`${index}`}
                key={`${index}`}
                validated={gameAttempt.validated}
                className={index < attempt ? 'inactive' : undefined}
              />
            );
          })}
        </Board>
        <ResultPanel
          attempt={attempt}
          gameState={gameState}
          wordToGuess={wordToGuess.join('')}
          onClick={handlePanelAction}
        />
        {showInputModal && (
          <InputGuessPanel
            initWord={game[attempt].word}
            maxLength={wordLength}
            onClose={handlePanelAction}
          />
        )}
      </div>
      <p className='read-the-docs'>
        GrelaDesign (c) 2024 [v{import.meta.env.VITE_VERSION}]
      </p>
    </div>
  );
};

export default MasterWord;
