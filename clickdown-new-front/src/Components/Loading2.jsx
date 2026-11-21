import React from 'react';

/**
 * Spinner. Inherits the text color; defaults to the theme text color.
 * @param {Object} props
 * @param {string} [props.className] Extra classes (size, color).
 * @param {string} [props.label='Loading...'] Screen reader text.
 * @returns {JSX.Element}
 */
export default function Loading2({ className = '', label = 'Loading...' }) {
  return (
    <div
      role="status"
      className={`relative inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-brand ${className}`}
    >
      <span className="sr-only">{label}</span>
    </div>
  );
}
