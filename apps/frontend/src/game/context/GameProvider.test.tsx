import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameContext } from './hooks';
import { useCallback, useMemo } from 'react';
import { TGameRecord, TScore } from '@repo/backend-types';
import { IDictionary } from '@repo/common-types';
import { IGameContext } from './types';
import { createFetchResponse } from '../../__tests__/helpers';
import { gameResponses } from './__tests__/contextRenderer';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { GameProvider } from './GameProvider';

const originalFetch = global.fetch;

const DataTestId = {
  CONTEXT_LIST: 'dummy-consumer-context',
  ERROR: 'dummy-consumer-error',
  ERROR_CODE: 'dummy-consumer-error-code',
  ERROR_DETAILS: 'dummy-consumer-error-details',
  TRIGGER_GUESS: 'dummy-consumer-guess',
  TRIGGER_INIT: 'dummy-consumer-init',
};
const DummyConsumer = (
  props: { word?: string } & Pick<
    IGameContext,
    'language' | 'maxAttempts' | 'session' | 'wordLength'
  >,
) => {
  const {
    loading,
    error,
    guess,
    init,
    language,
    maxAttempts,
    wordLength,
    game,
    highest,
    session,
  } = useGameContext();

  const initCallback = useCallback(() => {
    init(props.language, props.maxAttempts, props.wordLength, props.session);
  }, [
    init,
    props.language,
    props.maxAttempts,
    props.session,
    props.wordLength,
  ]);

  const guessCallback = useCallback(() => {
    if (props.word) {
      guess(props.word);
    }
  }, [guess, props.word]);

  const contextProps = useMemo(() => {
    const props = {
      language,
      maxAttempts,
      wordLength,
      game,
      highest,
      session,
    };
    const configEntries = Object.entries(props).filter(
      ([, value]) => value !== undefined,
    );
    const toReactNode = (
      value: string | number | TGameRecord | IDictionary<TScore>,
    ): React.ReactNode => {
      if (typeof value === 'object') {
        return <>{JSON.stringify(value)}</>;
      }

      return value;
    };
    return (
      <ul data-testid={DataTestId.CONTEXT_LIST}>
        {configEntries.map(([key, value]) => (
          <li key={key}>
            <span>{key}</span>
            <span>{toReactNode(value!)}</span>
          </li>
        ))}
      </ul>
    );
  }, [game, highest, language, maxAttempts, session, wordLength]);

  return (
    <div>
      <h1>Game Context Consumer</h1>
      {loading && <p>LOADING</p>}
      {error && (
        <div>
          <p>ERROR</p>
          <p data-testid={DataTestId.ERROR}>{error.error}</p>
          <p data-testid={DataTestId.ERROR_CODE}>{error.code}</p>
          <p data-testid={DataTestId.ERROR_DETAILS}>{error.details}</p>
        </div>
      )}
      {!error && contextProps}
      <button data-testid={DataTestId.TRIGGER_INIT} onClick={initCallback}>
        INIT
      </button>
      <button data-testid={DataTestId.TRIGGER_GUESS} onClick={guessCallback}>
        GUESS
      </button>
    </div>
  );
};

describe('game', () => {
  describe('context', () => {
    describe('GameProvider', () => {
      let mockFetch = vi.fn();

      const invalidSession = { code: 2, error: 'Invalid session id' };
      const invalidWord = { code: 6, error: 'Invalid word' };

      beforeEach(() => {
        mockFetch = vi.fn();
        global.fetch = mockFetch;

        // MOCK FETCH FIRST
        mockFetch.mockResolvedValue(
          createFetchResponse(true, gameResponses.gameInit),
        );
      });
      afterEach(() => {
        vi.clearAllMocks();
        global.fetch = originalFetch;
      });

      it('call init', async () => {
        const { getByTestId, queryByText } = render(
          <GameProvider>
            <DummyConsumer language="fr" maxAttempts={8} wordLength={5} />
          </GameProvider>,
        );

        // initial loading is true
        expect(queryByText('LOADING')).toBeDefined();

        expect(fetch).not.toBeCalled();

        // trigger
        fireEvent.click(getByTestId(DataTestId.TRIGGER_INIT));
        expect(fetch).toBeCalledTimes(1);
        // no double calls
        fireEvent.click(getByTestId(DataTestId.TRIGGER_INIT));
        expect(fetch).toBeCalledTimes(1);

        expect(fetch).toHaveBeenLastCalledWith(
          expect.stringMatching(
            /\/api\/frontend\/init\?language=fr&maxAttempts=8&wordLength=5$/gi,
          ),
          expect.objectContaining({
            method: 'GET',
          }),
        );

        await waitFor(() => {
          // loading settled
          expect(queryByText('LOADING')).toBeNull();
          const configList = getByTestId(DataTestId.CONTEXT_LIST);

          expect(configList).toBeDefined();
          expect(configList.children).toHaveLength(5);
        });
      });

      it('fails init', async () => {
        const { getByTestId, queryByText } = render(
          <GameProvider>
            <DummyConsumer language="fr" maxAttempts={8} wordLength={5} />
          </GameProvider>,
        );

        // initial loading is true
        expect(queryByText('LOADING')).toBeDefined();
        expect(fetch).not.toBeCalled();

        mockFetch.mockRejectedValue(new Error('Boom'));
        // trigger
        fireEvent.click(getByTestId(DataTestId.TRIGGER_INIT));
        expect(fetch).toBeCalledTimes(1);

        expect(fetch).toHaveBeenLastCalledWith(
          expect.stringMatching(
            /\/api\/frontend\/init\?language=fr&maxAttempts=8&wordLength=5$/gi,
          ),
          expect.objectContaining({
            method: 'GET',
          }),
        );

        await waitFor(() => {
          // loading settled
          expect(queryByText('LOADING')).toBeNull();

          expect(getByTestId(DataTestId.ERROR)).toBeDefined();
        });
      });

      it('call guess', async () => {
        const { getByTestId, queryByText } = render(
          <GameProvider>
            <DummyConsumer
              language="fr"
              maxAttempts={8}
              wordLength={5}
              word="GUESS"
            />
          </GameProvider>,
        );

        // initial loading is true
        expect(queryByText('LOADING')).toBeDefined();

        expect(fetch).not.toBeCalled();

        // trigger
        fireEvent.click(getByTestId(DataTestId.TRIGGER_INIT));

        expect(fetch).toBeCalledTimes(1);

        expect(fetch).toHaveBeenLastCalledWith(
          expect.stringMatching(
            /\/api\/frontend\/init\?language=fr&maxAttempts=8&wordLength=5$/gi,
          ),
          expect.objectContaining({
            method: 'GET',
          }),
        );

        await waitFor(() => {
          // loading settled
          expect(queryByText('LOADING')).toBeNull();
        });

        // first guess
        mockFetch.mockResolvedValue(
          createFetchResponse(true, gameResponses.gameFirstGuess),
        );

        // trigger
        fireEvent.click(getByTestId(DataTestId.TRIGGER_GUESS));
        expect(fetch).toBeCalledTimes(2);
        // no double call
        fireEvent.click(getByTestId(DataTestId.TRIGGER_GUESS));
        expect(fetch).toBeCalledTimes(2);

        expect(fetch).toHaveBeenLastCalledWith(
          expect.stringMatching(
            /\/api\/frontend\/guess\?guess=GUESS&session=f332a4d5-78d6-4446-83e2-4bfce4783605$/gi,
          ),
          expect.objectContaining({
            method: 'GET',
          }),
        );

        await waitFor(() => {
          expect(queryByText('LOADING')).toBeDefined();
        });

        // next guess
        mockFetch.mockResolvedValue(
          createFetchResponse(true, gameResponses.gameNext),
        );

        await waitFor(() => {
          // loading settled
          expect(queryByText('LOADING')).toBeNull();
        });


        // trigger
        fireEvent.click(getByTestId(DataTestId.TRIGGER_GUESS));
        expect(fetch).toBeCalledTimes(3);

        expect(fetch).toHaveBeenLastCalledWith(
          expect.stringMatching(
            /\/api\/frontend\/guess\?guess=GUESS&session=f332a4d5-78d6-4446-83e2-4bfce4783605$/gi,
          ),
          expect.objectContaining({
            method: 'GET',
          }),
        );

        await waitFor(() => {
          expect(queryByText('LOADING')).toBeDefined();
        });
      });

      it('call winning guess', async () => {
        const { getByTestId, queryByText } = render(
          <GameProvider>
            <DummyConsumer
              language="fr"
              maxAttempts={8}
              wordLength={5}
              word="GUESS"
            />
          </GameProvider>,
        );

        // initial loading is true
        expect(queryByText('LOADING')).toBeDefined();

        expect(fetch).not.toBeCalled();

        // trigger
        fireEvent.click(getByTestId(DataTestId.TRIGGER_INIT));

        expect(fetch).toBeCalledTimes(1);

        expect(fetch).toHaveBeenLastCalledWith(
          expect.stringMatching(
            /\/api\/frontend\/init\?language=fr&maxAttempts=8&wordLength=5$/gi,
          ),
          expect.objectContaining({
            method: 'GET',
          }),
        );

        await waitFor(() => {
          // loading settled
          expect(queryByText('LOADING')).toBeNull();
        });

        mockFetch.mockResolvedValue(
          createFetchResponse(true, gameResponses.gameWon),
        );

        // trigger
        fireEvent.click(getByTestId(DataTestId.TRIGGER_GUESS));
        expect(fetch).toBeCalledTimes(2);
        // no double call
        fireEvent.click(getByTestId(DataTestId.TRIGGER_GUESS));
        expect(fetch).toBeCalledTimes(2);

        expect(fetch).toHaveBeenLastCalledWith(
          expect.stringMatching(
            /\/api\/frontend\/guess\?guess=GUESS&session=f332a4d5-78d6-4446-83e2-4bfce4783605$/gi,
          ),
          expect.objectContaining({
            method: 'GET',
          }),
        );

        await waitFor(() => {
          expect(queryByText('LOADING')).toBeDefined();


        });
      });

      it('fails guess', async () => {
        const { getByTestId, queryByText, queryByTestId } = render(
          <GameProvider>
            <DummyConsumer
              language="fr"
              maxAttempts={8}
              wordLength={5}
              word="GUESS"
            />
          </GameProvider>,
        );

        // initial loading is true
        expect(queryByText('LOADING')).toBeDefined();

        expect(fetch).not.toBeCalled();

        // guess will not be callable - no session set
        fireEvent.click(getByTestId(DataTestId.TRIGGER_GUESS));
        expect(fetch).not.toBeCalled();

        // trigger
        fireEvent.click(getByTestId(DataTestId.TRIGGER_INIT));
        expect(fetch).toBeCalledTimes(1);
        expect(fetch).toHaveBeenLastCalledWith(
          expect.stringMatching(
            /\/api\/frontend\/init\?language=fr&maxAttempts=8&wordLength=5$/gi,
          ),
          expect.objectContaining({
            method: 'GET',
          }),
        );
        // guess will not be callable - init in progress
        fireEvent.click(getByTestId(DataTestId.TRIGGER_GUESS));
        expect(fetch).toBeCalledTimes(1);

        await waitFor(() => {
          // loading settled
          expect(queryByText('LOADING')).toBeNull();
        });

        mockFetch.mockResolvedValue(createFetchResponse(false, invalidWord));

        // trigger
        fireEvent.click(getByTestId(DataTestId.TRIGGER_GUESS));
        expect(fetch).toBeCalledTimes(2);

        expect(fetch).toHaveBeenLastCalledWith(
          expect.stringMatching(
            /\/api\/frontend\/guess\?guess=GUESS&session=f332a4d5-78d6-4446-83e2-4bfce4783605$/gi,
          ),
          expect.objectContaining({
            method: 'GET',
          }),
        );

        await waitFor(() => {
          // loading settled
          expect(queryByText('LOADING')).toBeNull();

          expect(getByTestId(DataTestId.ERROR)).toBeDefined();
          expect(getByTestId(DataTestId.ERROR_CODE)).toBeDefined();
          expect(getByTestId(DataTestId.ERROR_DETAILS).textContent).toBe(
            'GUESS',
          );
        });

        // error is reset
        mockFetch.mockResolvedValue(
          createFetchResponse(true, gameResponses.gameNext),
        );

        // trigger
        fireEvent.click(getByTestId(DataTestId.TRIGGER_GUESS));

        await waitFor(() => {
          // loading settled
          expect(queryByText('LOADING')).toBeNull();

          expect(queryByTestId(DataTestId.ERROR)).toBeNull();
        });
      });
    });
  });
});
