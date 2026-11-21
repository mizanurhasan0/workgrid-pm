import React from 'react';

// A call control, at least 44px square. `pressed` marks toggles so assistive tech reads the state.
export default function CtrlFooters({
  icon: Icon, label, onClick = () => { }, pressed, danger = false,
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${danger
        ? 'border-danger bg-danger text-surface hover:brightness-110'
        : pressed
          ? 'border-text bg-text text-surface hover:opacity-90'
          : 'border-border bg-raised text-text hover:bg-active'}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
