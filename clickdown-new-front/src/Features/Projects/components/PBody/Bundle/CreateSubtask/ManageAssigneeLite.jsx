import React, { useRef, useState } from 'react';
import AvatarGroup from '../../../../../../Components/AvatarGroup';
import Image from '../../../../../../Components/Image';
import { Assignment } from '../../../../../../assets';
import Popover from '../TableComponents/Popover';

// Assignee picker for a task that is not saved yet. The parent owns the selection.
export default function ManageAssigneeLite({
  assignee, members, onAdd, onRemove,
}) {
  const anchorRef = useRef();
  const [open, setOpen] = useState(false);
  const ids = new Set(assignee.map((a) => a.id));

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-label="Assign member"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md px-1 hover:bg-text/8"
      >
        {assignee.length > 0
          ? <AvatarGroup size="xs" maxAvatars={3} avatars={assignee} />
          : <Assignment className="stroke-subText " />}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} label="Assign members" className="w-64 p-2">
        <ul className="max-h-60 overflow-y-auto">
          {members.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                role="menuitemcheckbox"
                aria-checked={ids.has(m.id)}
                onClick={() => (ids.has(m.id) ? onRemove(m) : onAdd(m))}
                className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-text/8"
              >
                <Image className="h-6 w-6 shrink-0 rounded-full" src={m.avatar} alt="" />
                <span className="min-w-0 flex-1 truncate">{m.name}</span>
                {ids.has(m.id) && <span aria-hidden="true" className="text-brand">&#10003;</span>}
              </button>
            </li>
          ))}
          {members.length === 0 && <li className="px-2 py-3 text-sm text-text-muted">No members</li>}
        </ul>
      </Popover>
    </>
  );
}
