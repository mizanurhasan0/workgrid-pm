/**
 * Returns `target` only when it is a same-origin relative path (starts with a single "/"),
 * otherwise `fallback`. Blocks open redirects such as "//evil.com", "/\evil.com" or "https://evil.com".
 * @param {unknown} target
 * @param {string} [fallback]
 * @returns {string}
 */
export function safeNextPath(target, fallback = '/') {
  if (typeof target !== 'string' || target.length === 0 || target.length > 2000) {return fallback;}
  if (target[0] !== '/' || target[1] === '/' || target[1] === '\\') {return fallback;}
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(target)) {return fallback;}
  const signinPath = /^\/(signin|login|signup|register)(?:[/?#]|$)/;
  if (signinPath.test(target)) {return fallback;}
  return target;
}

let signedOutAt = 0;

/** Call right before ending the session on purpose, so the next sign-in does not return to the page the user left. */
export function markSignedOut() {
  signedOutAt = Date.now();
}

/** Builds the sign-in URL that remembers where the visitor wanted to go. */
export function signinUrl(location) {
  if (Date.now() - signedOutAt < 2000) {
    signedOutAt = 0;
    return '/signin';
  }
  const here = `${location.pathname}${location.search}${location.hash}`;
  const next = safeNextPath(here, '/');
  return next === '/' ? '/signin' : `/signin?next=${encodeURIComponent(next)}`;
}

/** Reads and validates the `next` query param from a search string. */
export function nextFromSearch(search) {
  return safeNextPath(new URLSearchParams(search || '').get('next'), '/');
}
