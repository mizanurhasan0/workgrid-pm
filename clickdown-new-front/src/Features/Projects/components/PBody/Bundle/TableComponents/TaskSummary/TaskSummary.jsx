import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Edit,
  Plus,
  Subtask,
} from '../../../../../../../assets';
import { useProjectsCtx } from '../../../../../context/ProjectsProvider';
import Loading3 from '../../../../../../../Components/Loading3';
import { taskTypeFor } from '../../bundleHelpers';

export default function TaskSummary({
  summary,
  childLength = 0,
  viewId,
  tree,
  taskId,
  handleCreateSubtask,
  bundleInfo,
}) {
  const inputRef = useRef();
  // Ref mirrors the state so Enter followed by blur cannot save twice
  const editingRef = useRef(false);
  const [load, setLoad] = useState(false);
  const [editing, setEditing] = useState(false);
  const { updateTask, onDrawerHandler } = useProjectsCtx();

  const startEditing = () => {
    editingRef.current = true;
    setEditing(true);
  };
  const stopEditing = () => {
    editingRef.current = false;
    setEditing(false);
  };

  // Focus the name and select it when editing starts
  useEffect(() => {
    if (editing) {inputRef.current?.select();}
  }, [editing]);

  const saveName = () => {
    if (!editingRef.current) {return;}
    const name = (inputRef.current?.value ?? '').trim();
    stopEditing();
    if (!name) {
      toast.warning('Task name cannot be empty');
      return;
    }
    if (name === (summary || '').trim()) {return;}
    updateTask({
      load: setLoad,
      taskId,
      storePayload: {
        tree,
        viewId,
        taskType: taskTypeFor(bundleInfo),
        sprintId: bundleInfo?.sprintId,
        dataType: 'input',
      },
      payload: {
        name,
      },
    });
  };

  const onNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      stopEditing();
    }
  };

  if (load) {return <div className="flex min-h-11 flex-1 items-center"><Loading3 /></div>;}
  const actionBtn = 'hidden h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md bg-text/10 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 @3xl:inline-flex';
  return (
    <div className="flex min-h-11 min-w-0 flex-1 items-center gap-2">
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          autoFocus
          aria-label="Task name"
          defaultValue={summary || ''}
          maxLength={255}
          onKeyDown={onNameKeyDown}
          onBlur={saveName}
          spellCheck={false}
          className="h-9 min-w-0 flex-1 rounded-md border border-secondary bg-transparent px-2 text-sm text-text outline-hidden"
        />
      ) : (
        <button
          type="button"
          aria-label={`Open task ${summary || ''}`}
          title={summary || ''}
          onClick={() => onDrawerHandler({ open: true, viewId, taskId, tree })}
          className="line-clamp-2 min-w-0 text-left cursor-pointer break-words text-sm leading-5 text-text hover:text-brand @3xl:line-clamp-none @3xl:block @3xl:truncate @3xl:whitespace-nowrap"
        >
          {summary || ''}
        </button>
      )}
      {childLength > 0 && (
        <span className="inline-flex h-6 shrink-0 items-center gap-1 rounded-md bg-text/10 px-1.5 text-xs font-medium text-text-muted tabular-nums" title={`${childLength} subtasks`}>
          <Subtask className="h-3.5 w-3.5" />
          {childLength}
        </span>
      )}
      <button type="button" aria-label="Add subtask" title="Add subtask" onClick={handleCreateSubtask} className={actionBtn}>
        <Plus className="h-3.5 w-3.5" />
      </button>
      <button type="button" aria-label="Edit task name" title="Rename" onClick={startEditing} className={actionBtn}>
        <Edit className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
