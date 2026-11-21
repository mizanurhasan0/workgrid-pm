import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch } from 'react-redux';
import { ChevronRight, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { resetCustomField, setCustomField } from '../../../projectReducers';
import { useProjectsCtx } from '../../../context/ProjectsProvider';
import { useAuth } from '../../../../../Context/AuthProvider';
import ActionModal from '../../../../../Components/Modal/ActionModal';
import CreateCF from './CreateCF';

const itemClass = 'flex h-11 w-full items-center gap-2 rounded px-2 text-left hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:h-9';

// Project menu in the sidebar: open in new tab, create a column type, delete project
export default function Actions({ project, onDone = () => { } }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { customFields, deleteProject } = useProjectsCtx();
  const [showModal, setShowModal] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const ownerId = project.owner?.id ?? project.owner;
  const canDelete = ownerId === user?.id || user?.role?.name === 'owner';

  function handleCreate(f) {
    dispatch(resetCustomField());
    if (f === 'dropdown') {dispatch(setCustomField({ type: f, dropdown: [{ name: 'option0', color: '#6239ed' }] }));}
    else {dispatch(setCustomField({ type: f }));}
    setCreateOpen(true);
  }

  const closeCreate = () => {
    setCreateOpen(false);
    dispatch(resetCustomField());
  };

  return (
    <>
      <button
        type="button"
        role="menuitem"
        className={itemClass}
        onClick={() => {
          window.open(`${import.meta.env.VITE_BASE_URL || window.location.origin}/${project.id}`, '_blank', 'noopener,noreferrer');
          onDone();
        }}
      >
        <ExternalLink size={16} aria-hidden="true" />
        <span>Open in new tab</span>
      </button>
      <button
        type="button"
        role="menuitem"
        aria-haspopup="menu"
        aria-expanded={fieldsOpen}
        className={itemClass}
        onClick={() => setFieldsOpen((o) => !o)}
      >
        <Plus size={16} aria-hidden="true" />
        <span className="flex-1">Add column</span>
        <ChevronRight size={16} aria-hidden="true" className={`transition-transform ${fieldsOpen ? 'rotate-90' : ''}`} />
      </button>
      {fieldsOpen && (
        <div role="menu" aria-label="Column types" className="ml-6 border-l border-border pl-1">
          {customFields.map((f) => (
            <button
              type="button"
              role="menuitem"
              key={f}
              onClick={() => handleCreate(f)}
              className={`${itemClass} capitalize`}
            >
              {f}
            </button>
          ))}
        </div>
      )}
      {canDelete && (
        <button
          type="button"
          role="menuitem"
          className={`${itemClass} text-danger`}
          onClick={() => setShowModal(true)}
        >
          <Trash2 size={16} aria-hidden="true" />
          <span>Delete project</span>
        </button>
      )}
      {createOpen ? (
        <CreateCF
          projectId={project.id}
          onClose={closeCreate}
          onCreated={() => {
            closeCreate();
            onDone();
          }}
        />
      ) : ''}
      {/* delete confirmation, rendered outside the menu so closing the menu cannot hide it */}
      {showModal && createPortal(
        <ActionModal
          show
          onClose={() => setShowModal(false)}
          onClick={() => {
            setShowModal(false);
            onDone();
            deleteProject(project);
          }}
        />,
        document.body,
      )}
    </>
  );
}
