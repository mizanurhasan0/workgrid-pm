import React from 'react';

export default function Skilton() {
  return (
    <div className="flex h-10 w-full animate-pulse items-center gap-3 px-4" aria-hidden="true">
      <div className="h-7 w-7 shrink-0 rounded-md bg-bgSkeleton" />
      <div className="h-4 w-full rounded bg-bgSkeleton" />
    </div>
  );
}
