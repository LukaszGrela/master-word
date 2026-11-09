import { ReactNode, useEffect, useState } from 'react';
import {
  checkAdminToken,
  clearAdminToken,
  getAdminToken,
  setAdminToken,
  TTokenCheckResult,
} from './utils';
import { setAuthorized } from '../../store/slices/user';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Footer } from '../Footer';

type TUiState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'result'; result: TTokenCheckResult };

type TProps = {
  children: ReactNode;
};

const describe = (result: TTokenCheckResult): string | null => {
  switch (result.status) {
    case 'invalid':
      return `Token rejected by the server (HTTP ${result.code}).`;
    case 'unreachable':
      return 'Cannot reach the API — check the network connection and the dev proxy / reverse proxy target.';
    case 'missing':
      return 'Enter a token first.';
    case 'unknown':
      return result.message;
    default:
      return null;
  }
};

export const AskForAdminToken = ({ children }: TProps) => {
  const dispatch = useAppDispatch();
  const isAuthorized = useAppSelector((state) => state.user.authorized);
  const [value, setValue] = useState('');
  const [state, setState] = useState<TUiState>({ kind: 'idle' });
  const [verificationAttempt, setVerificationAttempt] = useState(0);

  const busy = state.kind === 'checking';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setState({ kind: 'checking' });

    checkAdminToken(value)
      .then((result) => {
        setState({ kind: 'result', result });
        if (result.status === 'valid') {
          setAdminToken(value);
          setValue('');
          dispatch(setAuthorized(true));
          setState({ kind: 'idle' });
        }
      })
      .catch((error) => {
        setState({
          kind: 'result',
          result: {
            status: 'unknown',
            message: (error as Error)?.message ?? 'Unknown error',
          },
        });
      });
  };

  const handleUseAnotherToken = () => {
    clearAdminToken();
    dispatch(setAuthorized(false));
    setValue('');
    setState({ kind: 'idle' });
  };

  const message = state.kind === 'result' ? describe(state.result) : null;
  const stored = getAdminToken();

  useEffect(() => {
    if (import.meta.env.VITE_PROXY_BACKEND_ORIGIN) {
      console.warn(
        '[AskForAdmin] proxy backend origin is set, skip authorization.',
        import.meta.env.VITE_PROXY_BACKEND_ORIGIN,
      );
      dispatch(setAuthorized(true));
      return;
    }

    if (!stored || isAuthorized) return;

    const controller = new AbortController();
    setState({ kind: 'checking' });

    checkAdminToken(stored, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) return;

        if (result.status === 'valid') {
          dispatch(setAuthorized(true));
          setState({ kind: 'idle' });
        } else {
          if (result.status === 'invalid' || result.status === 'missing') {
            clearAdminToken();
            dispatch(setAuthorized(false));
          }
          setState({ kind: 'result', result });
        }
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setState({
          kind: 'result',
          result: {
            status: 'unknown',
            message: (error as Error)?.message ?? 'Unknown error',
          },
        });
      });

    return () => controller.abort();
  }, [stored, isAuthorized, dispatch, verificationAttempt]);

  if (import.meta.env.VITE_PROXY_BACKEND_ORIGIN) {
    return children;
  }

  return (
    <>
      {!stored && (
        <>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="admin-api-token">Admin API token</label>
            <input
              id="admin-api-token"
              name="admin-api-token"
              type="password"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              disabled={busy}
            />
            <button type="submit" disabled={busy || !value.trim()}>
              {busy ? 'Verifying…' : 'Save token'}
            </button>

            {message && (
              <p role="alert" aria-live="polite">
                {message}
              </p>
            )}
          </form>
          <Footer />
        </>
      )}
      {stored && isAuthorized && children}
      {stored && !isAuthorized && (
        <div>
          <p role={message ? 'alert' : 'status'} aria-live="polite">
            {state.kind === 'checking' || state.kind === 'idle'
              ? 'Verifying saved token…'
              : message}
          </p>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setState({ kind: 'checking' });
              setVerificationAttempt((attempt) => attempt + 1);
            }}
          >
            Retry verification
          </button>
          <button type="button" disabled={busy} onClick={handleUseAnotherToken}>
            Use a different token
          </button>

          <Footer />
        </div>
      )}
    </>
  );
};

export default AskForAdminToken;
