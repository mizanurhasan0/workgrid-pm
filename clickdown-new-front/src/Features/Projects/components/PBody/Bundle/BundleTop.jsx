import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import checkEqual from '../../../../../Utils/checkEqual';
import {
  ArrowDown, Delete, Plus, PlusCircle,
} from '../../../../../assets';
import CFList from './CustomField/CFList';
import CFCreateModal from './CustomField/CFCreateModal';
import CFDueDate from './CustomField/Fields/Date/CFDueDate';
import { useProjectsCtx } from '../../../context/ProjectsProvider';
import ActionModal from '../../../../../Components/Modal/ActionModal';

export default function BundleTop({
  viewId, handleCreateTask, collapsed = false, onToggleCollapsed = () => { },
}) {
  const { projectId } = useParams();
  const columnsBtnRef = useRef();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const { deleteSprint } = useProjectsCtx();
  const [showModal, setShowModal] = useState(false);

  const { name, taskCount, currentView } = useSelector((state) => {
    const found = state.projectStore.view.find((v) => v.id === viewId) || {};
    return {
      name: found.name,
      taskCount: found?.tasks?.length,
      currentView: found,
    };
  }, checkEqual);
  const trgSprint = useSelector((state) => state.projectStore.projects
    .find((p) => p.id === projectId)?.sprints
    ?.find((s) => s.id === currentView?.bundleInfo?.sprintId));

  const bundleType = currentView?.bundleInfo?.type;
  const isSprint = bundleType === 'sprint';
  const openCreate = () => {
    setMenuOpen(false);
    setCreateOpen(true);
  };

  return (
    <section className="w-(--pbody-w) @3xl:sticky @3xl:left-0">
      <div className="flex items-center justify-between gap-2 border-b border-border py-1">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            aria-label={collapsed ? `Expand ${name}` : `Collapse ${name}`}
            aria-expanded={!collapsed}
            onClick={onToggleCollapsed}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md hover:bg-text/8"
          >
            <ArrowDown className={`transition-transform duration-200 dark:stroke-text ${collapsed ? '-rotate-90' : ''}`} />
          </button>
          <h2 className="min-w-0 truncate text-base font-semibold text-text" title={name}>{name}</h2>
          <span className="shrink-0 rounded-full bg-text/10 px-2 py-0.5 text-xs font-medium text-text-muted tabular-nums" aria-label={`${taskCount ?? 0} tasks`}>
            {taskCount ?? 0}
          </span>
          {isSprint ? (
            <CFDueDate
              taskInfo={{
                viewId,
                endDate: trgSprint?.endDate,
                startDate: trgSprint?.startDate,
              }}
              sprint
            />
          ) : ''}
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => handleCreateTask(bundleType)}
            className="flex h-11 cursor-pointer items-center gap-1 rounded-md px-2 text-sm font-medium text-brand hover:bg-text/8"
          >
            <Plus className="h-4 w-4 stroke-current" />
            <span className="hidden sm:inline">Add task</span>
            <span className="sr-only sm:hidden">Add task</span>
          </button>
          {isSprint ? (
            <button type="button" aria-label="Delete sprint" onClick={() => setShowModal(true)} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md hover:bg-text/8">
              <Delete className="hover:fill-red-500 dark:stroke-text" />
            </button>
          ) : ''}
          <div className="relative">
            <button type="button" ref={columnsBtnRef} aria-label="Manage columns" title="Manage columns" aria-haspopup="dialog" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md hover:bg-text/8">
              <PlusCircle className="dark:stroke-text" />
            </button>
            <CFList
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              anchorRef={columnsBtnRef}
              onCreate={openCreate}
              onEdit={openCreate}
            />
            <CFCreateModal open={createOpen} onClose={() => setCreateOpen(false)} />
          </div>
        </div>
      </div>
      <ActionModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onClick={() => {
          deleteSprint(currentView?.bundleInfo?.projectId, currentView?.bundleInfo?.sprintId);
          setShowModal(false);
        }}
      />
    </section>
  );
}
