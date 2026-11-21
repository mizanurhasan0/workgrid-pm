import React, { useId } from 'react';
import { Arrowdown } from '../../../../assets';
import useDisclosure from '../../Hooks/useDisclosure';

const ACCESS_LEVELS = ['Member', 'Admin'];

/**
 * Access level dropdown for the invite form.
 * @param {Object} props
 * @param {string} props.access Selected level.
 * @param {function} props.setAccess Called with the chosen level.
 * @param {string} props.label Visible label text used as the accessible name.
 * @returns {JSX.Element}
 */
export default function Select({ access, setAccess, label = 'Access level' }) {
  const {
    open, setOpen, toggle, rootRef, triggerRef,
  } = useDisclosure();
  const listId = useId();

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown' && !open) {
      e.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${access}`}
        onClick={toggle}
        onKeyDown={onKeyDown}
        className="flex h-12 w-full items-center justify-between rounded-lg border border-border bg-surface px-4 text-base text-text focus-visible:outline-2 focus-visible:outline-focus-ring"
      >
        <span>{access}</span>
        <Arrowdown className={`h-4 w-4 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div ref={(el) => el?.scrollIntoView({ block: 'nearest' })} id={listId} role="listbox" aria-label={label} className="relative z-30 mt-1 w-full overflow-hidden rounded-lg border border-border bg-surface-raised py-1 shadow-elevated">
          {ACCESS_LEVELS.map((level) => (
            <button
              type="button"
              role="option"
              aria-selected={access === level}
              key={level}
              onClick={() => { setAccess(level); setOpen(false); triggerRef.current?.focus(); }}
              className={`block min-h-11 w-full px-4 text-left text-base text-text hover:bg-brand-solid hover:text-on-brand focus-visible:bg-brand-solid focus-visible:text-on-brand focus-visible:outline-none ${access === level ? 'font-semibold' : ''}`}
            >
              {level}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
