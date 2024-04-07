import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFetchResponse } from '../__tests__/helpers';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { ConfigProvider } from './provider';
import { useConfig } from '.';
import { useCallback, useMemo } from 'react';

const originalFetch = global.fetch;

const configResponse = [
  {
    _id: '660728d96a1843ac760acc2d',
    key: 'enabledLanguages',
    value: ['en', 'pl'],
    appId: ['admin', 'frontend'],
    defaultsTo: ['en', 'pl'],
    sourceValuesKey: 'supportedLanguages',
    __v: 0,
  },
  {
    _id: '660728d96a1843ac760acc29',
    key: 'enabledAttempts',
    value: [8],
    appId: ['admin', 'frontend'],
    defaultsTo: [8],
    sourceValuesKey: 'supportedAttempts',
    __v: 0,
  },
  {
    _id: '660728d96a1843ac760acc2b',
    key: 'enabledLength',
    value: [5],
    appId: ['admin', 'frontend'],
    defaultsTo: [5],
    sourceValuesKey: 'supportedLength',
    __v: 0,
  },
];

const DummyConsumer = () => {
  const { config, loading, refresh, error } = useConfig();
  const refreshCallback = useCallback(() => {
    refresh();
  }, [refresh]);

  const configList = useMemo(() => {
    const configEntries = Object.entries(config).filter(
      ([, value]) => value.length > 0,
    );
    return (
      <ul data-testid="config">
        {configEntries.map(([key, value]) => (
          <li key={key}>
            <span>{key}</span>
            <span>{value.length}</span>
          </li>
        ))}
      </ul>
    );
  }, [config]);

  return (
    <div>
      <p>Config Consumer</p>
      {loading && <p>LOADING</p>}
      {error && (
        <div>
          <p>ERROR</p>
          <p data-testid="error-details">{error.message}</p>
        </div>
      )}
      {!error && configList}
      <button onClick={refreshCallback}>REFRESH</button>
    </div>
  );
};

describe('config', () => {
  describe('ConfigProvider', () => {
    let mockFetch = vi.fn();
    beforeEach(() => {
      mockFetch = vi.fn();
      global.fetch = mockFetch;

      // MOCK FETCH FIRST
      mockFetch.mockResolvedValue(createFetchResponse(true, configResponse));
    });
    afterEach(() => {
      vi.clearAllMocks();
      global.fetch = originalFetch;
    });
    it('initial config load', async () => {
      const { getByTestId, queryByText } = render(
        <ConfigProvider>
          <DummyConsumer />
        </ConfigProvider>,
      );
      // initial load dont render children
      const loading = queryByText('LOADING');
      expect(loading).toBeNull();

      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/frontend\/config$/gi),
        expect.objectContaining({
          method: 'GET',
        }),
      );
      await waitFor(() => {
        const configList = getByTestId('config');
        expect(configList).toBeDefined();
        expect(configList.children.length).toBe(3);
      });
    });
    it('call refresh', async () => {
      const { getByText, getByTestId, queryByText } = render(
        <ConfigProvider>
          <DummyConsumer />
        </ConfigProvider>,
      );
      // initial load dont render children
      const loading = queryByText('LOADING');
      expect(loading).toBeNull();

      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/frontend\/config$/gi),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      await waitFor(() => {
        const configList = getByTestId('config');
        expect(configList).toBeDefined();
        expect(configList.children.length).toBe(3);
      });

      // setup new config
      mockFetch.mockResolvedValue(
        createFetchResponse(true, [
          {
            _id: '660728d96a1843ac760acc2b',
            key: 'enabledLength',
            value: [5],
            appId: ['admin', 'frontend'],
            defaultsTo: [5],
            sourceValuesKey: 'supportedLength',
            __v: 0,
          },
        ]),
      );
      // call refresh
      fireEvent.click(getByText('REFRESH'));

      expect(fetch).toBeCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/frontend\/config$/gi),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      // LOADING was rendered
      await waitFor(() => {
        expect(getByText('LOADING')).toBeDefined();
      });

      // use new config data
      await waitFor(() => {
        const configList = getByTestId('config');
        expect(configList).toBeDefined();
        expect(configList.children.length).toBe(1);
      });
    });
    it('call fails', async () => {
      const { getByText, getByTestId, queryByText } = render(
        <ConfigProvider>
          <DummyConsumer />
        </ConfigProvider>,
      );
      // initial load dont render children
      const loading = queryByText('LOADING');
      expect(loading).toBeNull();

      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/frontend\/config$/gi),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      await waitFor(() => {
        const configList = getByTestId('config');
        expect(configList).toBeDefined();
        expect(configList.children.length).toBe(3);
      });

      // setup new config
      mockFetch.mockRejectedValue({ code: 404, message: '404 Error' });
      // call refresh
      fireEvent.click(getByText('REFRESH'));

      expect(fetch).toBeCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/frontend\/config$/gi),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      // LOADING was rendered
      await waitFor(() => {
        expect(getByText('LOADING')).toBeDefined();
      });

      // error displayed
      await waitFor(() => {
        expect(getByText('ERROR')).toBeDefined();
      });
    });
    it('aborts config load', async () => {
      const { getByText, getByTestId, queryByText } = render(
        <ConfigProvider>
          <DummyConsumer />
        </ConfigProvider>,
      );
      // initial load dont render children
      const loading = queryByText('LOADING');
      expect(loading).toBeNull();

      expect(fetch).toBeCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/frontend\/config$/gi),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      await waitFor(() => {
        const configList = getByTestId('config');
        expect(configList).toBeDefined();
        expect(configList.children.length).toBe(3);
      });

      // call refresh
      mockFetch.mockResolvedValue(
        createFetchResponse(true, [
          {
            _id: '660728d96a1843ac760acc2b',
            key: 'enabledLength',
            value: [5],
            appId: ['admin', 'frontend'],
            defaultsTo: [5],
            sourceValuesKey: 'supportedLength',
            __v: 0,
          },
        ]),
      );
      fireEvent.click(getByText('REFRESH')); // init
      // here it would have just one item
      // but we're calling refresh again cancelling previous call
      mockFetch.mockResolvedValue(createFetchResponse(true, configResponse));
      fireEvent.click(getByText('REFRESH')); // should abort previous

      expect(fetch).toBeCalledTimes(3); // aborted or not, counts as called
      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/frontend\/config$/gi),
        expect.objectContaining({
          method: 'GET',
        }),
      );

      // loading state changed
      await waitFor(() => {
        expect(getByText('LOADING')).toBeDefined();
      });

      // expect the result with 3 configs
      await waitFor(() => {
        const configList = getByTestId('config');
        expect(configList).toBeDefined();
        expect(configList.children.length).toBe(3);
      });
    });
  });
});
