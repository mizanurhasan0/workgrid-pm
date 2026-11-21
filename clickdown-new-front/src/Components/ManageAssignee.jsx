import React, {
  useCallback, useMemo, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { AddUser, Assignment } from '../assets';
import AvatarGroup from './AvatarGroup';
import SVGIcon from './SVGIcon';
import Image from './Image';
import Loading3 from './Loading3';
import Popover from '../Features/Projects/components/PBody/Bundle/TableComponents/Popover';

/**
 * Assignee control: avatars plus a button that opens a searchable member picker.
 * The picker is rendered in a portal (Popover) so scroll containers and modals never clip it.
 * `position` is kept for backward compatibility and no longer affects layout.
 */
export default function ManageAssignee({
  assignees = [],
  onAdd = () => { },
  onRemove = () => { },
  showAddButton = true,
  className = '',
  onPopperClose = () => { },
  allUser = false,
  load = false,
}) {
  const { projectId } = useParams();
  const membs = useSelector(
    (state) => (!allUser ? state?.projectStore?.projects?.find((p) => p?.id === projectId)
      : state.projectStore.pUsers),
  );
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const users = useMemo(() => {
    const ids = new Set((assignees ?? []).map((a) => a.id));
    return ((allUser ? membs : membs?.members) ?? []).filter((u) => !ids.has(u.id));
  }, [assignees, allUser, membs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {return users;}
    return users.filter((p) => (p.name ?? '').toLowerCase().includes(q)
      || (p.email ?? '').toLowerCase().includes(q));
  }, [users, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    onPopperClose();
  }, [onPopperClose]);

  if (load) {return <div className="flex items-center"><Loading3 /></div>;}

  const triggerClass = 'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-secondary';

  return (
    <div className={`flex items-center ${showAddButton === true ? 'justify-around px-[0.938rem]' : ''} ${className}`}>
      <div className="mr-1">
        <AvatarGroup maxAvatars={3} avatars={assignees} />
      </div>
      {showAddButton ? (
        <button
          ref={anchorRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => (open ? close() : setOpen(true))}
          className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full border bg-secondary px-3 text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary md:min-h-8"
        >
          <AddUser className="h-5 w-5 stroke-white" aria-hidden="true" />
          <span>Assign Member</span>
        </button>
      ) : (
        <button
          ref={anchorRef}
          type="button"
          aria-label="Assign member"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => (open ? close() : setOpen(true))}
          className={triggerClass}
        >
          <SVGIcon Icon={Assignment} />
        </button>
      )}
      <Popover open={open} onClose={close} anchorRef={anchorRef} label="Assign members" className="w-64 overflow-hidden">
        {assignees?.length > 0 && (
          <ul className="max-h-48 overflow-y-auto border-b border-borderColor dark:border-white/10" aria-label="Assigned members">
            {assignees.map((a) => (
              <li key={`${a.id}-assign`} className="flex min-h-11 items-center gap-2 px-3">
                <Image className="h-6 w-6 shrink-0 rounded-full" src={a.avatar} alt="" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{a.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${a.name}`}
                  onClick={() => onRemove(a)}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md hover:bg-bgSecondary focus-visible:outline-2 focus-visible:outline-secondary dark:hover:bg-white/10"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="p-2">
          <input
            type="search"
            placeholder="Search people..."
            aria-label="Search people"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-md border border-borderColor bg-transparent px-3 text-sm outline-none focus-visible:border-secondary focus-visible:outline-2 focus-visible:outline-secondary dark:border-white/20 md:h-9"
          />
        </div>
        <ul className="max-h-60 overflow-y-auto pb-1" aria-label="Available members">
          {filtered.length === 0 && <li className="px-3 py-3 text-center text-xs text-subText dark:text-darkSubInfo">No people to add</li>}
          {filtered.map((a) => (
            <li key={`${a.id}-new-assign`}>
              <button
                type="button"
                onClick={() => onAdd(a)}
                className="flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 text-left hover:bg-bgSecondary focus-visible:bg-bgSecondary dark:hover:bg-white/10 dark:focus-visible:bg-white/10"
              >
                <Image className="h-6 w-6 shrink-0 rounded-full" src={a.avatar} alt="" />
                <span className="min-w-0 flex-1 truncate text-xs font-medium">{a.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </Popover>
    </div>
  );
}
