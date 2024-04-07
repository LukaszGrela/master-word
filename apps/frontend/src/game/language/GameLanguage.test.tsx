import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import {
  contextRenderer,
  defaultLanguageContext,
} from '../../i18n/LanguageContext/__tests__/contextRenderer';
import {
  defaultConfigContext,
  MockContext as MockConfigContext,
} from '../../config/__tests__/contextRenderer';
import { AppStorage, IStorage } from '@repo/utils';
import GameLanguage from './GameLanguage';

vi.mock('@repo/utils', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const original = await importOriginal<any>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const AppStorageMock = vi.fn<any, IStorage>();
  const proto = AppStorageMock.prototype as IStorage;

  proto.getItem = vi.fn();
  proto.setItem = vi.fn();
  proto.removeItem = vi.fn();
  proto.has = vi.fn();
  proto.clear = vi.fn();
  proto.clearStorage = vi.fn();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const instance = new AppStorageMock();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
  (AppStorageMock as any).getInstance = vi.fn().mockReturnValue(instance);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...original,

    AppStorage: AppStorageMock,
  };
});

describe('game', () => {
  describe('language', () => {
    describe('GameLanguage', () => {
      let storage: IStorage = AppStorage.getInstance();
      beforeEach(() => {
        storage = AppStorage.getInstance();
      });
      afterEach(() => {
        vi.clearAllMocks();
      });
      it('Renders', () => {
        const { container } = contextRenderer(
          <MockConfigContext>
            <GameLanguage />
          </MockConfigContext>,
        );

        expect(container).toMatchSnapshot();
      });
      it('Renders with context', () => {
        const { container } = contextRenderer(
          <MockConfigContext>
            <GameLanguage />
          </MockConfigContext>,
          {
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
          },
        );

        expect(container).toMatchSnapshot();
      });
      it('Renders with context - game language en', async () => {
        (
          storage.getItem as Mock<[key: string], string | null>
        ).mockImplementation((key) => {
          if (key === 'word-language') {
            return 'en';
          }
          return null;
        });
        const mockSetItem = (
          storage.setItem as Mock<[key: string, value: string], void>
        ).mockImplementation(() => {});

        const { container, getByTitle } = contextRenderer(
          <MockConfigContext
            context={{
              ...defaultConfigContext,
              config: {
                ...defaultConfigContext.config,
                enabledLanguages: ['pl', 'en', 'fr'],
              },
            }}
          >
            <GameLanguage />
          </MockConfigContext>,
          {
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
                  case 'result-language-selector-btn-title-pl':
                    return 'GAME LANG PL';
                  case 'result-language-selector-btn-title-en':
                    return 'GAME LANG EN';
                  case 'result-language-selector-btn-title-fr':
                    return 'GAME LANG FR';
                  default:
                    return translationId;
                }
              }),
            },
            renderOptions: {},
          },
        );

        expect(container).toMatchSnapshot();

        const option1 = await waitFor(() => getByTitle('GAME LANG EN'));
        fireEvent.click(option1);

        // it is already selected, should not call callback
        expect(mockSetItem).not.toBeCalled();

        const option2 = await waitFor(() => getByTitle('GAME LANG FR'));

        fireEvent.click(option2);

        await waitFor(() => {
          expect(mockSetItem).toBeCalledWith('word-language', 'fr');
        });
      });
    });
  });
});
