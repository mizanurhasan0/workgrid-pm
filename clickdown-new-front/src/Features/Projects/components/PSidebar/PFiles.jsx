import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EllipsisVertical, FileText, Pencil, Trash2 } from 'lucide-react';
import { useProjectsCtx } from '../../context/ProjectsProvider';
import ActionModal from '../../../../Components/Modal/ActionModal';

const FIXED_FILE_IDS = ['backlog', 'bugs'];

export default function PFiles({
  fileName, projectId, sprintId, onClick = (e) => { e.stopPropagation(); },
}) {
  const { onSprintDateUp, deleteSprint } = useProjectsCtx();
  const menuRef = useRef();
  const triggerRef = useRef();
  const editingRef = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const canManage = Boolean(sprintId) && !FIXED_FILE_IDS.includes(sprintId);

  // Close the options menu on outside click or Escape
  useEffect(() => {
    if (!menuOpen) {return undefined;}
    const onPointerDown = (e) => {
      if (!menuRef.current?.contains(e.target)) {setMenuOpen(false);}
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const startRename = () => {
    setMenuOpen(false);
    editingRef.current = true;
    setEditing(true);
  };

  const stopRename = () => {
    editingRef.current = false;
    setEditing(false);
  };

  const commitRename = (value) => {
    if (!editingRef.current) {return;}
    const title = value.trim();
    stopRename();
    if (!title || title === fileName) {return;}
    onSprintDateUp({ sprintId, projectId, title });
  };

  const onInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitRename(e.currentTarget.value);
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      stopRename();
    }
  };

  const itemClass = 'flex h-11 w-full items-center gap-2 rounded px-2 text-left hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:h-9';

  return (
    <div className="group relative mx-2 flex items-center rounded-md hover:bg-text/10">
      {editing ? (
        <div className="flex h-11 min-w-0 flex-1 items-center gap-2 px-2 md:h-10">
          <FileText size={16} aria-hidden="true" className="shrink-0 text-text-muted" />
          <input
            autoFocus
            aria-label="Sprint name"
            maxLength={60}
            defaultValue={fileName}
            onKeyDown={onInputKeyDown}
            onBlur={(e) => commitRename(e.currentTarget.value)}
            className="h-8 min-w-0 flex-1 rounded border border-secondary bg-surface-raised px-2 text-sm text-text focus-visible:outline-2 focus-visible:outline-secondary"
          />
        </div>
      ) : (
        <button
          type="button"
          title={fileName}
          onClick={onClick}
          className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left text-sm capitalize text-text focus-visible:outline-2 focus-visible:outline-secondary md:h-10"
        >
          <FileText size={16} aria-hidden="true" className="shrink-0 text-text-muted" />
          <span className="truncate">{fileName}</span>
        </button>
      )}
      {canManage && !editing ? (
        <div ref={menuRef} className="relative shrink-0">
          <button
            ref={triggerRef}
            type="button"
            aria-label={`Options for ${fileName}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:text-text focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-secondary aria-expanded:opacity-100 md:h-10 md:w-10 md:opacity-0 md:group-hover:opacity-100"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <EllipsisVertical size={16} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div
              role="menu"
              aria-label={`Actions for ${fileName}`}
              className="absolute right-0 top-full z-20 w-44 rounded-md border border-border bg-surface-raised p-1 text-sm text-text shadow-lg"
            >
              <button type="button" role="menuitem" className={itemClass} onClick={startRename}>
                <Pencil size={16} aria-hidden="true" />
                <span>Rename</span>
              </button>
              <button
                type="button"
                role="menuitem"
                className={`${itemClass} text-danger`}
                onClick={() => {
                  setMenuOpen(false);
                  setShowModal(true);
                }}
              >
                <Trash2 size={16} aria-hidden="true" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      ) : ''}
      {showModal && createPortal(
        <ActionModal
          show
          onClose={() => setShowModal(false)}
          onClick={() => {
            setShowModal(false);
            deleteSprint(projectId, sprintId);
          }}
        />,
        document.body,
      )}
    </div>
  );
}
