import React, { useState } from 'react';
import { ArrowRight, Cancel, Search } from '../../../../assets';

const iconBtn = 'flex h-11 w-11 items-center justify-center rounded-lg text-text-muted hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring ';

// Section heading with a search field and a collapse arrow (the arrow points right when collapsed).
export default function Title({
  title, searchLabel, expanded, controls, onToggle, query, onQuery,
}) {
  const [searchView, setSearchView] = useState(false);

  const closeSearch = () => {
    setSearchView(false);
    onQuery('');
  };

  return (
    <div className="box-border min-h-11 shrink-0">
      {searchView ? (
        <form role="search" className="relative" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            aria-label={searchLabel}
            placeholder="Search"
            maxLength={100}
            className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-12 text-sm text-text outline-none focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-focus-ring"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
          <button type="button" aria-label="Close search" onClick={closeSearch} className={`${iconBtn} absolute right-0 top-0`}>
            <Cancel className="h-5 w-5" />
          </button>
        </form>
      ) : (
        <div className="flex items-center">
          <h3 className="text-sm font-semibold text-text">{title}</h3>
          <div className="ml-auto flex items-center">
            <button type="button" aria-label={`Search ${title.toLowerCase()}`} onClick={() => setSearchView(true)} className={iconBtn}>
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label={`${expanded ? 'Collapse' : 'Expand'} ${title.toLowerCase()}`}
              aria-expanded={expanded}
              aria-controls={controls}
              onClick={onToggle}
              className={iconBtn}
            >
              <ArrowRight className={`h-5 w-5 transition-transform ${expanded ? '' : 'rotate-90'}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
