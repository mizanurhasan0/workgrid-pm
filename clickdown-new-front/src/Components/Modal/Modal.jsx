import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Cancel } from '../../assets';

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const WIDTHS = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl' };

let lockCount = 0;
let savedOverflow = '';
let savedPadding = '';

function lockScroll() {
  if (lockCount === 0) {
    const { body, documentElement } = document;
    savedOverflow = body.style.overflow;
    savedPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) {body.style.paddingRight = `${scrollbar}px`;}
  }
  lockCount += 1;
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow;
    document.body.style.paddingRight = savedPadding;
  }
}

/**
 * Accessible modal dialog rendered in a portal.
 * Escape and a backdrop press call onClose, focus is trapped inside and restored on close,
 * page scroll is locked while open. On phones it is a full-screen page ('full') or a bottom sheet ('sheet').
 *
 * @param {Object} props
 * @param {boolean} [props.show=false] Whether the modal is visible.
 * @param {function} props.onClose Called on Escape, backdrop press and the close button.
 * @param {ReactNode} props.children Dialog content.
 * @param {string} [props.title] Optional visible heading; also labels the dialog.
 * @param {string} [props.ariaLabelledBy] Id of a heading inside children, when no title is given.
 * @param {'sm'|'md'|'lg'} [props.size='md'] Max width from the sm breakpoint up.
 * @param {'full'|'sheet'} [props.mobile='full'] Phone layout.
 * @param {boolean} [props.dismissible=true] Set false to ignore Escape and backdrop presses.
 * @returns {ReactNode}
 */
export default function Modal({
  show = false,
  onClose = () => { },
  children,
  title,
  ariaLabelledBy,
  size = 'md',
  mobile = 'full',
  dismissible = true,
}) {
  const dialogRef = useRef(null);
  const bodyRef = useRef(null);
  const closeRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!show) {return undefined;}
    const previouslyFocused = document.activeElement;
    lockScroll();
    const first = bodyRef.current?.querySelector(FOCUSABLE) ?? dialogRef.current?.querySelector(FOCUSABLE);
    (first ?? dialogRef.current)?.focus();

    const onKey = (event) => {
      if (event.key === 'Escape' && dismissible) {
        event.stopPropagation();
        closeRef.current?.();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) {return;}
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (event.shiftKey && (document.activeElement === firstEl || document.activeElement === dialogRef.current)) {
        event.preventDefault();
        lastEl.focus();
      } else if (!event.shiftKey && document.activeElement === lastEl) {
        event.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      unlockScroll();
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {previouslyFocused.focus();}
    };
  }, [show, dismissible]);

  if (!show) {return null;}

  const sheet = mobile === 'sheet';
  const panelMobile = sheet
    ? 'max-sm:mt-auto max-sm:max-h-[92dvh] max-sm:rounded-t-sheet'
    : 'max-sm:h-full max-sm:max-h-none max-sm:rounded-none';

  return createPortal(
    <div
      className="fixed inset-0 z-modal flex items-stretch justify-center bg-scrim sm:items-center sm:p-6"
      onMouseDown={(event) => {
        if (dismissible && event.target === event.currentTarget) {onClose?.();}
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : ariaLabelledBy}
        tabIndex={-1}
        className={`relative flex w-full flex-col border border-border bg-raised text-text shadow-sheet outline-none sm:max-h-[90dvh] sm:rounded-sheet ${WIDTHS[size] ?? WIDTHS.md} ${panelMobile}`}
      >
        <div className="flex items-start justify-between gap-4 px-5 pt-4 sm:px-6">
          {title ? <h2 id={titleId} className="pt-1">{title}</h2> : <span />}
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-2 inline-flex h-tap w-tap shrink-0 items-center justify-center rounded-control text-text-muted hover:bg-surface-alt hover:text-text"
          >
            <Cancel className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div ref={bodyRef} className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6 pb-safe">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
