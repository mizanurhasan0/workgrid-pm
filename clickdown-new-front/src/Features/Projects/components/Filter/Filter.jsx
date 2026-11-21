import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { ChevronDown } from 'lucide-react';
import req from '../../../../Utils/req';
import { setFavourites, setProjects, setView } from '../../projectReducers';

const FILTERS = ['All Tasks', 'Todo', 'In Review', 'In Progress', 'Done'];
const TASK_TYPE = { backlog: 'tasks', bug: 'bugs', sprint: 'sprints' };

/**
 * Loads the tasks of one view that match a status value and writes them back to the store.
 * Everything else is read from the store with getState so the caller only needs the ids.
 */
const applyStatusFilter = (viewId, statusName, group) => async (dispatch, getState) => {
  const { projectStore } = getState();
  const view = projectStore.view?.find((v) => v.id === viewId);
  if (!view) {return;}
  const { type, projectId, sprintId } = view.bundleInfo || {};
  const taskType = TASK_TYPE[type];
  if (!taskType) {return;}

  const project = projectStore[group]?.find((p) => p.id === projectId);
  const statusCf = project?.customFields?.find((f) => f?.cf?.name?.toLowerCase() === 'status')?.cf;
  const params = new URLSearchParams({ value: statusName, taskType });
  if (statusCf?.id) {params.set('cf', statusCf.id);}
  if (sprintId) {params.set('sprintId', sprintId);}

  try {
    const { data } = await req({ uri: `project/status/${projectId}?${params}` });
    const updatedProjects = (getState().projectStore[group] || [])
      .map((p) => (p.id === data.id ? data : p));
    dispatch(group === 'projects' ? setProjects(updatedProjects) : setFavourites(updatedProjects));

    const tasks = taskType === 'sprints'
      ? data.sprints?.find((s) => s.id === sprintId)?.tasks
      : data[taskType];
    dispatch(setView(getState().projectStore.view.map(
      (v) => (v.id === viewId ? { ...v, tasks } : v),
    )));
  } catch (error) {
    console.log(error);
    toast.error('Could not filter tasks');
  }
};

export default function Filter({ currentView, group = 'projects' }) {
  const dispatch = useDispatch();
  const viewId = currentView?.id;
  const [selected, setSelected] = useState(FILTERS[0]);
  const [open, setOpen] = useState(false);
  const [trackedView, setTrackedView] = useState(viewId);
  const wrapperRef = useRef(null);

  // Reset the label when another view is shown (render-time state adjustment, no effect).
  if (trackedView !== viewId) {
    setTrackedView(viewId);
    setSelected(FILTERS[0]);
    setOpen(false);
  }

  // Each time a view is shown, start from all of its tasks.
  useEffect(() => {
    if (viewId) {dispatch(applyStatusFilter(viewId, FILTERS[0], group));}
  }, [dispatch, viewId, group]);

  // Close the list on outside click or Escape.
  useEffect(() => {
    if (!open) {return undefined;}
    const onMouseDown = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {setOpen(false);}
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {setOpen(false);}
    };
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (filterName) => {
    setSelected(filterName);
    setOpen(false);
    dispatch(applyStatusFilter(viewId, filterName, group));
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Filter tasks by status, current: ${selected}`}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-max items-center gap-2 rounded-md bg-text/10 px-3 text-sm text-text hover:bg-text/15 focus-visible:outline-2 focus-visible:outline-secondary md:h-8"
      >
        <span>{selected}</span>
        <ChevronDown size={16} aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul role="listbox" aria-label="Status filter" className="absolute left-0 top-full z-50 mt-1 min-w-36 rounded-md border border-border bg-surface-raised p-1 shadow-lg">
          {FILTERS.map((f) => (
            <li key={f} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={f === selected}
                onClick={() => choose(f)}
                className={`flex min-h-11 w-full items-center rounded px-2 text-left text-sm hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:min-h-8 ${f === selected ? 'font-semibold text-brand' : 'text-text'}`}
              >
                {f}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
