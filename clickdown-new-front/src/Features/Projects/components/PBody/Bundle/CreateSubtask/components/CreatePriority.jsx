import React, { useRef, useState } from 'react';
import { Flag } from '../../../../../../../assets';
import { priorityChipClass, priorityOptions } from '../../bundleHelpers';
import Popover, { MenuItem } from '../../TableComponents/Popover';

function CreatePriority({ handlePriority, priority }) {
  const anchorRef = useRef();
  const [open, setOpen] = useState(false);
  const current = priority || priorityOptions[0];

  const onSelection = (option) => {
    handlePriority(option);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-label={`Priority: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap ${priorityChipClass[current.name]}`}
      >
        <Flag className="h-3.5 w-3.5 fill-current stroke-current" />
        {current.label}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} label="Select priority" className="w-48 p-1">
        <div role="menu">
          {priorityOptions.map((option) => (
            <MenuItem key={option.name} selected={option.name === current.name} onClick={() => onSelection(option)}>
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${priorityChipClass[option.name]}`}>
                <Flag className="h-3.5 w-3.5 fill-current stroke-current" />
              </span>
              {option.label}
            </MenuItem>
          ))}
        </div>
      </Popover>
    </>
  );
}

export default CreatePriority;
