import React from 'react';
import { ArrowRight } from '../../../../assets';

// Section heading that collapses its list. The arrow points right when collapsed.
export default function Title({
  Icon, title, expanded, controls, onToggle,
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onToggle}
      className="flex min-h-11 w-full shrink-0 items-center gap-2 rounded-md px-1 text-left text-sm font-medium text-text-muted focus-visible:outline-2 focus-visible:outline-focus-ring"
    >
      <Icon className="h-5 w-5" />
      <span>{title}</span>
      <ArrowRight aria-hidden="true" className={`ml-auto h-5 w-5 transition-transform ${expanded ? '' : 'rotate-90'}`} />
    </button>
  );
}
