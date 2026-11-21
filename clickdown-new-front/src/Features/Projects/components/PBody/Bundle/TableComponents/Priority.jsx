import React, { useRef, useState } from 'react';
import { Flag } from '../../../../../../assets';
import { useProjectsCtx } from '../../../../context/ProjectsProvider';
import Loading3 from '../../../../../../Components/Loading3';
import {
  findPriority, priorityChipClass, priorityOptions, taskTypeFor,
} from '../bundleHelpers';
import Popover, { MenuItem } from './Popover';

function Priority({
  tree,
  viewId,
  taskId,
  priority,
  bundleInfo,
}) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const { updateTask } = useProjectsCtx();
  // Show the stored value; an optimistic pick is held only until the store catches up
  const [pending, setPending] = useState(null);
  const selected = findPriority(pending && pending.from === priority ? pending.name : priority);

  function handleOptionClick(option) {
    setOpen(false);
    if (option.name === selected.name) {return;}
    setPending({ name: option.name, from: priority });
    updateTask({
      load: (busy) => {
        setLoad(busy);
        if (!busy) {setPending(null);}
      },
      taskId,
      storePayload: {
        tree,
        viewId,
        taskType: taskTypeFor(bundleInfo),
        sprintId: bundleInfo?.sprintId,
        dataType: 'dropdown',
      },
      payload: {
        priority: option.name,
      },
    });
  }

  if (load) {return <div className="flex h-11 w-24 items-center justify-center"><Loading3 /></div>;}
  return (
    <div className="flex min-h-11 items-center">
      <button
        ref={anchorRef}
        type="button"
        aria-label={`Priority: ${selected.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-xs font-medium whitespace-nowrap ${priorityChipClass[selected.name]}`}
      >
        <Flag className="h-3.5 w-3.5 shrink-0 fill-current stroke-current" />
        {selected.label}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} label="Select priority" className="w-48 p-1">
        <div role="menu">
          <p className="px-3 py-2 text-xs font-medium text-text-muted">Priority</p>
          {priorityOptions.map((option) => (
            <MenuItem key={option.name} selected={option.name === selected.name} onClick={() => handleOptionClick(option)}>
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${priorityChipClass[option.name]}`}>
                <Flag className="h-3.5 w-3.5 fill-current stroke-current" />
              </span>
              {option.label}
            </MenuItem>
          ))}
        </div>
      </Popover>
    </div>
  );
}

export default Priority;
