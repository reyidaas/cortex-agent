export const extractNameFromUrl = (url: string) =>
  (url.endsWith('/') ? url.slice(0, -1) : url).slice(url.lastIndexOf('/') + 1);
