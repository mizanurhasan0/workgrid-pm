import React from 'react';

const CHUNK_PATTERN = /dynamically imported module|Importing a module script failed|ChunkLoadError|Loading chunk|error loading dynamically/i;

/**
 * Catches render errors, including lazy-chunk download failures after a deploy or when offline.
 * Resets itself when `resetKey` changes (pass the route path).
 * @param {Object} props
 * @param {*} [props.resetKey] Change it to clear the error state.
 * @param {ReactNode} props.children
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidUpdate(prevProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error) {
    console.error('Page crashed:', error);
  }

  render() {
    const { error } = this.state;
    if (!error) {return this.props.children;}
    const isChunk = CHUNK_PATTERN.test(String(error?.message ?? error));
    return (
      <main role="alert" className="flex min-h-screen flex-col items-center justify-center gap-4 bg-app px-4 text-center text-text">
        <p className="text-sm font-semibold text-brand">{isChunk ? 'Update available' : 'Something went wrong'}</p>
        <h1 className="text-balance">{isChunk ? 'This page could not be loaded' : 'We hit an unexpected problem'}</h1>
        <p className="max-w-md text-pretty text-text-muted">
          {isChunk
            ? 'A new version may have been released, or your connection dropped. Reload to get the latest version.'
            : 'Try reloading the page. If the problem continues, go back to the start page.'}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-control-lg rounded-control bg-brand-solid px-6 font-semibold text-on-brand hover:bg-brand-solid-hover"
          >
            Reload
          </button>
          <a
            href="/"
            className="inline-flex min-h-control-lg items-center rounded-control border border-border-strong px-6 font-semibold text-text hover:bg-hover"
          >
            Go to start
          </a>
        </div>
      </main>
    );
  }
}
