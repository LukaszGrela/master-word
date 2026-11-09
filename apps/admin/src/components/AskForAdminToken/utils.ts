import { BACKEND_API } from '../../store/slices/api/constants';

/**
 * The admin API token lives in localStorage only.
 * It is deliberately NOT read from import.meta.env / VITE_* —
 * Vite inlines VITE_* variables into the built JS bundle, which would
 * put the secret into dist/assets/*.js for anyone to read.
 */
export const ADMIN_TOKEN_STORAGE_KEY = 'adminApiToken';

export const getAdminToken = (): string | null => {
  try {
    return window.localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // localStorage can throw in private mode / when disabled by policy.
    return null;
  }
};

export const setAdminToken = (token: string): void => {
  try {
    window.localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token.trim());
  } catch {
    // Storage unavailable — the token stays in memory for this session only.
  }
};

export const clearAdminToken = (): void => {
  try {
    window.localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
  } catch {
    // Nothing to do if storage is unavailable.
  }
};
export type TTokenCheckResult =
  | { status: 'valid' }
  | { status: 'invalid'; code: number }
  | { status: 'missing' }
  | { status: 'unknown'; message: string }
  | { status: 'unreachable' };

/**
 * Verifies a token against a guarded /api/backend/* endpoint.
 *
 * Any route listed under "Admin endpoints" in apps/backend/README.md is
 * wrapped by ensureLoggedIn(), so a 2xx means the token was accepted and
 * 401/403 means it was rejected.
 *
 * `unreachable` is kept separate on purpose: fetch rejects on CORS errors and
 * network failures too, and reporting those as "bad token" hides real problems
 * (proxy target down, wrong origin, backend not running).
 */
export const checkAdminToken = async (
  token: string,
  signal?: AbortSignal,
): Promise<TTokenCheckResult> => {
  const value = token.trim();
  if (!value) return { status: 'missing' };

  try {
    const response = await fetch(`${BACKEND_API}/configuration`, {
      method: 'GET',
      headers: { authorization: `Bearer ${value}` },
      signal,
    });

    if (!response.ok) return { status: 'invalid', code: response.status };
    return { status: 'valid' };
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError')
      throw error;
    return { status: 'unreachable' };
  }
};
