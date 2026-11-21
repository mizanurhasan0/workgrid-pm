import React from 'react';
import { useSelector } from 'react-redux';
import Image from '../../../../../Components/Image';
import { useProjectsCtx } from '../../../context/ProjectsProvider';

// Bulk assignee picker for the selected tasks
export default function Members() {
  const pUsers = useSelector((state) => state.projectStore.pUsers) ?? [];
  const taskSelected = useSelector((state) => state.projectStore.taskSelected);
  const { gpUpdateTask } = useProjectsCtx();

  if (taskSelected.length === 0) {return null;}

  const onAdd = (user) => {
    gpUpdateTask({
      taskList: taskSelected.map((t) => ({ ...t, assignee: user.id })),
    });
  };

  return (
    <div className="absolute left-0 top-full z-10 mt-1 flex max-h-80 min-w-48 flex-col rounded-md border border-border bg-surface-raised px-2 pb-1 text-text shadow-2xl max-sm:fixed max-sm:inset-x-2 max-sm:top-24 max-sm:min-w-0">
      <h2 className="px-1 py-2 text-xs font-medium text-text-muted">Select user</h2>
      <div className="overflow-y-auto">
        {pUsers.length === 0 && (
          <p className="px-1 py-2 text-xs text-text-muted">No users found</p>
        )}
        {pUsers.map((user) => (
          <button
            type="button"
            key={user.id}
            onClick={() => onAdd(user)}
            className="flex h-11 w-full items-center rounded px-1 text-left hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:h-10"
          >
            <div className="flex min-w-0 items-center">
              <div className="h-7 w-7 shrink-0 rounded-full">
                <Image className="h-full w-full rounded-full" src={user.avatar} alt="" />
              </div>
              <span className="ml-2 truncate text-sm font-medium">{user.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
