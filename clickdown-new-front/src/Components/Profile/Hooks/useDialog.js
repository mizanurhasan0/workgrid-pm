import { useEffect } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Dialog behaviour: focuses the dialog on open, keeps Tab inside it and restores the focus on close.
 * Escape handling stays with the caller so nested dialogs can decide who closes first.
 * @param {React.RefObject<HTMLElement>} ref The dialog element.
 */
export default function useDialog(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) {return undefined;}
    const previous = document.activeElement;
    const first = el.querySelector('[data-autofocus]');
    (first || el).focus({ preventScroll: true });
    const onKeyDown = (e) => {
      if (e.key !== 'Tab') {return;}
      const items = [...el.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null);
      if (items.length === 0) {return;}
      const firstItem = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    el.addEventListener('keydown', onKeyDown);
    return () => {
      el.removeEventListener('keydown', onKeyDown);
      if (previous && previous.focus && document.contains(previous)) {previous.focus({ preventScroll: true });}
    };
  }, [ref]);
}
