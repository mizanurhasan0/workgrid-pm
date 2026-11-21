import React from 'react';
import { BgIcon, Logo } from '../../../../assets';

/** Brand panel. Hidden below lg: phones and tablets show the form alone, with its own logo. */
export default function SideBanner() {
  return (
    <aside
      aria-label="About Workgrid"
      className="sticky top-0 m-4 hidden h-[calc(100dvh-2rem)] w-5/12 max-w-lg shrink-0 flex-col overflow-hidden rounded-xl bg-gradient-to-br from-brand-solid to-[color-mix(in_oklab,var(--brand-solid),black_40%)] p-10 text-on-brand relative shadow-card ring-1 ring-inset ring-white/10 lg:flex dark:from-brand-solid/90 dark:to-surface-alt xl:w-1/3"
    >
      <BgIcon className="pointer-events-none absolute -bottom-16 -right-16 h-auto w-80 opacity-10" />
      <div className="relative flex items-center gap-3">
        <Logo className="h-10 w-10 rounded-xl ring-2 ring-on-brand" />
        <span className="text-xl font-bold leading-7">Workgrid</span>
      </div>
      <div className="relative my-auto py-10">
        <h2 className="text-3xl font-semibold leading-tight text-balance xl:text-4xl">Start your journey with us</h2>
        <p className="pt-4 text-base leading-6 text-on-brand/85">Plan sprints, track tasks and keep your whole team in sync, all in one place.</p>
      </div>
    </aside>
  );
}
