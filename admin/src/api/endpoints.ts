const GATEWAY = import.meta.env.VITE_API_ENDPOINT as string;
const BACKEND_API = `${GATEWAY}/backend`;

export const apiAddWord = () => `${BACKEND_API}/add-word`;

export const apiUnknownWords = (): string => `${BACKEND_API}/list`;
export const apiApproveWords = () => `${BACKEND_API}/approve-words`;
export const apiRejectWords = () => `${BACKEND_API}/reject-words`;
export const apiDictionaryLanguages = (length = 5) => {
  const urlParams = new URLSearchParams({});
  if (length !== undefined) {
    urlParams.append('length', `${length}`);
  }
  const search = urlParams.toString();

  const query = search === '' ? '' : `?${search}`;

  return `${BACKEND_API}/dictionary-languages${query}`;
};
export const apiDictionaryStats = (language = 'pl', length = 5) => {
  const urlParams = new URLSearchParams({});
  if (language) {
    urlParams.append('language', language);
  }
  if (length !== undefined) {
    urlParams.append('length', `${length}`);
  }
  const search = urlParams.toString();

  const query = search === '' ? '' : `?${search}`;
  return `${BACKEND_API}/dictionary-stats${query}`;
};
