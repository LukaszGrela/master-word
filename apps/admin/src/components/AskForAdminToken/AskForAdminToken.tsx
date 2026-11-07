import { ReactNode, useState } from 'react';
import {
  checkAdminToken,
  getAdminToken,
  setAdminToken,
  TTokenCheckResult,
} from './utils';

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
    default:
      return null;
  }
};

export const AskForAdminToken = ({ children }: TProps) => {
  const [value, setValue] = useState('');
  const [state, setState] = useState<TUiState>({ kind: 'idle' });

  const busy = state.kind === 'checking';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setState({ kind: 'checking' });

    checkAdminToken(value)
      .then((result) => {
        setState({ kind: 'result', result });
        // Persist only after the backend confirmed the token. Storing it first
        // would leave a broken value in localStorage that looks like a valid session.
        if (result.status === 'valid') {
          setAdminToken(value);
          setValue('');
          setState({ kind: 'idle' });
        }
      })
      .catch((error) => {
        setState({
          kind: 'result',
          result: {
            status: 'unknown',
            message: (error as Error)?.message ?? 'Unkown error',
          },
        });
      });
  };

  // const handleClear = () => {
  //   clearAdminToken();
  //   setValue('');
  //   setState({ kind: 'idle' });
  //   onCleared?.();
  // };

  const message = state.kind === 'result' ? describe(state.result) : null;
  const stored = getAdminToken();

  if (import.meta.env.VITE_PROXY_BACKEND_ORIGIN) {
    // skip token query - it is dev mode with proxy
    return children;
  }

  return (
    <>
      {!stored && (
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
      )}
      {
        stored && children
        // <p>
        //   A token is currently stored.{' '}
        //   <button type="button" onClick={handleClear}>
        //     Clear token
        //   </button>
        // </p>
      }
    </>
  );
};

export default AskForAdminToken;
