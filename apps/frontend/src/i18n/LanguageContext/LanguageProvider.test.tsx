import { Mock, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppStorage, IStorage } from '@repo/utils';
import { LanguageProvider, useLanguage } from '..';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { useCallback, useEffect } from 'react';
import { createFetchResponse } from '../../__tests__/helpers';

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

const originalFetch = global.fetch;

type TMockedConsumerProps = {
  loadingCallback: (flag: boolean) => void;
  loadedLanguageCallback: (language: string | undefined) => void;
  languageToLoad: string;
  loadLanguageCallback: (...rest: unknown[]) => void;
};
const LanguageContextConsumer = (props: TMockedConsumerProps) => {
  const { loading, loadedLanguage, getUIText, loadTranslation } = useLanguage();

  // on change
  useEffect(() => {
    props.loadingCallback(loading);
  }, [loading, props, props.loadingCallback]);
  useEffect(() => {
    props.loadedLanguageCallback(loadedLanguage);
  }, [loadedLanguage, props, props.loadedLanguageCallback]);

  // load language
  const loadLanguage = useCallback(() => {
    loadTranslation(props.languageToLoad)
      .then(props.loadLanguageCallback)
      .catch(props.loadLanguageCallback);
  }, [loadTranslation, props.languageToLoad, props.loadLanguageCallback]);

  return (
    <div>
      <p>LanguageContextConsumer</p>
      <p>{getUIText('dummy-copy')}</p>
      <p>{getUIText('dummy-copy-substitute', { test: 1 })}</p>
      <button onClick={loadLanguage}>LOAD</button>
    </div>
  );
};

describe('i18n', () => {
  describe('LanguageContext', () => {
    let mockFetch = vi.fn();
    let storage: IStorage = AppStorage.getInstance();
    beforeEach(() => {
      mockFetch = vi.fn();
      storage = AppStorage.getInstance();
      global.fetch = mockFetch;
    });
    afterEach(() => {
      vi.clearAllMocks();
      global.fetch = originalFetch;
    });
    describe('LanguageProvider', () => {
      it('loads initial copy default language', async () => {
        // MOCK FETCH FIRST
        const translation = {
          'dummy-copy': 'Some text',
        };

        mockFetch.mockResolvedValue(createFetchResponse(true, translation));

        // Render component
        const loadingCallback = vi.fn();
        const languageCallback = vi.fn();
        const { getByText } = render(
          <LanguageProvider>
            <LanguageContextConsumer
              languageToLoad="fr"
              loadLanguageCallback={vi.fn()}
              loadedLanguageCallback={languageCallback}
              loadingCallback={loadingCallback}
            />
          </LanguageProvider>,
        );

        expect(getByText('dummy-copy')).toBeDefined();

        expect(loadingCallback).toBeCalledTimes(1);
        expect(loadingCallback).toHaveBeenLastCalledWith(true);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/i18n\/pl\.json$/gi),
          {
            method: 'GET',
            signal: undefined,
          },
        );

        await waitFor(() => {
          expect(loadingCallback).toBeCalledTimes(2);
          expect(loadingCallback).toHaveBeenLastCalledWith(false);
        });

        expect(getByText(translation['dummy-copy'])).toBeDefined();
      });

      it('loads initial copy stored language', async () => {
        // MOCK FETCH FIRST
        const translation = {
          'dummy-copy': 'Some text',
          'dummy-copy-substitute': 'Some text {test}',
        };

        mockFetch.mockResolvedValue(createFetchResponse(true, translation));

        (
          storage.getItem as Mock<[key: string], string | null>
        ).mockImplementation((key) => {
          if (key === 'ui-language') {
            return 'en';
          }
          return null;
        });

        // Render component
        const loadingCallback = vi.fn();
        const languageCallback = vi.fn();
        const { getByText } = render(
          <LanguageProvider>
            <LanguageContextConsumer
              languageToLoad="fr"
              loadLanguageCallback={vi.fn()}
              loadedLanguageCallback={languageCallback}
              loadingCallback={loadingCallback}
            />
          </LanguageProvider>,
        );

        expect(getByText('dummy-copy')).toBeDefined();

        expect(loadingCallback).toBeCalledTimes(1);
        expect(loadingCallback).toHaveBeenLastCalledWith(true);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/i18n\/en\.json$/gi),
          {
            method: 'GET',
            signal: undefined,
          },
        );

        await waitFor(() => {
          expect(loadingCallback).toBeCalledTimes(2);
          expect(loadingCallback).toHaveBeenLastCalledWith(false);
        });

        expect(getByText(translation['dummy-copy'])).toBeDefined();
        expect(getByText('Some text 1')).toBeDefined();
      });
      it('consumer initiates load', async () => {
        // MOCK FETCH FIRST
        const translation = {
          'dummy-copy': 'Some text',
          'dummy-copy-substitute': 'Some text {test}',
        };

        mockFetch.mockResolvedValue(createFetchResponse(true, translation));

        (
          storage.getItem as Mock<[key: string], string | null>
        ).mockImplementation((key) => {
          if (key === 'ui-language') {
            return 'en';
          }
          return null;
        });

        // Render component
        const loadingCallback = vi.fn();
        const languageCallback = vi.fn();
        const loadLanguageCallback = vi.fn();

        const { getByText } = render(
          <LanguageProvider>
            <LanguageContextConsumer
              languageToLoad="fr"
              loadLanguageCallback={loadLanguageCallback}
              loadedLanguageCallback={languageCallback}
              loadingCallback={loadingCallback}
            />
          </LanguageProvider>,
        );

        expect(getByText('dummy-copy')).toBeDefined();

        expect(loadingCallback).toBeCalledTimes(1);
        expect(loadingCallback).toHaveBeenLastCalledWith(true);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/i18n\/en\.json$/gi),
          {
            method: 'GET',
            signal: undefined,
          },
        );

        await waitFor(() => {
          expect(loadingCallback).toBeCalledTimes(2);
          expect(loadingCallback).toHaveBeenLastCalledWith(false);
        });

        const frTranslation = {
          'dummy-copy': 'FR Some text',
          'dummy-copy-substitute': 'FR Some text {test}',
        };

        mockFetch.mockResolvedValue(createFetchResponse(true, frTranslation));

        fireEvent.click(getByText('LOAD'));

        expect(fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/i18n\/fr\.json$/gi),
          {
            method: 'GET',
            signal: undefined,
          },
        );

        await waitFor(() => {
          expect(loadingCallback).toBeCalledTimes(4);
        });

        expect(getByText(frTranslation['dummy-copy'])).toBeDefined();
        expect(getByText('FR Some text 1')).toBeDefined();
      });
      it('handle loadTranslation fail', async () => {
        // MOCK FETCH FIRST

        mockFetch.mockRejectedValue(
          createFetchResponse(false, { code: 404, message: 'Not found' }),
        );

        (
          storage.getItem as Mock<[key: string], string | null>
        ).mockImplementation((key) => {
          if (key === 'ui-language') {
            return 'en';
          }
          return null;
        });

        // Render component
        const loadingCallback = vi.fn();
        const languageCallback = vi.fn();
        const loadLanguageCallback = vi.fn();

        const { getByText } = render(
          <LanguageProvider>
            <LanguageContextConsumer
              languageToLoad="fr"
              loadLanguageCallback={loadLanguageCallback}
              loadedLanguageCallback={languageCallback}
              loadingCallback={loadingCallback}
            />
          </LanguageProvider>,
        );

        expect(loadingCallback).toBeCalledTimes(1);
        expect(loadingCallback).toHaveBeenLastCalledWith(true);

        expect(fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/i18n\/en\.json$/gi),
          {
            method: 'GET',
            signal: undefined,
          },
        );

        await waitFor(() => {
          expect(loadingCallback).toBeCalledTimes(2);
          expect(loadingCallback).toHaveBeenLastCalledWith(false);
        });

        fireEvent.click(getByText('LOAD'));

        expect(fetch).toHaveBeenCalledWith(
          expect.stringMatching(/\/i18n\/fr\.json$/gi),
          {
            method: 'GET',
            signal: undefined,
          },
        );

        await waitFor(() => {
          expect(loadingCallback).toBeCalledTimes(4);
          expect(loadLanguageCallback).toBeCalled();
        });

        // copy not updated
        expect(getByText('dummy-copy')).toBeDefined();
      });
    });
  });
});
