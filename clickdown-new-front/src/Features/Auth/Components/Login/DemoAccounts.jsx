import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { DEMO_ACCOUNTS } from './demoAccountList';

// One soft colour per role. Classes come from the shared theme tokens, so they follow light and dark.
const ROLE_STYLE = {
  Owner: 'bg-brand-soft text-brand',
  Admin: 'bg-info-soft text-info-text',
  Member: 'bg-success-soft text-success',
};

/**
 * Development-only shortcut list (see SHOW_DEMO_ACCOUNTS).
 * Clicking a row fills the login form with that account's email and password.
 * @param {Object} props
 * @param {(email: string, password: string) => void} props.onFill Called with the chosen credentials.
 */
export default function DemoAccounts({ onFill }) {
  const [filled, setFilled] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const choose = (account) => {
    onFill(account.email, account.password);
    setFilled(account.email);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFilled(null), 2000);
  };

  return (
    <section aria-labelledby="demo-accounts-title" className="mt-8 w-full max-w-md">
      <div className="flex items-center gap-3" role="presentation">
        <span className="h-px flex-1 bg-border" />
        <h2 id="demo-accounts-title" className="text-xs font-semibold uppercase leading-4 tracking-wide text-text-muted">
          Demo accounts
          <span className="ml-1.5 normal-case tracking-normal font-normal">(development only)</span>
        </h2>
        <span className="h-px flex-1 bg-border" />
      </div>
      <p className="mt-3 text-center text-sm leading-5 text-text-muted">Pick a role to fill in its email and password.</p>

      <ul className="mt-4 grid list-none gap-2 p-0">
        {DEMO_ACCOUNTS.map((account) => {
          const isFilled = filled === account.email;
          return (
            <li key={account.email} className="list-none">
              <button
                type="button"
                onClick={() => choose(account)}
                aria-label={`Fill in the ${account.role} demo account. ${account.description}`}
                className="group flex min-h-14 w-full items-center gap-3 rounded-xl border border-border bg-surface-raised px-3 py-2.5 text-left transition-colors hover:border-brand/60 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring active:scale-[0.99]"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${ROLE_STYLE[account.role] || 'bg-neutral-soft text-text-muted'}`}
                >
                  {account.role.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold leading-5 text-text">{account.role}</span>
                    <span className="truncate text-xs leading-5 text-text-muted">{account.description}</span>
                  </span>
                  <span className="block truncate font-mono text-xs leading-5 text-text-muted">{account.email}</span>
                </span>
                <span
                  aria-hidden="true"
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors ${isFilled ? 'bg-success-soft text-success' : 'text-text-muted group-hover:text-brand'}`}
                >
                  {isFilled ? <Check className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" role="status" aria-live="polite">
        {filled ? 'Demo account filled in. Press Sign in to continue.' : ''}
      </p>
    </section>
  );
}
