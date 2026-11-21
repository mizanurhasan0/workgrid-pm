import React, { useEffect, useState } from 'react';
import Activities from '../Components/Acitivities/Activities';
import Notification from '../Components/Notification/Notification';

export default function Wrapper() {
  // Below lg the details pane is a full-screen sheet opened by selecting a row.
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!sheetOpen) {return undefined;}
    const onKey = (e) => { if (e.key === 'Escape') {setSheetOpen(false);} };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sheetOpen]);

  return (
    <section className="grid w-full grid-cols-1 bg-surface text-text lg:grid-cols-2">
      <div className="min-w-0">
        <Notification onSelect={() => setSheetOpen(true)} />
      </div>
      <div
        className={`${sheetOpen ? 'fixed inset-0 z-50 overflow-y-auto' : 'hidden'} bg-surface lg:static lg:z-auto lg:block lg:overflow-visible min-w-0`}
        {...(sheetOpen ? { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Notification details' } : {})}
      >
        <div className="sticky top-0 z-10 flex items-center border-b border-border bg-surface p-2 lg:hidden">
          <button
            type="button"
            onClick={() => setSheetOpen(false)}
            className="min-h-11 rounded-md px-4 text-sm font-medium text-brand focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            &larr; Back to notifications
          </button>
        </div>
        <Activities />
      </div>
    </section>
  );
}
