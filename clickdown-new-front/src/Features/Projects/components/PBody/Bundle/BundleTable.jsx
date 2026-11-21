import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import TableRow from './TableRow/TableRow';
import CreateSubtask from './CreateSubtask/CreateSubtask';
import BundleTableHead from './BundleTableHead';

export default function BundleTable({
  viewId, collapsed = false, onAddTask = () => { },
}) {
  const tasks = useSelector((state) => state.projectStore.view.find((v) => v.id === viewId)?.tasks) ?? [];
  const bundleType = useSelector((state) => state.projectStore.view.find((v) => v.id === viewId)?.bundleInfo?.type);
  const createTaskOpen = useSelector((state) => state.projectStore.createTaskOpen);
  const createRowRef = useRef();
  const isCreatingHere = createTaskOpen.id === viewId && createTaskOpen.field === bundleType;

  // Bring the new-task row into view when it opens
  useEffect(() => {
    if (isCreatingHere) {
      createRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }, [isCreatingHere]);

  return (
    <section className={collapsed ? 'hidden' : 'pb-4'} id={viewId}>
      <BundleTableHead tasks={tasks} viewId={viewId} />
      {
        tasks.map((t, i) => (
          <TableRow
            key={t?.id ?? i}
            task={t}
            viewId={viewId}
            tree={[i]}
          />
        ))
      }
      {tasks.length === 0 && !isCreatingHere && (
        <div className="flex w-(--pbody-w) flex-col items-center gap-3 py-10 text-center @3xl:sticky @3xl:left-0">
          <p className="text-sm text-text-muted">No tasks yet</p>
          <button
            type="button"
            onClick={() => onAddTask(bundleType)}
            className="min-h-11 cursor-pointer rounded-md bg-brand-solid px-4 text-sm font-medium text-on-brand hover:bg-brand-solid-hover"
          >
            Add the first task
          </button>
        </div>
      )}
      {isCreatingHere ? (
        <div className="border-b-2 border-secondary bg-surface" ref={createRowRef}>
          <CreateSubtask
            tree={[tasks.length]}
            viewId={viewId}
          />
        </div>
      ) : (tasks.length > 0 && (
        <div className="border-b border-border @3xl:sticky @3xl:left-0 @3xl:w-(--pbody-w)">
          <button
            type="button"
            onClick={() => onAddTask(bundleType)}
            className="flex min-h-11 w-full cursor-pointer items-center gap-2 px-3 text-left text-sm text-text-muted hover:bg-text/8 hover:text-brand @3xl:pl-12"
          >
            <span aria-hidden="true" className="text-base leading-none">+</span>
            Add task
          </button>
        </div>
      ))}
    </section>
  );
}
