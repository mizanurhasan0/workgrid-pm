import React, { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Cancel } from '../../../../../../assets';
import checkEqual from '../../../../../../Utils/checkEqual';
import { useProjectsCtx } from '../../../../context/ProjectsProvider';
import EditTitle from './EditTitle';
import CreatePriority from './components/CreatePriority';
import SubtaskDueDate from '../TableComponents/SubtaskDueDate';
import { onCreateTaskOpen } from '../../../../projectReducers';
import { cell, noonOf, taskTypeFor, toDay } from '../bundleHelpers';
import ManageAssigneeLite from './ManageAssigneeLite';

export default function CreateSubtask({
  tree = [],
  viewId = 0,
  parent = null,
  indent = 0,
}) {
  const dispatch = useDispatch();
  const titleRef = useRef();
  const [priority, setPriority] = useState(null);
  const [assignee, setAssignee] = useState([]);
  const [dueDate, setDueDate] = useState({
    from: null,
    to: null,
  });
  const { createSubtask, createTask } = useProjectsCtx();
  const { projectId } = useParams();
  const view = useSelector(
    (state) => state.projectStore.view.find((v) => v.id === viewId),
    checkEqual,
  );
  const bundleInfo = view?.bundleInfo || {};
  const project = useSelector(
    (state) => state.projectStore.projects.find((p) => p.id === projectId),
    checkEqual,
  );
  const statusField = project?.customFields?.find(
    (cf) => ['Status', 'status'].includes(cf?.cf?.name),
  );

  const closeForm = () => {
    dispatch(onCreateTaskOpen({ placeholder: 'New Task', id: '0', field: '' }));
  };

  const saveSubtaskToDb = () => {
    const name = titleRef.current?.value.trim();
    if (!name) {
      toast.warning('Enter a task name first');
      return;
    }
    const isSprint = bundleInfo.type === 'sprint';
    const taskType = isSprint ? 'sprints' : taskTypeFor(bundleInfo);
    const task = {
      project: projectId,
      name,
      assignee: assignee.map((a) => a.id),
      startDate: dueDate.from ? noonOf(toDay(dueDate.from)) : null,
      endDate: (dueDate.to || dueDate.from) ? noonOf(toDay(dueDate.to || dueDate.from)) : null,
      type: isSprint ? 'sprint' : taskType,
      sprint: bundleInfo.sprintId,
      priority: priority?.name,
      parentTask: parent,
      customFields: statusField,
      storePayload: { tree, viewId, taskType },
    };
    // Top level rows of a view are created as tasks, nested ones as subtasks
    if (view?.bundleInfo) {createTask({ task });}
    else {createSubtask({ task });}

    titleRef.current.value = '';
    setPriority(null);
    setAssignee([]);
    setDueDate({ from: null, to: null });
    titleRef.current.focus();
  };

  const onTitleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveSubtaskToDb();
    } else if (e.key === 'Escape') {
      closeForm();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-2 py-2 @3xl:flex-nowrap @3xl:gap-0 @3xl:px-0">
      <div className="flex w-full items-center @3xl:w-auto @3xl:min-w-96 @3xl:flex-1 @3xl:basis-96 @3xl:pr-2 @3xl:pl-2" style={{ paddingLeft: indent ? `${indent + 8}px` : undefined }}>
        <EditTitle titleRef={titleRef} onKeyDown={onTitleKeyDown} />
      </div>
      <div className={`${cell.assignee} flex items-center @3xl:px-2`}>
        <ManageAssigneeLite
          assignee={assignee}
          members={project?.members ?? []}
          onAdd={(data) => setAssignee((prev) => [...prev, data])}
          onRemove={(data) => setAssignee((prev) => prev.filter((p) => p.id !== data.id))}
        />
      </div>
      <div className={`${cell.due} flex items-center @3xl:px-2`}>
        <SubtaskDueDate dueDate={dueDate} setDueDate={setDueDate} />
      </div>
      <div className="hidden @3xl:block @3xl:w-24 @3xl:shrink-0" aria-hidden="true" />
      <div className="hidden @3xl:block @3xl:w-28 @3xl:shrink-0" aria-hidden="true" />
      <div className={`${cell.priority} flex items-center @3xl:px-2`}>
        <CreatePriority
          handlePriority={setPriority}
          priority={priority}
        />
      </div>
      <div className="ml-auto flex items-center gap-2 @3xl:px-3">
        <button type="button" onClick={saveSubtaskToDb} className="min-h-11 cursor-pointer rounded-md bg-brand-solid px-4 text-sm font-medium text-on-brand hover:bg-brand-solid-hover">
          Save
        </button>
        <button type="button" aria-label="Cancel new task" onClick={closeForm} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md hover:bg-text/8">
          <Cancel className="dark:stroke-text" />
        </button>
      </div>
    </div>
  );
}
