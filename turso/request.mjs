// Vercel adds the named rewrite capture `path` to the query string.
// It is routing metadata, never an application search parameter.
export function applicationURL(rawURL) {
  const url = new URL(rawURL);
  url.searchParams.delete('path');
  return url;
}
