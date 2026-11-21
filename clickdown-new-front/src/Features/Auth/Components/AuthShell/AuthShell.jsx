import React from 'react';
import { BgIcon } from '../../../../assets';
import SideBanner from '../SideBanner/SideBanner';

/**
 * Page frame shared by every auth screen: brand banner (large screens only) next to a
 * centred, scrollable column. Uses dvh so the on-screen keyboard never hides the form.
 */
export default function AuthShell({ children }) {
  return (
    <main className="flex min-h-dvh bg-surface text-text-muted">
      <SideBanner />
      <div className="relative flex-1 min-w-0 overflow-x-hidden">
        <BgIcon className="pointer-events-none absolute right-0 top-0 h-auto w-64 max-w-[60%] opacity-10 dark:opacity-[0.07]" />
        <div className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-8 sm:px-6">
          {children}
        </div>
      </div>
    </main>
  );
}
