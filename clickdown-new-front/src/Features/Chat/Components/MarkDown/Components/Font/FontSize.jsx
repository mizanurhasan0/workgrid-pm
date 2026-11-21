import React, { useEffect, useRef, useState } from 'react';
import { useChatCtx } from '../../../../Context/ChatProvider';

const headings = [
  { name: 'Heading 1', value: 'h1' },
  { name: 'Heading 2', value: 'h2' },
  { name: 'Heading 3', value: 'h3' },
  { name: 'Heading 4', value: 'h4' },
  { name: 'Heading 5', value: 'h5' },
  { name: 'Heading 6', value: 'h6' },
];

const optionClass = 'flex min-h-10 w-full items-center whitespace-nowrap px-3 text-left text-sm text-text hover:bg-brand-solid hover:text-on-brand focus-visible:bg-brand-solid focus-visible:text-on-brand focus-visible:outline-none';

export default function FontSize({ buttonClass = '' }) {
  const { applyStyle } = useChatCtx();
  const boxRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('Aa');

  // Closes the menu on an outside click or Escape while it is open.
  useEffect(() => {
    if (!open) {return undefined;}
    const onPointer = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {setOpen(false);}
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {setOpen(false);}
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (heading, e) => {
    setOpen(false);
    setValue(heading.value.toUpperCase());
    applyStyle(heading.value, e);
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Heading level"
        className={`${buttonClass} w-auto px-2 text-sm font-semibold`}
        onClick={() => setOpen((o) => !o)}
      >
        {value}
      </button>
      {open && (
        <div role="menu" className="absolute left-0 top-full z-dropdown mt-1 min-w-36 overflow-hidden rounded-lg border border-border bg-raised py-1 shadow-elevated">
          {headings.map((h) => (
            <button
              type="button"
              role="menuitem"
              key={h.value}
              className={optionClass}
              onClick={(e) => choose(h, e)}
            >
              {h.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
