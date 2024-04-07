import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import {
  contextRenderer,
  defaultLanguageContext,
} from '../../i18n/LanguageContext/__tests__/contextRenderer';

import UILanguage from './UILanguage';

describe('game', () => {
  describe('language', () => {
    describe('UILanguage', () => {
      it('Renders', () => {
        const { container } = contextRenderer(<UILanguage />);

        expect(container).toMatchSnapshot();
      });
      it('Renders with context', () => {
        const { container } = contextRenderer(<UILanguage />, {
          languageContext: {
            ...defaultLanguageContext,
            getUIText: vi.fn().mockImplementation((translationId: string) => {
              switch (translationId) {
                case 'translation-button-pl':
                  return 'BTN PL';
                case 'translation-button-en':
                  return 'BTN EN';
                case 'translation-info-sr':
                  return 'screen reader info';
                default:
                  return translationId;
              }
            }),
          },
          renderOptions: {},
        });

        expect(container).toMatchSnapshot();
      });
      it('Loads new translation', async () => {
        const loadTranslation = vi.fn().mockResolvedValue(42);
        const { getByTitle } = contextRenderer(<UILanguage />, {
          languageContext: {
            ...defaultLanguageContext,
            loadTranslation,
            getUIText: vi.fn().mockImplementation((translationId: string) => {
              switch (translationId) {
                case 'translation-button-pl':
                  return 'BTN PL';
                case 'translation-button-en':
                  return 'BTN EN';
                case 'translation-info-sr':
                  return 'screen reader info';
                default:
                  return translationId;
              }
            }),
          },
          renderOptions: {},
        });

        const option1 = await waitFor(() => getByTitle('BTN PL'));
        fireEvent.click(option1);

        // it is already selected, should not call callback
        expect(loadTranslation).not.toBeCalled();

        const option2 = await waitFor(() => getByTitle('BTN EN'));

        fireEvent.click(option2);

        await waitFor(() => {
          expect(loadTranslation).toBeCalledWith('en');
        });
      });
    });
  });
});
