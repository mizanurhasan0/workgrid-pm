import React from 'react';
import { Loader2 } from 'lucide-react';

/** Full-width primary submit button with a busy state. */
export default function AuthButton({
  busy = false, busyLabel, children, type = 'submit', disabled = false, onClick,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={busy || disabled}
      aria-busy={busy}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-solid px-6 text-base font-semibold leading-6 text-on-brand transition-colors hover:bg-brand-solid-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
    >
      {busy && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
      {busy && busyLabel ? busyLabel : children}
    </button>
  );
}
