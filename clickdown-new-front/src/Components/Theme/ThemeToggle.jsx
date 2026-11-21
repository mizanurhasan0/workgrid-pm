import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme';

/**
 * Accessible light/dark switch. Persists the choice (see theme.js).
 * @param {Object} props
 * @param {string} [props.className] Extra classes for the button.
 * @param {boolean} [props.showLabel] Show the text next to the icon.
 * @returns {JSX.Element}
 */
export default function ThemeToggle({ className = '', showLabel = false }) {
  const { isDark, toggleTheme } = useTheme();
  const label = isDark ? 'Switch to light mode' : 'Switch to dark mode';
  const Icon = isDark ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center gap-2 min-h-tap min-w-tap rounded-control text-text-muted hover:text-brand hover:bg-hover transition-colors ${className}`}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {showLabel ? <span className="text-sm font-medium">{isDark ? 'Light mode' : 'Dark mode'}</span> : null}
    </button>
  );
}
