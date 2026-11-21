import React, { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import AvatarGroup from '../../../../../../Components/AvatarGroup';
import Image from '../../../../../../Components/Image';
import { Assignment } from '../../../../../../assets';
import Loading3 from '../../../../../../Components/Loading3';
import { useProjectsCtx } from '../../../../context/ProjectsProvider';
import { taskTypeFor } from '../bundleHelpers';
import Popover from './Popover';

const EMPTY = [];

// Assign or unassign project members. Rendered in a portal so table scrolling never clips it.
export default function Assignee({
  assignee = EMPTY,
  taskId,
  tree,
  viewId,
}) {
  const { projectId } = useParams();
  const { updateTask } = useProjectsCtx();
  const [load, setLoad] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const anchorRef = useRef(null);

  const bundleInfo = useSelector((state) => state.projectStore.view.find((v) => v.id === viewId)?.bundleInfo);
  const members = useSelector((state) => state.projectStore.projects.find((p) => p.id === projectId)?.members) ?? EMPTY;

  const assignedIds = useMemo(() => new Set(assignee.map((a) => a.id)), [assignee]);
  const q = search.trim().toLowerCase();
  const shown = useMemo(() => members.filter((m) => !q
    || (m.name ?? '').toLowerCase().includes(q) || (m.email ?? '').toLowerCase().includes(q)), [members, q]);

  const sendChange = (user, method) => {
    updateTask({
      load: setLoad,
      taskId,
      storePayload: {
        tree,
        viewId,
        taskType: taskTypeFor(bundleInfo),
        sprintId: bundleInfo?.sprintId,
        ...(method === 'remove' && { dataType: 'member' }),
      },
      payload: {
        assigneeArr: { [method]: [user.id] },
      },
    });
  };

  const names = assignee.map((a) => a.name).filter(Boolean).join(', ');
  const close = () => { setOpen(false); setSearch(''); };

  if (load) {return <div className="flex min-h-11 items-center"><Loading3 /></div>;}
  return (
    <div className="flex min-h-11 items-center">
      <button
        ref={anchorRef}
        type="button"
        aria-label={names ? `Assignees: ${names}. Change assignees` : 'Assign member'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-md px-1 hover:bg-text/8"
      >
        {assignee.length > 0
          ? <AvatarGroup size="xs" maxAvatars={3} avatars={assignee} />
          : <Assignment className="stroke-subText " />}
      </button>
      <Popover open={open} onClose={close} anchorRef={anchorRef} label="Assign members" className="w-64 p-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search people"
          aria-label="Search people"
          className="mb-1 h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-hidden focus:border-secondary"
        />
        <ul className="max-h-60 overflow-y-auto">
          {shown.map((m) => {
            const on = assignedIds.has(m.id);
            return (
              <li key={m.id}>
                <button
                  type="button"
                  role="menuitemcheckbox"
                  aria-checked={on}
                  onClick={() => sendChange(m, on ? 'remove' : 'add')}
                  className="flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-2 text-left text-sm hover:bg-text/8"
                >
                  <Image className="h-6 w-6 shrink-0 rounded-full" src={m.avatar} alt="" />
                  <span className="min-w-0 flex-1 truncate">{m.name}</span>
                  {on && <span aria-hidden="true" className="text-brand">&#10003;</span>}
                </button>
              </li>
            );
          })}
          {shown.length === 0 && <li className="px-2 py-3 text-sm text-text-muted">No people found</li>}
        </ul>
      </Popover>
    </div>
  );
}
