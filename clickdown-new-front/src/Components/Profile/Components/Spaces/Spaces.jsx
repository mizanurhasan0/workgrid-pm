import React, { useEffect, useId, useState } from 'react';
import { toast } from 'react-toastify';
import req from '../../../../Utils/req';
import { Arrowdown } from '../../../../assets';
import useDisclosure from '../../Hooks/useDisclosure';

/**
 * Spaces (projects) a member belongs to, shown as a count with a popover list.
 * @param {Object} props
 * @param {string} props.id Member id.
 * @returns {JSX.Element}
 */
export default function Spaces({ id }) {
  const {
    open, toggle, rootRef, triggerRef,
  } = useDisclosure();
  const listId = useId();
  const [isLoading, setIsLoading] = useState(true);
  const [projectData, setProjectsData] = useState([]);

  useEffect(() => {
    let active = true;
    const filter = encodeURIComponent(JSON.stringify({ $in: id }));
    req({ method: 'GET', uri: `projects?members=${filter}` })
      .then(({ data }) => { if (active) {setProjectsData(data?.docs ?? []);} })
      .catch(() => { if (active) {toast.error('Could not load spaces.');} })
      .finally(() => { if (active) {setIsLoading(false);} });
    return () => { active = false; };
  }, [id]);

  if (isLoading) {
    return <div className="h-10 w-28 animate-pulse rounded-md bg-surface-raised" aria-label="Loading spaces" role="status" />;
  }
  const count = projectData.length;
  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={toggle}
        disabled={count === 0}
        className="flex min-h-11 items-center gap-2 rounded-md px-2 md:-ml-2 text-sm text-text-muted focus-visible:outline-2 focus-visible:outline-focus-ring disabled:cursor-default md:min-h-10"
      >
        <span>{count > 0 ? `${count} ${count === 1 ? 'space' : 'spaces'}` : 'No spaces'}</span>
        {count > 0 ? <Arrowdown className={`h-4 w-4 ${open ? 'rotate-180' : ''}`} /> : null}
      </button>
      {open ? (
        <ul id={listId} className="absolute left-0 z-20 mt-1 max-h-56 w-56 max-w-[calc(100vw-3rem)] list-none overflow-y-auto rounded-lg border border-border bg-surface-raised py-1 shadow-elevated">
          {projectData.map((p) => <li key={p.id} className="truncate px-4 py-2 text-sm text-text">{p?.name}</li>)}
        </ul>
      ) : null}
    </div>
  );
}
