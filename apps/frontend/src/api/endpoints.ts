const GATEWAY = import.meta.env.VITE_API_ENDPOINT as string;

export const apiInit = (
  language: string,
  session?: string,
  maxAttempts?: number,
): string => {
  const urlParams = new URLSearchParams({
    language,
  });
  if (session) {
    urlParams.append('session', session);
  }
  if (maxAttempts !== undefined) {
    urlParams.append('maxAttempts', `${maxAttempts}`);
  }
  const search = urlParams.toString();

  const query = search === '' ? '' : `?${search}`;

  return `${GATEWAY}/init${query}`;
};

export const apiNextAttempt = (guess: string, session: string): string => {
  const search = new URLSearchParams({
    guess,
    session,
  }).toString();

  const query = search === '' ? '' : `?${search}`;

  return `${GATEWAY}/guess${query}`;
};

export const apiGameSession = (session: string): string => {
  const search = new URLSearchParams({
    session,
  }).toString();

  const query = search === '' ? '' : `?${search}`;

  return `${GATEWAY}/game-session${query}`;
};

export const apiConfig = () => `${GATEWAY}/config`;
