import React from 'react';
import { useSelector } from 'react-redux';
import { Flag } from '../../../../../assets';
import { useProjectsCtx } from '../../../context/ProjectsProvider';
import { priorityOptions } from '../../PBody/Bundle/bundleHelpers';

// Bulk priority picker for the selected tasks
export default function TopPriority() {
  const { gpUpdateTask } = useProjectsCtx();
  const taskSelected = useSelector((state) => state.projectStore.taskSelected);

  function handleOptionClick(option) {
    gpUpdateTask({
      taskList: taskSelected.map((t) => ({ ...t, priority: option.name })),
    });
  }

  return (
    <div className="max-h-80 min-w-48 overflow-y-auto rounded-md border border-border bg-surface-raised px-3 pb-3 shadow-lg">
      <p className="whitespace-nowrap py-2 text-xs font-medium text-text-muted">Select Priority types</p>
      {priorityOptions.map((option) => (
        <button
          type="button"
          key={option.name}
          className="flex min-h-11 w-full items-center justify-start rounded text-sm text-text hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:min-h-9"
          onClick={() => handleOptionClick(option)}
        >
          <Flag className={`${option.class} mr-2 h-6 w-6`} />
          {option.label}
        </button>
      ))}
    </div>
  );
}
