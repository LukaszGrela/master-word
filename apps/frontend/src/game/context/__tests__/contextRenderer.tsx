import React from 'react';
import { vi } from 'vitest';
import {
  Queries,
  queries,
  render,
  RenderOptions,
  RenderResult,
} from '@testing-library/react';
import { IGameContext } from '../types';
import { GameContext } from '../GameContext';

const session = 'f332a4d5-78d6-4446-83e2-4bfce4783605';
const gameInit = {
  session,
  game: {
    language: 'pl',
    timestamp_start: '1712253239075',
    max_attempts: 8,
    attempt: 0,
    word_length: 5,
    guessed: false,
    score: 0,
    state: [],
    finished: false,
  },
};
const gameFirstGuess = {
  session,
  game: {
    language: 'pl',
    timestamp_start: '1712913491931',
    max_attempts: 8,
    attempt: 1,
    word_length: 5,
    guessed: false,
    score: 0,
    state: [
      {
        word: ['M', 'A', 'J', 'O', 'R'],
        validated: ['M', 'M', 'X', 'M', 'X'],
        _id: '6618fc549f3c8150bc283272',
      },
    ],
    finished: false,
    _id: '6618fb0e9f3c8150bc282fb7',
  },
};
const gameNext = {
  session,
  game: {
    language: 'pl',
    timestamp_start: '1712254045301',
    max_attempts: 8,
    attempt: 3,
    word_length: 5,
    guessed: false,
    score: 0,
    state: [
      {
        word: ['P', 'E', 'R', 'Ł', 'A'],
        validated: ['X', 'X', 'X', 'X', 'C'],
      },
      {
        word: ['T', 'A', 'T', 'A', 'R'],
        validated: ['X', 'C', 'X', 'M', 'X'],
      },
      {
        word: ['P', 'A', 'Ł', 'K', 'A'],
        validated: ['X', 'C', 'X', 'C', 'C'],
      },
    ],
    finished: false,
  },
};

const gameWon = {
  session,
  game: {
    language: 'pl',
    timestamp_start: '1712254045301',
    max_attempts: 8,
    attempt: 4,
    word: 'JAJKA',
    word_length: 5,
    guessed: true,
    score: 2,
    state: [
      {
        word: ['P', 'E', 'R', 'Ł', 'A'],
        validated: ['X', 'X', 'X', 'X', 'C'],
      },
      {
        word: ['T', 'A', 'T', 'A', 'R'],
        validated: ['X', 'C', 'X', 'M', 'X'],
      },
      {
        word: ['P', 'A', 'Ł', 'K', 'A'],
        validated: ['X', 'C', 'X', 'C', 'C'],
      },
      {
        word: ['J', 'A', 'J', 'K', 'A'],
        validated: ['C', 'C', 'C', 'C', 'C'],
      },
    ],
    finished: true,

    timestamp_finish: '1712254109572',
  },
  highest: {
    'pl:5': {
      score: 0.5,
      timeMs: 130449,
      attempts: 8,
      language: 'pl',
      length: 5,
      _id: '6618f9ac9f3c8150bc282c35',
    },
  },
  __v: 3,
};
const gameLost = {
  _id: '660d501fa79a7dd174b8f527',
  session,
  __v: 9,
  highest: {
    'pl:5': {
      score: 3.25,
      timeMs: 48005,
      attempts: 3,
      language: 'pl',
      length: 5,
      _id: '660e4822a79a7dd174b8f550',
    },
  },
  game: {
    language: 'pl',
    timestamp_start: '1712212870373',
    max_attempts: 8,
    attempt: 8,
    word: 'ŁZAWY',
    word_length: 5,
    guessed: false,
    score: 0,
    state: [
      {
        word: ['B', 'E', 'R', 'T', 'A'],
        validated: ['X', 'X', 'X', 'X', 'M'],
        _id: '660e4b86a79a7dd174b8f566',
      },
      {
        word: ['K', 'A', 'R', 'T', 'A'],
        validated: ['X', 'M', 'X', 'X', 'X'],
        _id: '660e4b89a79a7dd174b8f56f',
      },
      {
        word: ['S', 'A', 'N', 'K', 'I'],
        validated: ['X', 'M', 'X', 'X', 'X'],
        _id: '660e4b8fa79a7dd174b8f581',
      },
      {
        word: ['S', 'T', 'A', 'C', 'H'],
        validated: ['X', 'X', 'C', 'X', 'X'],
        _id: '660e4b9aa79a7dd174b8f597',
      },
      {
        word: ['P', 'T', 'A', 'K', 'I'],
        validated: ['X', 'X', 'C', 'X', 'X'],
        _id: '660e4ba1a79a7dd174b8f5b1',
      },
      {
        word: ['W', 'R', 'A', 'C', 'A'],
        validated: ['M', 'X', 'C', 'X', 'X'],
        _id: '660e4baaa79a7dd174b8f5cf',
      },
      {
        word: ['S', 'W', 'A', 'R', 'Y'],
        validated: ['X', 'M', 'C', 'X', 'C'],
        _id: '660e4bb4a79a7dd174b8f5f1',
      },
      {
        word: ['P', 'R', 'A', 'W', 'Y'],
        validated: ['X', 'X', 'C', 'C', 'C'],
        _id: '660e4bc3a79a7dd174b8f626',
      },
    ],
    finished: true,
    _id: '660e4b82a79a7dd174b8f559',
    timestamp_finish: '1712212931548',
  },
};

export const gameResponses = {
  gameInit,
  gameFirstGuess,
  gameNext,
  gameWon,
  gameLost,
};

export const defaultGameContext: IGameContext = {
  guess: vi.fn(),
  init: vi.fn(),
  language: 'pl',
  loading: false,
  maxAttempts: 8,
  wordLength: 5,
};

export const MockContext = (props: {
  context?: Partial<IGameContext>;
  children: React.ReactNode;
}) => {
  const value = { ...props.context, ...defaultGameContext } as IGameContext;

  return (
    <GameContext.Provider value={value}>{props.children}</GameContext.Provider>
  );
};

export const contextRenderer = <
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  children: React.ReactNode,
  props: {
    context?: IGameContext;
    renderOptions: RenderOptions<Q, Container, BaseElement>;
  } = { renderOptions: {} },
): RenderResult<Q, Container, BaseElement> => {
  const { context, renderOptions = {} } = props;

  return render<Q, Container, BaseElement>(
    <MockContext context={context}>{children}</MockContext>,
    renderOptions,
  );
};
