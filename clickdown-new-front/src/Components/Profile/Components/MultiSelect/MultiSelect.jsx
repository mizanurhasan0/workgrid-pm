import React, { useEffect, useId, useState } from 'react';
import { useSelector } from 'react-redux';
import { Arrowdown } from '../../../../assets';
import req from '../../../../Utils/req';
import useDisclosure from '../../Hooks/useDisclosure';

/**
 * Multi-select of projects for the invite form.
 * @param {Object} props
 * @param {Array} props.projects Selected project ids.
 * @param {function} props.setProjects Updates the selected ids.
 * @param {boolean} props.invalid Marks the control as invalid.
 * @returns {JSX.Element}
 */
export default function MultiSelect({ projects = [], setProjects, invalid = false }) {
  const {
    open, toggle, rootRef, triggerRef,
  } = useDisclosure();
  const listId = useId();
  const { projects: stored } = useSelector((state) => state.projectStore);
  // The projects store is only filled on project pages; load the list here when it is empty.
  const [fetched, setFetched] = useState([]);
  const ps = stored?.length ? stored : fetched;

  useEffect(() => {
    if (stored?.length) {return undefined;}
    let active = true;
    req({ method: 'GET', uri: 'projects' })
      .then(({ data }) => { if (active) {setFetched(data?.docs ?? []);} })
      .catch(() => {});
    return () => { active = false; };
  }, [stored?.length]);

  const handleSelect = (id) => {
    setProjects((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={toggle}
        className={`flex h-12 w-full items-center justify-between rounded-lg border bg-surface px-4 text-base text-text focus-visible:outline-2 focus-visible:outline-focus-ring ${invalid ? 'border-danger' : 'border-border'}`}
      >
        <span className="truncate">
          {projects.length > 0
            ? `${projects.length} ${projects.length === 1 ? 'project selected' : 'projects selected'}`
            : 'Select projects'}
        </span>
        <Arrowdown className={`h-4 w-4 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div ref={(el) => el?.scrollIntoView({ block: 'nearest' })} id={listId} role="group" aria-label="Projects" className="relative z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-surface-raised py-1 shadow-elevated">
          {ps?.length ? ps.map((m) => (
            <label key={m.id} className="flex min-h-11 cursor-pointer items-center gap-3 px-4 text-base text-text hover:bg-brand-solid/10">
              <input
                type="checkbox"
                checked={projects.includes(m.id)}
                onChange={() => handleSelect(m.id)}
                className="h-5 w-5 shrink-0 accent-secondary"
              />
              <span className="truncate">{m.name}</span>
            </label>
          )) : <p className="px-4 py-3 text-sm text-text-muted">No projects found.</p>}
        </div>
      ) : null}
    </div>
  );
}
