export const createFetchResponse = (ok: boolean, response: unknown) => ({
  ok,
  json: () => Promise.resolve(response),
  text: () => Promise.resolve(JSON.stringify(response)),
});
