import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Word from './Word';

const hitEnter = () => {
  fireEvent.keyUp(document.activeElement || document.body, {
    key: 'Enter',
    code: 'Enter',
    charCode: 13,
  });
};
const hitDelete = () => {
  fireEvent.keyUp(document.activeElement || document.body, {
    key: 'Delete',
    code: 'Delete',
    charCode: 46,
  });
};
const hitBackspace = () => {
  fireEvent.keyUp(document.activeElement || document.body, {
    key: 'Backspace',
    code: 'Backspace',
    charCode: 8,
  });
};

describe('game', () => {
  describe('word', () => {
    describe('Word', () => {
      it('Renders', () => {
        const { container } = render(
          <Word wordLength={5} commit={vi.fn()} id="id" />,
        );

        expect(container).toMatchSnapshot();
      });

      it('Renders inactive', () => {
        const { container } = render(
          <Word
            wordLength={5}
            commit={vi.fn()}
            id="id"
            active={false}
            word="WRONG"
            validated={['C', 'M', 'X', 'X', 'X']}
            language="pl"
          />,
        );

        expect(container).toMatchSnapshot();
      });

      it('Renders active', () => {
        const { container } = render(
          <Word wordLength={5} commit={vi.fn()} id="id" active />,
        );

        expect(container).toMatchSnapshot();
      });

      it('Renders active mobile', () => {
        const { container } = render(
          <Word wordLength={5} commit={vi.fn()} id="id" active mobile />,
        );

        expect(container).toMatchSnapshot();
      });
      it('Renders invalid', () => {
        const { container } = render(
          <Word
            wordLength={5}
            commit={vi.fn()}
            id="id"
            active
            invalid
            word="WRONG"
          />,
        );

        expect(container).toMatchSnapshot();
      });

      it('Renders mobile, update word', () => {
        const { rerender, getByTestId } = render(
          <Word
            wordLength={5}
            commit={vi.fn()}
            id="mobile"
            active
            mobile
            word=""
          />,
        );

        let firstLetter = getByTestId('letter-mobile-0');
        expect(firstLetter).toBeDefined();

        // empty string
        expect(firstLetter.textContent).toBe(' ');

        rerender(
          <Word
            wordLength={5}
            commit={vi.fn()}
            id="mobile"
            active
            mobile
            word="WRONG"
          />,
        );

        firstLetter = getByTestId('letter-mobile-0');
        expect(firstLetter).toBeDefined();

        // empty string
        expect(firstLetter.textContent).toBe('W');
      });

      it('If mobile or not active, no keyboard events', async () => {
        const commit = vi.fn();
        const { rerender, getByTestId } = render(
          <Word
            wordLength={5}
            commit={commit}
            id="mobile"
            active
            mobile
            word=""
          />,
        );

        let firstLetter = getByTestId('letter-mobile-0');
        expect(firstLetter).toBeDefined();

        // empty string
        expect(firstLetter.textContent).toBe(' ');

        // Attempt to type word
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 'g',
          code: 'KeyG',
          charCode: 71,
        });

        firstLetter = getByTestId('letter-mobile-0');
        expect(firstLetter).toBeDefined();

        // still empty string
        expect(firstLetter.textContent).toBe(' ');

        rerender(
          <Word
            wordLength={5}
            commit={commit}
            id="mobile"
            active
            mobile={false}
            word=""
          />,
        );

        // Attempt to type word GUESS
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 'g',
          code: 'KeyG',
          charCode: 71,
        });
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 'u',
          code: 'KeyU',
          charCode: 85,
        });
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 'e',
          code: 'KeyE',
          charCode: 69,
        });
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 's',
          code: 'KeyS',
          charCode: 83,
        });
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 's',
          code: 'KeyS',
          charCode: 83,
        });

        firstLetter = getByTestId('letter-mobile-0');
        expect(firstLetter).toBeDefined();

        //
        expect(firstLetter.textContent).toBe('G');

        // event
        hitEnter();

        await waitFor(() => {
          expect(commit).toHaveBeenLastCalledWith('GUESS');
        });
      });
      it('Test Backspace and Delete', () => {
        const commit = vi.fn();
        const { getByTestId } = render(
          <Word wordLength={5} commit={commit} id="mobile" active word="" />,
        );

        let firstLetter = getByTestId('letter-mobile-0');
        expect(firstLetter).toBeDefined();

        // empty string
        expect(firstLetter.textContent).toBe(' ');

        // Attempt to type word GUESS
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 'g',
          code: 'KeyG',
          charCode: 71,
        });
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 'u',
          code: 'KeyU',
          charCode: 85,
        });
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 'e',
          code: 'KeyE',
          charCode: 69,
        });
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 's',
          code: 'KeyS',
          charCode: 83,
        });
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 's',
          code: 'KeyS',
          charCode: 83,
        });

        let lastLetter = getByTestId('letter-mobile-4');
        expect(lastLetter).toBeDefined();
        expect(lastLetter.textContent).toBe('S');

        // overflow strokes will replace last letter
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 't',
          code: 'KeyT',
          charCode: 84,
        });

        lastLetter = getByTestId('letter-mobile-4');
        expect(lastLetter).toBeDefined();
        expect(lastLetter.textContent).toBe('T');

        // event
        hitBackspace();

        firstLetter = getByTestId('letter-mobile-0');
        expect(firstLetter).toBeDefined();
        expect(firstLetter.textContent).toBe('G');
        lastLetter = getByTestId('letter-mobile-4');
        expect(lastLetter).toBeDefined();
        expect(lastLetter.textContent).toBe(' ');

        // event
        hitDelete();

        firstLetter = getByTestId('letter-mobile-0');
        expect(firstLetter).toBeDefined();
        expect(firstLetter.textContent).toBe(' ');
        lastLetter = getByTestId('letter-mobile-4');
        expect(lastLetter).toBeDefined();
        expect(lastLetter.textContent).toBe(' ');
      });
    });
  });
});
