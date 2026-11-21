import { describe, expect, it } from 'vitest';
import { nextFromSearch, safeNextPath, signinUrl } from './redirect';

describe('safeNextPath', () => {
  it('accepts same-origin relative paths', () => {
    expect(safeNextPath('/abc123')).toBe('/abc123');
    expect(safeNextPath('/chat/1?x=1#h')).toBe('/chat/1?x=1#h');
  });
  it.each([
    '//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', 'evil.com', '', '/a\nb', '/signin', '/signup?x=1',
  ])('rejects %j', (v) => {
    expect(safeNextPath(v)).toBe('/');
  });
  it('rejects non-strings and uses the fallback', () => {
    expect(safeNextPath(undefined, '/home')).toBe('/home');
    expect(safeNextPath(42)).toBe('/');
  });
});

describe('signinUrl / nextFromSearch', () => {
  it('round-trips the intended path', () => {
    const url = signinUrl({ pathname: '/chat/5', search: '?a=1', hash: '' });
    expect(url).toBe('/signin?next=%2Fchat%2F5%3Fa%3D1');
    expect(nextFromSearch(url.split('?').slice(1).join('?'))).toBe('/chat/5?a=1');
  });
  it('omits next for the root and ignores hostile values', () => {
    expect(signinUrl({ pathname: '/', search: '', hash: '' })).toBe('/signin');
    expect(nextFromSearch('next=%2F%2Fevil.com')).toBe('/');
  });
});
