import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, setTheme, getTheme } from './theme';

describe('theme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.head.innerHTML = '<meta name="theme-color" content="#ffffff">';
  });

  it('defaults to light when nothing is stored, even if the OS prefers dark', () => {
    window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
    expect(getTheme()).toBe('light');
  });

  it('applies the dark class, color-scheme and theme-color', () => {
    applyTheme('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.colorScheme).toBe('dark');
    expect(document.querySelector('meta[name="theme-color"]').getAttribute('content')).toBe('#0b1020');
  });

  it('persists an explicit choice', () => {
    setTheme('dark');
    expect(localStorage.getItem('themeMode')).toBe('dark');
    expect(getTheme()).toBe('dark');
    setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
