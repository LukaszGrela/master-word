import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import {
  contextRenderer,
  defaultLanguageContext,
} from '../../i18n/LanguageContext/__tests__/contextRenderer';

import LanguageSelector from './LanguageSelector';

describe('game', () => {
  describe('language', () => {
    describe('LanguageSelector', () => {
      it('Renders with required props', () => {
        const { container } = contextRenderer(
          <LanguageSelector language="pl" onClick={vi.fn()} list={[]} />,
        );

        expect(container).toMatchSnapshot();
      });
      it('Renders with context and required props', () => {
        const { container } = contextRenderer(
          <LanguageSelector language="pl" onClick={vi.fn()} list={[]} />,
          {
            languageContext: {
              ...defaultLanguageContext,
              getUIText: vi.fn().mockImplementation(() => {
                return 'screen reader info';
              }),
            },
            renderOptions: {},
          },
        );

        expect(container).toMatchSnapshot();
      });
      it('Renders with context and all props', () => {
        const { container } = contextRenderer(
          <LanguageSelector
            language="pl"
            onClick={vi.fn()}
            list={[]}
            className="test"
            translationOverride={{
              screenReaderInfo: 'screenReaderInfo',
            }}
          />,
          {
            languageContext: {
              ...defaultLanguageContext,
              getUIText: vi.fn().mockImplementation(() => {
                return 'screen reader info';
              }),
            },
            renderOptions: {},
          },
        );

        expect(container).toMatchSnapshot();
      });
      it('renders options', () => {
        const { container } = contextRenderer(
          <LanguageSelector
            language="pl"
            onClick={vi.fn()}
            list={[
              {
                title: 'Option 1 Button Title',
                value: 'option-1',
                icon: <>ICO</>,
                label: 'Option 1',
              },

              {
                title: 'Option 2 Button Title',
                value: 'option-2',
                icon: <>ICO</>,
                label: 'Option 2',
              },
            ]}
          />,
          {
            languageContext: {
              ...defaultLanguageContext,
              getUIText: vi.fn().mockImplementation(() => {
                return 'screen reader info';
              }),
            },
            renderOptions: {},
          },
        );

        expect(container).toMatchSnapshot();
      });
      it('Calls onClick on rendered option', () => {
        const clickHandler = vi.fn();
        const list = [
          {
            title: 'Option 1 Button Title',
            value: 'pl',
            icon: <>ICO</>,
            label: 'Option 1',
          },

          {
            title: 'Option 2 Button Title',
            value: 'en',
            icon: <>ICO</>,
            label: 'Option 2',
          },
        ];
        const { getByTitle } = contextRenderer(
          <LanguageSelector language="pl" onClick={clickHandler} list={list} />,
          {
            languageContext: {
              ...defaultLanguageContext,
              getUIText: vi.fn().mockImplementation(() => {
                return 'screen reader info';
              }),
            },
            renderOptions: {},
          },
        );
        const option1 = getByTitle(list[0].title);
        fireEvent.click(option1);

        // it is already selected, should not call callback
        expect(clickHandler).not.toBeCalled();

        const option2 = getByTitle(list[1].title);
        fireEvent.click(option2);

        expect(clickHandler).toBeCalledWith('en');
      });
    });
  });
});
