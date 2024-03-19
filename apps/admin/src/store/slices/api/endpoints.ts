export const apiAddWord = () => `/add-word`;
export const apiUnknownWords = (): string => `/list`;
export const apiApproveWords = () => `/approve-words`;
export const apiRejectWords = () => `/reject-words`;
export const apiDictionaryLanguages = (length = 5) => {
  const urlParams = new URLSearchParams({});
  if (length !== undefined) {
    urlParams.append('length', `${length}`);
  }
  const search = urlParams.toString();

  const query = search === '' ? '' : `?${search}`;

  return `/dictionary-languages${query}`;
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
  return `/dictionary-stats${query}`;
};

export const apiConfig = () => `/configuration`;
