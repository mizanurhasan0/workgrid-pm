import React from 'react';
import { Search } from '../../../../assets';

export default function ChatsHead({ query, onQuery }) {
  return (
    <>
      <h1 className="shrink-0 text-xl font-semibold leading-7 text-brand">Messages</h1>
      <form className="shrink-0" role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            aria-label="Search chats"
            placeholder="Search"
            maxLength={100}
            className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-3 text-sm text-text placeholder:text-text-muted focus-visible:outline-2 focus-visible:outline-focus-ring"
          />
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" />
        </div>
      </form>
    </>
  );
}
