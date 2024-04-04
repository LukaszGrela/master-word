import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { getConfig } from '../api';
import { IConfig, IConfigContext } from './types';
import { updateLocalStorageConfig } from './helpers';
import { ConfigContext } from './context';

export function ConfigProvider({ children }: React.PropsWithChildren) {
  const [init, setInit] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>();
  const [config, setConfig] = useState<IConfig>({
    enabledAttempts: [],
    enabledLanguages: [],
    enabledLength: [],
  } as IConfig);
  const abortController = useRef<AbortController>();

  // load config
  const refresh = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();
    setLoading(true);

    const handleError = (error: unknown) => {
      // abort controller errors are ok
      if (!(error instanceof DOMException)) {
        // others are logged
        setError(error as Error);
      }

      setLoading(false);
    };

    getConfig({ signal: abortController.current.signal })
      .then((list) => {
        // transform IConfigEntry to IConfig
        const config = list.reduce(
          (acc: IConfig, entry): IConfig => {
            if (entry.key === 'enabledAttempts') {
              const value = entry.value as number[];
              if (Array.isArray(value)) {
                acc.enabledAttempts = value;
              }
            }
            if (entry.key === 'enabledLength') {
              const value = entry.value as number[];
              if (Array.isArray(value)) {
                acc.enabledLength = value;
              }
            }
            if (entry.key === 'enabledLanguages') {
              const value = entry.value as string[];
              if (Array.isArray(value)) {
                acc.enabledLanguages = value;
              }
            }

            return acc;
          },
          {
            enabledAttempts: [],
            enabledLanguages: [],
            enabledLength: [],
          } as IConfig,
        );

        setConfig(config);
        setLoading(false);
      })
      .catch(handleError)
      .finally(() => {
        setInit(false);
      });
  }, []);

  const value = useMemo(() => {
    updateLocalStorageConfig(config);

    return {
      config,
      loading,
      error,
      refresh,
    } as IConfigContext;
  }, [config, error, loading, refresh]);

  // initial load
  useEffect(() => {
    init && refresh();
  }, [init, refresh]);

  return (
    <ConfigContext.Provider value={value}>
      {!init && children}
    </ConfigContext.Provider>
  );
}
