import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Trash2, X } from 'lucide-react';
import { useProjectsCtx } from '../../context/ProjectsProvider';
import ActionModal from '../../../../Components/Modal/ActionModal';

// Small options panel with the destructive "delete project" action behind a confirmation dialog
export default function PDeleteModal({ project, onClick }) {
  const { deleteProject } = useProjectsCtx();
  const [showModal, setShowModal] = useState(false);

  const onConfirm = () => {
    setShowModal(false);
    deleteProject(project);
  };

  return (
    <section aria-label="Project options" className="min-w-44 rounded-md border border-border bg-surface-raised p-1 shadow-md">
      <div className="flex items-center justify-between border-b border-border pb-1 pl-2">
        <p className="text-xs font-semibold text-text-muted">Options</p>
        <button
          type="button"
          aria-label="Close options"
          onClick={onClick}
          className="flex h-11 w-11 items-center justify-center rounded text-text-muted hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:h-8 md:w-8"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <button
        type="button"
        className="mt-1 flex h-11 w-full items-center justify-between rounded px-2 text-sm text-danger hover:bg-danger-soft focus-visible:outline-2 focus-visible:outline-secondary md:h-9"
        onClick={() => setShowModal(true)}
      >
        <span>Delete project</span>
        <Trash2 size={16} aria-hidden="true" />
      </button>
      {showModal && createPortal(
        <ActionModal show onClose={() => setShowModal(false)} onClick={onConfirm} />,
        document.body,
      )}
    </section>
  );
}
