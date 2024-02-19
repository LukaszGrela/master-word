export const getUrlSearch = (): URLSearchParams => {
  const url = new URL(document.location.href);
  return url.searchParams;
};
