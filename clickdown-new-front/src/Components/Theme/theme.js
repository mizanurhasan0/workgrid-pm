import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'themeMode';
const COLORS = { light: '#ffffff', dark: '#0b1020' };
const listeners = new Set();
let animTimer;

function readStored() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

/**
 * The theme that is currently in effect: the stored choice, else light (the default).
 * @returns {'light'|'dark'}
 */
export function getTheme() {
  return readStored() ?? 'light';
}

/**
 * Applies a theme to the document: .dark class, color-scheme and the theme-color meta tag.
 * @param {'light'|'dark'} theme
 */
export function applyTheme(theme, animate = false) {
  const root = document.documentElement;
  if (animate && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    // Short colour transition (see html.theme-anim in index.css); never used for the first paint.
    root.classList.add('theme-anim');
    window.clearTimeout(animTimer);
    animTimer = window.setTimeout(() => root.classList.remove('theme-anim'), 220);
  }
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {meta.setAttribute('content', COLORS[theme]);}
}

function emit() {
  listeners.forEach((listener) => listener());
}

/**
 * Stores and applies an explicit theme choice.
 * @param {'light'|'dark'} theme
 */
export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
  applyTheme(theme, true);
  emit();
}

// Light is the default. A choice made in another tab is followed too.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) {
      applyTheme(getTheme());
      emit();
    }
  });
  applyTheme(getTheme());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * React hook for the active theme.
 * @returns {{theme: 'light'|'dark', isDark: boolean, setTheme: function, toggleTheme: function}}
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light');
  return {
    theme,
    isDark: theme === 'dark',
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
  };
}
