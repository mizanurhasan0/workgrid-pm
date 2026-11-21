import React, {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { createPortal } from 'react-dom';

const GAP = 6;
const MARGIN = 8;

/**
 * Floating panel rendered in a portal so table scroll containers never clip it.
 * Positioned under `anchorRef` (flipped above when there is no room) and kept inside the viewport.
 * `modal` centres the panel with a backdrop instead, which suits wide pickers on phones.
 * Closes on outside press and on Escape (focus returns to the anchor).
 */
export default function Popover({
  open, onClose, anchorRef, children, align = 'start', modal = false, label, className = '',
}) {
  const panelRef = useRef(null);
  const [style, setStyle] = useState({ visibility: 'hidden', top: 0, left: 0 });

  const place = useCallback(() => {
    const anchor = anchorRef?.current;
    const panel = panelRef.current;
    if (!panel || modal || !anchor) {return;}
    const a = anchor.getBoundingClientRect();
    const { offsetWidth: w, offsetHeight: h } = panel;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = align === 'end' ? a.right - w : align === 'center' ? a.left + (a.width - w) / 2 : a.left;
    left = Math.max(MARGIN, Math.min(left, vw - w - MARGIN));
    const below = a.bottom + GAP;
    const fitsBelow = below + h <= vh - MARGIN;
    const above = a.top - GAP - h;
    const top = fitsBelow || above < MARGIN ? Math.max(MARGIN, Math.min(below, vh - h - MARGIN)) : above;
    setStyle({ visibility: 'visible', top, left });
  }, [anchorRef, align, modal]);

  useLayoutEffect(() => {
    if (open) {place();}
  }, [open, place, children]);

  // A dialog opened from inside this popover (for example a delete confirmation) is rendered in
  // its own portal after the panel. While it is on top, the popover must neither close nor steal Escape.
  const hasDialogAbove = useCallback(() => [...document.querySelectorAll('[aria-modal="true"]')].some(
    (el) => panelRef.current && (panelRef.current.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0,
  ), []);

  useEffect(() => {
    if (!open) {return undefined;}
    const onPointerDown = (e) => {
      if (panelRef.current?.contains(e.target) || anchorRef?.current?.contains(e.target)) {return;}
      if (e.target instanceof Element && e.target.closest('[aria-modal="true"]') && hasDialogAbove()) {return;}
      onClose();
    };
    const onKeyDown = (e) => {
      if (e.key !== 'Escape' || hasDialogAbove()) {return;}
      e.stopPropagation();
      onClose();
      anchorRef?.current?.focus?.();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, onClose, anchorRef, place, hasDialogAbove]);

  // Move focus into the panel so keyboard users can reach the options
  useEffect(() => {
    if (!open) {return;}
    const first = panelRef.current?.querySelector('input, button, [tabindex]');
    first?.focus?.();
  }, [open]);

  if (!open) {return null;}
  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={label}
      style={modal ? undefined : style}
      className={`${modal ? '' : 'fixed'} z-[1000] max-w-[calc(100vw-1rem)] rounded-lg border border-border bg-surface-raised text-text shadow-xl shadow-black/20 dark:shadow-black/60 ${className}`}
    >
      {children}
    </div>
  );
  return createPortal(
    modal ? (
      <div className="fixed inset-0 z-[1000] grid place-items-center bg-scrim p-4">{panel}</div>
    ) : panel,
    document.body,
  );
}

// Row inside a Popover menu. 44px tall for touch.
export function MenuItem({
  children, onClick, selected = false, className = '',
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      className={`flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-3 text-left text-sm hover:bg-text/8 focus-visible:bg-text/8 ${selected ? 'bg-brand-solid/10 font-semibold' : ''} ${className}`}
    >
      {children}
    </button>
  );
}
