import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navlogo } from '../assets';
import { useAuth } from '../Context/AuthProvider';

/**
 * Friendly 404 page. Offers a way back that fits the visitor's sign-in state.
 * @returns {JSX.Element}
 */
export default function NotFound() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const signedIn = Boolean(user?.email);

  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center gap-5 page-gutter py-10 text-center bg-app text-text">
      <Link to="/" className="inline-flex items-center gap-2 rounded-control">
        <img src={Navlogo} alt="" width="40" height="40" className="h-10 w-10" />
        <span className="text-xl font-bold">Workgrid</span>
      </Link>
      <p className="text-6xl font-bold tabular text-brand" aria-hidden="true">404</p>
      <h1 className="text-balance">We could not find that page</h1>
      <p className="max-w-md text-pretty text-text-muted">
        Nothing lives at
        {' '}
        <code className="break-all rounded bg-panel px-1.5 py-0.5 text-sm text-text">{pathname}</code>
        {' '}
        (the link may be broken or the page may have moved).
      </p>
      <div className="flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
        <Link to="/" className="inline-flex min-h-control-lg items-center justify-center rounded-control bg-brand-solid px-6 font-semibold text-on-brand hover:bg-brand-solid-hover">
          {signedIn ? 'Back to projects' : 'Back to home'}
        </Link>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex min-h-control-lg items-center justify-center rounded-control border border-border-strong px-6 font-semibold text-text hover:bg-hover"
        >
          Go back
        </button>
        {signedIn ? null : (
          <Link to="/signin" className="inline-flex min-h-control-lg items-center justify-center rounded-control border border-border-strong px-6 font-semibold text-brand hover:bg-hover">
            Sign in
          </Link>
        )}
      </div>
    </main>
  );
}
