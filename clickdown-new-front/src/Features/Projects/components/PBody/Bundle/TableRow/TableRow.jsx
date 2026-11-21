 
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ArrowRight } from '../../../../../../assets';
import CreateSubtask from '../CreateSubtask/CreateSubtask';
import CustomField from '../CustomField/CustomField';
import Assignee from '../TableComponents/Assignee';
import DueDate from '../TableComponents/DueDate';
import Estimate from '../TableComponents/Estimate/Estimate';
import IssueType from '../TableComponents/IssueType';
import Priority from '../TableComponents/Priority';
import TaskRowLeft from '../TableComponents/TaskRowLeft';
import TaskSummary from '../TableComponents/TaskSummary/TaskSummary';
import Timer from '../../../../../Timer/Timer';
import { onCreateTaskOpen, setTaskSelection } from '../../../../projectReducers';
import checkEqual from '../../../../../../Utils/checkEqual';
import AddTree from '../../../../../../Utils/AddTree';
import { cell, taskTypeFor } from '../bundleHelpers';

function getAllChildren(item) {
  let children = [item];
  if (item.child && item.child.length > 0) {
     
    for (const childItem of item.child) {
      children = children.concat(getAllChildren(childItem));
    }
  }
  return children;
}

export default function TableRow({
  viewId,
  padding = 0,
  tree = [0],
  parentId = '',
  task,
}) {
  const {
    id,
    assignee = [],
    name = '',
    endDate = '',
    estimate = '',
    elapsedtime = 0,
    startTime = 0,
    priority = '',
    type = '',
    pause = false,
    customFields = [],
  } = task;
  const children = task.child ?? [];
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const bundleInfo = useSelector(
    (state) => state.projectStore.view.find((v) => v.id === viewId)?.bundleInfo,
    checkEqual,
  );
  const { taskSelected, createTaskOpen } = useSelector((state) => state.projectStore);
  const isCreatingHere = createTaskOpen.id === id && createTaskOpen.field === bundleInfo?.type;

  const handleCreateSubtask = () => {
    dispatch(onCreateTaskOpen({
      placeholder: name, id, field: bundleInfo?.type ?? '',
    }));
    setExpanded(true);
  };

  // Selecting a task also selects its subtasks so bulk actions apply to the whole branch
  const fnTaskSelected = () => {
    const prevType = taskTypeFor(bundleInfo);
    const allChildren = children.length === 0 ? [] : children
      .map((item, index) => AddTree(item, [...tree, index]))
      .flatMap(getAllChildren)
      .map((t) => ({
        viewId,
        tree: t.tree,
        child: (t.child ?? []).map((c) => c.id),
        prev_project: bundleInfo?.projectId,
        prev_type: prevType,
        prev_sprints: bundleInfo?.sprintId,
        task: t.id,
        rootId: id,
        temp: true,
      }));

    const selectedEntry = taskSelected.find((t) => t.task === id);
    if (selectedEntry?.temp) {
      toast.warning('Uncheck parent task');
    } else if (!selectedEntry) {
      const withoutChildren = taskSelected.filter(
        (t) => !allChildren.some((c) => c.task === t.task),
      );
      dispatch(setTaskSelection([...withoutChildren, ...allChildren, {
        viewId,
        tree,
        child: children.map((t) => t.id),
        prev_project: bundleInfo?.projectId,
        prev_type: prevType,
        prev_sprints: bundleInfo?.sprintId,
        sub_childs: allChildren,
        parentId,
        task: id,
      }]));
    } else {
      const removeIds = new Set([id, ...allChildren.map((c) => c.task)]);
      dispatch(setTaskSelection(taskSelected.filter((t) => !removeIds.has(t.task))));
    }
  };

  const isSelected = taskSelected.some((t) => t.task === id);

  return (
    <>
      <div
        data-selected={isSelected}
        className={`group relative flex flex-wrap items-center gap-x-1 border-b border-border px-2 py-1 @3xl:min-h-12 @3xl:flex-nowrap @3xl:gap-x-0 @3xl:px-0 @3xl:py-0 ${isSelected ? 'bg-[color-mix(in_srgb,var(--brand-solid)_12%,var(--surface))]' : 'bg-surface hover:bg-surface-alt'}`}
      >
        {/* select, expand, type and summary: sticks to the left edge while the table scrolls sideways */}
        <div className={`${cell.lead} order-1 flex w-full items-center bg-inherit pr-11 @3xl:pr-0 @3xl:sticky @3xl:left-0 @3xl:z-1 @3xl:w-auto @3xl:pl-2`}>
          <div
            onClick={fnTaskSelected}
            onKeyDown={() => { }}
            className={`${isSelected ? 'opacity-100' : '@3xl:opacity-0'} flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center transition-opacity focus-within:opacity-100 @3xl:h-9 @3xl:w-8 @3xl:group-hover:opacity-100`}
          >
            <TaskRowLeft id={id} viewId={viewId} />
          </div>
          <div className="flex min-w-0 flex-1 items-center" style={{ paddingLeft: `${padding}px` }}>
            {children.length > 0 ? (
              <button
                type="button"
                aria-label={expanded ? 'Hide subtasks' : 'Show subtasks'}
                aria-expanded={expanded}
                className="flex h-11 w-9 shrink-0 cursor-pointer items-center justify-center @3xl:h-9 @3xl:w-7"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
              >
                <ArrowRight className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
              </button>
            ) : <span className="hidden w-7 shrink-0 @3xl:block" aria-hidden="true" />}
            <div className="shrink-0 pr-1">
              <IssueType
                viewId={viewId}
                tree={tree}
                taskId={id}
                type={type}
              />
            </div>
            <TaskSummary
              viewId={viewId}
              tree={tree}
              handleCreateSubtask={handleCreateSubtask}
              summary={name}
              childLength={children.length}
              taskId={id}
              bundleInfo={bundleInfo}
            />
          </div>
        </div>
        <div className={`${cell.assignee} order-3 flex items-center @3xl:order-none @3xl:px-2`}>
          <Assignee
            assignee={assignee}
            taskId={id}
            tree={tree}
            viewId={viewId}
          />
        </div>
        <div className={`${cell.due} order-4 flex items-center @3xl:order-none @3xl:px-2`}>
          <DueDate
            taskId={id}
            viewId={viewId}
            tree={tree}
            endDate={endDate}
            bundleInfo={bundleInfo}
          />
        </div>
        <div className={`${cell.estimate} hidden items-center @3xl:flex @3xl:px-2`}>
          <Estimate
            tree={tree}
            viewId={viewId}
            taskId={id}
            estimatedTime={estimate}
            bundleInfo={bundleInfo}
          />
        </div>
        <div className={`${cell.elapsed} hidden min-h-11 items-center text-sm text-text tabular-nums @3xl:flex @3xl:px-2`}>
          <Timer
            insideTable
            task={{
              id,
              pause,
              elapsedtime,
              startTime,
              viewId,
              tree,
            }}
          />
        </div>
        <div className={`${cell.priority} order-5 flex items-center @3xl:order-none @3xl:px-2`}>
          <Priority
            tree={tree}
            viewId={viewId}
            taskId={id}
            priority={priority}
            bundleInfo={bundleInfo}
          />
        </div>
        <CustomField
          tree={tree}
          viewId={viewId}
          taskId={id}
          customFields={customFields}
          bundleInfo={bundleInfo}
        />
        <button
          type="button"
          onClick={handleCreateSubtask}
          aria-label="Add subtask"
          title="Add subtask"
          className="absolute top-1 right-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-md text-lg font-medium text-text-muted hover:text-brand @3xl:hidden"
        >
          +
        </button>
      </div>
      <div className={expanded ? '' : 'hidden'}>
        {
          children.map((t, i) => (
            <TableRow
              key={t.id}
              parentId={id}
              tree={[...tree, i]}
              task={t}
              padding={padding + 20}
              viewId={viewId}
            />
          ))
        }
        {isCreatingHere ? (
          <div className="border-b border-secondary">
            <CreateSubtask
              handleCreateSubtask={handleCreateSubtask}
              tree={[...tree, children.length]}
              viewId={viewId}
              parent={id}
              indent={padding + 20}
            />
          </div>
        ) : ''}
      </div>
    </>
  );
}
