import React from 'react';

export default function Skeleton() {
  return (
    <div role="status" aria-label="Joining the call" className="flex h-full flex-col gap-4 motion-safe:animate-pulse">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-raised">
            <div className="h-20 w-20 rounded-full bg-text/10" />
            <div className="h-4 w-32 rounded-md bg-text/10" />
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-12 w-12 rounded-full bg-text/10" />)}
      </div>
    </div>
  );
}
