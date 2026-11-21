import React from 'react';

/**
 * Three-dot pulse for inline waiting states (typing, sending).
 * @returns {JSX.Element}
 */
export default function Loading3() {
  return (
    <div role="status" aria-label="Loading" className="dot-pulse relative h-[10px] w-[10px] rounded-md bg-brand text-brand" />
  );
}
