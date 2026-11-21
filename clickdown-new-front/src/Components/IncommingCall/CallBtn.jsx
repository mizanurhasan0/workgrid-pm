import React from 'react';
import SVGIcon from '../SVGIcon';
import { Accept, Decline } from '../../assets';

export default function CallBtn({
  title,
  onClick,
}) {
  const decline = title === 'Decline';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${decline ? 'bg-danger' : 'bg-success'} flex h-12 w-full items-center justify-center gap-2 rounded-lg px-3 text-sm font-semibold text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring`}
    >
      <SVGIcon Icon={decline ? Decline : Accept} className="h-5 w-5" />
      <span>{title}</span>
    </button>
  );
}
