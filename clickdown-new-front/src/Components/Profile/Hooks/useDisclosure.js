import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Open/close state for dropdowns. Closes on outside click and Escape (Escape is consumed so an
 * enclosing dialog stays open) and returns the focus to the trigger.
 * @returns {{open: boolean, setOpen: function, toggle: function, rootRef: object, triggerRef: object}}
 */
export default function useDisclosure() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) {return undefined;}
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {setOpen(false);}
    };
    const onKey = (e) => {
      if (e.key !== 'Escape') {return;}
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [open]);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  return {
    open, setOpen, toggle, rootRef, triggerRef,
  };
}
