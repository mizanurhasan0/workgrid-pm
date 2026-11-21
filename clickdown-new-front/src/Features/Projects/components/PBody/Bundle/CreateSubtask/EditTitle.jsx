import * as React from 'react';
import { useSelector } from 'react-redux';

export default function EditTitle({ titleRef, onKeyDown }) {
  const placeholder = useSelector((state) => state.projectStore.createTaskOpen.placeholder);
  const label = placeholder === 'New Task' ? placeholder : `Sub task of ${placeholder}`;
  return (
    <input
      ref={titleRef}
      type="text"
      aria-label={label}
      placeholder={`${label}...`}
      onKeyDown={onKeyDown}
      autoFocus
      maxLength={255}
      className="h-11 min-w-0 flex-1 rounded-md border border-border bg-transparent px-3 text-sm text-text outline-hidden focus:border-secondary"
    />
  );
}
