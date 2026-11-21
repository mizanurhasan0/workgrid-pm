import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  ArrowRight3,
  Cancel,
  Time,
} from '../../../../assets';
import { updateDrawer } from '../../projectReducers';
import Timer from '../../../Timer/Timer';

// View bundle type -> key used by the task API for the task list it lives in.
export const TASK_TYPE = { backlog: 'tasks', bug: 'bugs', sprint: 'sprints' };

// Payload the socket handlers need to place an updated task in the right list.
export function buildStorePayload({ bundleInfo, viewId, tree }) {
  return {
    tree,
    viewId,
    taskType: TASK_TYPE[bundleInfo?.type],
    sprintId: bundleInfo?.sprintId,
  };
}

function TopHeader({
  taskIds = [], taskId, viewId, onCloseDrawer, confirmLeave = () => true, saveState = 'idle',
}) {
  const dispatch = useDispatch();
  const index = taskIds.indexOf(taskId);
  const hasPrev = index > 0;
  const hasNext = index !== -1 && index < taskIds.length - 1;

  const moveTo = (nextIndex) => {
    if (!confirmLeave()) {return;}
    dispatch(updateDrawer({
      viewId,
      taskId: taskIds[nextIndex],
      tree: [nextIndex],
    }));
  };

  const navBtn = 'flex h-11 w-11 cursor-pointer items-center justify-center rounded-md hover:bg-text/8 disabled:cursor-default disabled:opacity-30';

  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-2 pt-[env(safe-area-inset-top)] sm:px-6">
      <div className="flex items-center">
        <button
          type="button"
          aria-label="Previous task"
          disabled={!hasPrev}
          onClick={() => moveTo(index - 1)}
          className={navBtn}
        >
          <ArrowRight3 className="rotate-180 dark:stroke-text" />
        </button>
        <button
          type="button"
          aria-label="Next task"
          disabled={!hasNext}
          onClick={() => moveTo(index + 1)}
          className={navBtn}
        >
          <ArrowRight3 className="dark:stroke-text" />
        </button>
        <span role="status" aria-live="polite" className="ml-2 text-xs text-text-muted tabular-nums">
          {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? 'Saved' : ''}
        </span>
      </div>
      <button
        type="button"
        aria-label="Close task details"
        onClick={onCloseDrawer}
        className="flex h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-md px-3 text-sm font-medium text-text-muted hover:bg-text/8"
      >
        <Cancel className="h-5 w-5 dark:stroke-text" />
        <span className="hidden sm:inline">Close</span>
      </button>
    </div>
  );
}

function Options({ task }) {
  const [timeShow, setTimeShow] = useState(false);
  const timeRef = useRef(null);

  useEffect(() => {
    if (!timeShow) {return undefined;}
    const onMouseDown = (e) => {
      if (timeRef.current && !timeRef.current.contains(e.target)) {setTimeShow(false);}
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [timeShow]);

  return (
    <div ref={timeRef} className="relative flex items-center">
      <button
        type="button"
        aria-label="Track time"
        aria-expanded={timeShow}
        onClick={() => setTimeShow((s) => !s)}
        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md hover:bg-text/8"
      >
        <Time className="dark:stroke-text" />
      </button>
      {timeShow ? (
        <span className="absolute top-11 right-0 z-20 rounded-md border border-border bg-surface-raised p-2 text-sm text-text tabular-nums shadow-lg">
          <Timer
            insideTable
            task={{
              id: task.id,
              pause: task.pause,
              elapsedtime: task.elapsedtime,
              startTime: task.startTime,
              taskId: task.taskId,
              tree: task.tree,
              viewId: task.viewId,
            }}
          />
        </span>
      ) : null}
    </div>
  );
}

function Tab({
  name, activeTab, onClick = () => { }, onKeyDown,
}) {
  const active = activeTab === name;
  return (
    <button
      type="button"
      role="tab"
      id={`drawer-tab-${name}`}
      aria-selected={active}
      aria-controls={`drawer-panel-${name}`}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`${active ? 'bg-brand-solid/12 text-brand' : 'text-text-muted hover:bg-brand-solid/10 hover:text-brand'} flex min-h-11 cursor-pointer items-center rounded-md px-3`}
    >
      {name}
    </button>
  );
}

function DrawerBlog({
  Icon, label, className = '', children,
}) {
  return (
    <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex w-full shrink-0 items-center gap-2 sm:w-40">
        <Icon aria-hidden="true" className={`h-5 w-5 shrink-0 ${className}`} />
        <p title={typeof label === 'string' ? label : undefined} className="min-w-0 break-words text-sm font-medium text-text-muted capitalize">{label}</p>
      </div>
      <div className="min-w-0 flex-1 text-sm text-text">
        {children}
      </div>
    </div>
  );
}

export {
  TopHeader,
  Tab,
  Options,
  DrawerBlog,
};
