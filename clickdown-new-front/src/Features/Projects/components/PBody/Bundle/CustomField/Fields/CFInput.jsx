import React, { useRef, useState } from 'react';
import { useProjectsCtx } from '../../../../../context/ProjectsProvider';
import Loading3 from '../../../../../../../Components/Loading3';
import { emptyCellClass, taskTypeFor } from '../../bundleHelpers';

// Number and text custom fields: shows the saved value, and an input to edit it
export default function CFInput({ cf, taskInfo }) {
  const { updateTask } = useProjectsCtx();
  const [load, setLoad] = useState(false);
  const [editing, setEditing] = useState(false);
  // Escape cancels; the blur that follows must not save
  const cancelled = useRef(false);
  const {
    taskId, tree, viewId, bundleInfo,
  } = taskInfo;
  const hasValue = cf?.result !== undefined && cf?.result !== null && cf?.result !== '';
  const isNumber = cf?.type === 'number';
  // Numbers line up on the right inside the table, but read left-aligned next to their label in the drawer
  const rightAlign = isNumber && !taskInfo.inDrawer;
  const width = taskInfo.inDrawer ? 'w-40' : 'w-28';

  const stopEditing = () => setEditing(false);

  const onSubmit = (e) => {
    e.preventDefault();
    const value = e.currentTarget.elements.namedItem('name')?.value?.trim() ?? '';
    if (!value || String(cf.result ?? '') === value) {
      stopEditing();
      return;
    }
    updateTask({
      load: setLoad,
      taskId,
      storePayload: {
        tree,
        viewId,
        taskType: taskTypeFor(bundleInfo),
        sprintId: bundleInfo?.sprintId,
        dataType: cf.type,
      },
      payload: {
        customFields: { cf: cf.id, value, name: cf.name },
      },
    });
    setEditing(false);
  };

  if (load) {return <div className="flex min-h-11 w-28 items-center justify-center"><Loading3 /></div>;}
  // Without a value the cell stays a quiet button; the input opens on demand so the table stays calm
  if (!editing) {
    return (
      <button
        type="button"
        aria-label={hasValue ? `Edit ${cf.name}` : `Set ${cf.name}`}
        onClick={() => { cancelled.current = false; setEditing(true); }}
        className={`min-h-11 ${width} cursor-pointer truncate rounded-md px-2 text-sm hover:bg-text/8 ${rightAlign ? 'text-right tabular-nums' : `text-left ${isNumber ? 'tabular-nums' : ''}`} ${hasValue ? 'text-text' : emptyCellClass}`}
        title={hasValue ? String(cf.result) : undefined}
      >
        {hasValue ? cf.result : '—'}
      </button>
    );
  }
  return (
    <form onSubmit={onSubmit} className={width}>
      <input
        type={cf.type}
        aria-label={cf.name}
        autoFocus
        defaultValue={cf.result ?? ''}
        className={`h-9 w-full rounded-md border border-secondary bg-surface px-2 text-sm text-text outline-hidden ${rightAlign ? 'text-right tabular-nums' : ''}`}
        placeholder={cf.type}
        name="name"
        onBlur={(e) => {
          if (cancelled.current) {return;}
          e.currentTarget.form?.requestSubmit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            cancelled.current = true;
            stopEditing();
          }
        }}
      />
    </form>
  );
}
