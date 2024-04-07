import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import {
  contextRenderer,
  defaultLanguageContext,
  MockContext,
} from '../../i18n/LanguageContext/__tests__/contextRenderer';

import InputGuess from './InputGuess';
import { IDictionary } from '@repo/common-types';

describe('game', () => {
  describe('panel', () => {
    describe('InputGuess', () => {
      it('Renders with required props', () => {
        const { container } = contextRenderer(
          <InputGuess
            show
            initWord=""
            maxLength={5}
            onClose={vi.fn<
              [action: 'start' | 'close'] | [action: 'guess', word: string],
              void
            >()}
          />,
        );

        expect(container).toMatchSnapshot();
      });
      it('Renders with context and all props', () => {
        const { container } = contextRenderer(
          <InputGuess
            show
            initWord=""
            maxLength={5}
            onClose={vi.fn<
              [action: 'start' | 'close'] | [action: 'guess', word: string],
              void
            >()}
          />,
          {
            languageContext: {
              ...defaultLanguageContext,
              getUIText: vi.fn().mockImplementation((key: string) => {
                const en: IDictionary<string> = {
                  'input-modal-label': 'Insert word to guess',
                  'input-modal-info-done': 'Tap Done to check',
                  'input-modal-info-start': 'Enter {maxLength} letter word',
                  'input-modal-ok-button': 'Done',
                  'input-modal-close-button': 'Hide',
                };
                return en[key] || key;
              }),
            },
            renderOptions: {},
          },
        );

        expect(container).toMatchSnapshot();
      });
      it('Hide/Show panel', () => {
        const dataTestId = {
          'data-testid': 'board',
        };
        const { queryByText, getByText, queryByTestId, getByTestId } =
          contextRenderer(
            <div>
              <div className="board" {...dataTestId}>
                Click Me
              </div>
              <InputGuess
                show
                initWord=""
                maxLength={5}
                onClose={vi.fn<
                  [action: 'start' | 'close'] | [action: 'guess', word: string],
                  void
                >()}
              />
            </div>,
            {
              languageContext: {
                ...defaultLanguageContext,
                getUIText: vi.fn().mockImplementation((key: string) => {
                  const en: IDictionary<string> = {
                    'input-modal-label': 'Insert word to guess',
                    'input-modal-info-done': 'Tap Done to check',
                    'input-modal-info-start': 'Enter {maxLength} letter word',
                    'input-modal-ok-button': 'Done',
                    'input-modal-close-button': 'Hide',
                  };
                  return en[key] || key;
                }),
              },
              renderOptions: {},
            },
          );

        let labelBefore = queryByText('Insert word to guess');
        expect(labelBefore).toBeDefined();

        let closeBtn = getByText('Hide');
        fireEvent.click(closeBtn);

        const label = queryByText('Insert word to guess');
        expect(label).toBeNull();

        // FAB should exist
        let fab = queryByTestId('input-modal-fab-button');
        expect(fab).toBeDefined();
        fireEvent.click(fab!);

        labelBefore = queryByText('Insert word to guess');
        expect(labelBefore).toBeDefined();

        // do it again
        closeBtn = getByText('Hide');
        fireEvent.click(closeBtn);
        fab = queryByTestId('input-modal-fab-button');
        expect(fab).toBeDefined();

        // but this time use tap
        const board = getByTestId('board');
        expect(board).toBeDefined();

        fireEvent.click(board);

        // should be opened
        labelBefore = queryByText('Insert word to guess');
        expect(labelBefore).toBeDefined();
      });
      it('Inserts guess', () => {
        const onClose = vi.fn<
          [action: 'start' | 'close'] | [action: 'guess', word: string],
          void
        >();

        const languageContext = {
          ...defaultLanguageContext,
          getUIText: vi.fn().mockImplementation((key: string) => {
            const en: IDictionary<string> = {
              'input-modal-label': 'Insert word to guess',
              'input-modal-info-done': 'Tap Done to check',
              'input-modal-info-start': 'Enter {maxLength} letter word',
              'input-modal-ok-button': 'Done',
              'input-modal-close-button': 'Hide',
            };
            return en[key] || key;
          }),
        };

        const { rerender, queryByText, getByText, getByTestId } =
          contextRenderer(
            <InputGuess show initWord="" maxLength={5} onClose={onClose} />,
            {
              languageContext,
              renderOptions: {},
            },
          );

        let readTheDocs = queryByText('Enter {maxLength} letter word');
        expect(readTheDocs).toBeDefined();

        let closeBtn = getByText('Done');
        expect(closeBtn.getAttribute('disabled')).toBe('');

        const input = getByTestId('input-modal-guess');
        // type word
        fireEvent.change(input, { target: { value: 'GUESS' } });

        // it should now be enabled
        closeBtn = getByText('Done');
        expect(closeBtn.getAttribute('disabled')).toBe(null);

        // read the docs adjusted
        readTheDocs = queryByText('Tap Done to check');
        expect(readTheDocs).toBeDefined();

        // keyboard event
        input.focus();
        fireEvent.keyUp(document.activeElement || document.body, {
          key: 'Enter',
          code: 'Enter',
          charCode: 13,
        });

        // callback called
        expect(onClose).toBeCalledTimes(1);
        expect(onClose).toHaveBeenLastCalledWith('guess', 'GUESS');

        // close modal
        fireEvent.click(closeBtn);

        // callback called
        expect(onClose).toBeCalledTimes(2);
        expect(onClose).toHaveBeenLastCalledWith('guess', 'GUESS');

        // close modal
        rerender(
          <MockContext context={languageContext}>
            <InputGuess
              show={false}
              initWord=""
              maxLength={5}
              onClose={onClose}
            />
          </MockContext>,
        );

        // expect not to find any panel traces
        expect(queryByText('Done')).toBeNull();
      });
      it('Display error', () => {
        const onClose = vi.fn<
          [action: 'start' | 'close'] | [action: 'guess', word: string],
          void
        >();

        const { container } = contextRenderer(
          <InputGuess
            show
            initWord=""
            maxLength={5}
            onClose={onClose}
            error={{
              code: 6,
              details: 'WRONG',
              error: 'Invalid word',
            }}
          />,
          {
            languageContext: {
              ...defaultLanguageContext,
              getUIText: vi.fn().mockImplementation((key: string) => {
                const en: IDictionary<string> = {
                  'input-modal-label': 'Insert word to guess',
                  'input-modal-info-done': 'Tap Done to check',
                  'input-modal-info-start': 'Enter {maxLength} letter word',
                  'input-modal-ok-button': 'Done',
                  'input-modal-close-button': 'Hide',
                };
                return en[key] || key;
              }),
            },
            renderOptions: {},
          },
        );

        expect(container).toMatchSnapshot();
      });
    });
  });
});
