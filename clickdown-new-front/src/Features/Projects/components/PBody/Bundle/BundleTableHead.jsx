import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import checkEqual from '../../../../../Utils/checkEqual';
import { setTaskSelection } from '../../../projectReducers';
import AddTree from '../../../../../Utils/AddTree';
import AlertToster from '../../../../../Components/AlertToster';
import { cell, taskTypeFor } from './bundleHelpers';

const tableHead = [
  { name: 'Assignee', classNames: cell.assignee },
  { name: 'Due', classNames: cell.due },
  { name: 'Estimate', classNames: cell.estimate },
  { name: 'Elapsed', classNames: cell.elapsed },
  { name: 'Priority', classNames: cell.priority },
];

function getAllChildren(item) {
  let children = [item];
  if (item.child && item.child.length > 0) {
     
    for (const childItem of item.child) {
      children = children.concat(getAllChildren(childItem));
    }
  }
  return children;
}

export default function BundleTableHead({ tasks = [], viewId }) {
  const { projectId } = useParams();
  const selectedTask = useSelector((state) => state.projectStore.taskSelected);
  const dispatch = useDispatch();

  const customFieldCols = useSelector((state) => {
    const project = state.projectStore.projects.find((p) => p.id === projectId);
    return (project?.customFields ?? []).filter((c) => c.show && c.cf?.name)
      .map((c) => ({ id: c.cf.id, name: c.cf.name, type: c.cf.type }));
  }, checkEqual);

  const bundleInfo = useSelector(
    (state) => state.projectStore.view.find((v) => v.id === viewId)?.bundleInfo,
    checkEqual,
  ) || {};

  const allSelected = tasks.length > 0 && tasks.every((bObj) => selectedTask.some(
    (aObj) => aObj.task === bObj.id && viewId === aObj.viewId,
  ));

  // Select every task in the view, or clear them when all are already selected
  const fnTaskSelected = () => {
    if (tasks.length === 0) {
      AlertToster('Task not found!!!', 'error');
      return;
    }
    const cType = taskTypeFor(bundleInfo);
    if (!allSelected) {
      const dataWithTreeField = tasks.map((item, index) => AddTree(item, [index]));
      const allTasks = dataWithTreeField.map((m) => ({
        task: m.id,
        tree: m.tree,
        viewId,
        prev_project: bundleInfo.projectId,
        child: (m.child ?? []).map((c) => c.id),
        sub_childs: (m.child ?? []).length > 0 ? m.child.flatMap(getAllChildren).map((t) => (
          {
            viewId,
            tree: t.tree,
            child: (t.child ?? []).map((c) => c.id),
            prev_project: bundleInfo.projectId,
            prev_type: cType,
            prev_sprints: bundleInfo.sprintId,
            task: t.id,
            rootId: m.id,
            temp: true,
          }
        )) : [],
        prev_type: cType,
        prev_sprints: bundleInfo.sprintId,
      }));
      let childList = [];
      allTasks.forEach((d) => { childList = [d, ...childList, ...d.sub_childs]; });
      const lists = childList.filter((t) => !selectedTask.some(
        (select) => t.task === select.task,
      ));
      dispatch(setTaskSelection([...selectedTask, ...lists]));
    } else {
      const rootIds = tasks.flatMap((t) => [t.id, ...(t.child ?? []).flatMap(getAllChildren).map((f) => f.id)]);
      dispatch(setTaskSelection(selectedTask.filter((s) => !rootIds.includes(s.task))));
    }
  };

  const headCell = 'px-2 text-xs font-semibold tracking-wide text-text-muted uppercase truncate';
  return (
    <div className="sticky top-0 z-3 hidden h-10 items-center border-b border-border bg-surface-alt @3xl:flex">
      <div className={`${cell.lead} sticky left-0 z-1 flex h-full items-center bg-inherit pl-2`}>
        <div className="flex h-9 w-8 shrink-0 items-center justify-center">
          <input
            type="checkbox"
            aria-label="Select all tasks"
            checked={allSelected}
            onChange={fnTaskSelected}
            className="h-4 w-4 cursor-pointer accent-secondary"
          />
        </div>
        <span className={`${headCell} pl-24`}>Summary</span>
      </div>
      {
        tableHead.map((t) => (
          <div key={t.name} className={`${t.classNames} ${headCell}`}>
            {t.name}
          </div>
        ))
      }
      {
        customFieldCols.map((c) => (
          <div key={c.id} title={c.name} className={`${cell.custom} ${c.type === 'dropdown' ? '@3xl:-order-1' : ''} ${headCell}`}>
            {c.name}
          </div>
        ))
      }
    </div>
  );
}
