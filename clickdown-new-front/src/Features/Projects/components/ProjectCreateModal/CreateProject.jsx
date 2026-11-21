import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/**
 * Generic centred dialog used by the create forms.
 * Closes on backdrop click or Escape (calls setState(false)), moves focus into the dialog
 * on open and gives focus back to the opener on close.
 */
export default function CreateProject({ setState = () => { }, label = 'Dialog', children }) {
  const dialogRef = useRef(null);
  const setStateRef = useRef(setState);

  useEffect(() => {
    setStateRef.current = setState;
  }, [setState]);

  useEffect(() => {
    const opener = document.activeElement;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setStateRef.current(false);
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) {return;}
      // Keep Tab inside the dialog
      const items = [...dialogRef.current.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])')]
        .filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) {return;}
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.querySelector('input, textarea, select, button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (opener instanceof HTMLElement && opener.isConnected) {opener.focus();}
    };
  }, []);

  const onBackdropClick = (e) => {
    if (dialogRef.current && !dialogRef.current.contains(e.target)) {setStateRef.current(false);}
  };

  return createPortal(
    <div className="relative z-[999]">
      <div className="fixed inset-0 bg-scrim transition-opacity" aria-hidden="true" />

      <div className="fixed inset-0 z-10 w-full overflow-y-auto">
        <div
          className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          onClick={onBackdropClick}
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={label}
            className="relative max-h-[90dvh] w-full overflow-y-auto transform rounded-lg border border-border bg-surface-raised text-left shadow-2xl transition-all sm:my-8 sm:max-w-lg"
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
