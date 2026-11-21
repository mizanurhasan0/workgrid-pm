import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import ManageAssignee from '../../../../Components/ManageAssignee';
import {
  Dot3,
  Edit,
  Favourite,
} from '../../../../assets';
import { useProjectsCtx } from '../../context/ProjectsProvider';
import Image from '../../../../Components/Image';
import Popover from './Bundle/TableComponents/Popover';
import PDeleteModal from '../PDeleteModal/PDeleteModal';
import { useAuth } from '../../../../Context/AuthProvider';
import { setUpdateProject } from '../../projectReducers';

const iconBtn = 'inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-secondary/10';

export default function PBodyHead() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { projectId } = useParams();
  const {
    handleMemberAddRemove, updateProject, updateShortProject,
  } = useProjectsCtx();
  const project = useSelector(
    (state) => state.projectStore.projects.find((p) => p.id === projectId) || {},
  );
  const nameRef = useRef();
  // Ref mirrors the state so Enter followed by blur cannot save twice
  const editingRef = useRef(false);
  const menuRef = useRef(null);
  const [editingName, setEditingName] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isFavourite = (project.favorit ?? []).includes(user?.id);
  const ownerId = project.owner?.id ?? project.owner;
  const canDelete = ownerId === user?.id || user?.role?.name === 'owner';
  const canEditName = user?.id === project.owner || ['owner', 'admin'].includes(user?.role?.name);

  const startEditName = () => {
    editingRef.current = true;
    setEditingName(true);
  };
  const stopEditName = () => {
    editingRef.current = false;
    setEditingName(false);
  };

  // Focus the name with the caret at the end when editing starts
  useEffect(() => {
    if (!editingName || !nameRef.current) {return;}
    nameRef.current.focus();
    const range = document.createRange();
    range.selectNodeContents(nameRef.current);
    range.collapse(false);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }, [editingName]);

  const favBusy = useRef(false);
  const onFavourite = () => {
    if (!project.id || !user?.id || favBusy.current) {return;}
    const previous = project.favorit ?? [];
    const next = isFavourite
      ? previous.filter((u) => u !== user.id)
      : [user.id, ...previous];
    favBusy.current = true;
    dispatch(setUpdateProject({ ...project, favorit: next }));
    Promise.resolve(updateProject({ id: projectId, payload: { favorit: next } }))
      .catch(() => {
        // Roll back only the favourite list so concurrent socket updates are kept
        dispatch(setUpdateProject({ ...project, favorit: previous }));
        toast.error('Could not update favourites');
      })
      .finally(() => { favBusy.current = false; });
  };

  const saveName = () => {
    if (!editingRef.current) {return;}
    stopEditName();
    const name = (nameRef.current?.textContent ?? '').trim();
    if (!name) {
      toast.warning('Project name cannot be empty');
      if (nameRef.current) {nameRef.current.textContent = project.name ?? '';}
      return;
    }
    if (name === project.name) {return;}
    updateShortProject({ id: projectId, payload: { name } });
  };

  const onNameKeyDown = (e) => {
    if (!editingRef.current) {return;}
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
    } else if (e.key === 'Escape') {
      if (nameRef.current) {nameRef.current.textContent = project.name ?? '';}
      stopEditName();
    }
  };

  return (
    <div className="pr-2">
      <div>
        <div className="flex flex-wrap justify-between items-center gap-2 py-6">
          <div className="flex min-w-0 items-center gap-2">
            <Image src={project?.icon} className="rounded-lg w-8 h-8" />
            <h1
              ref={nameRef}
              contentEditable={editingName}
              suppressContentEditableWarning
              onKeyDown={onNameKeyDown}
              onBlur={saveName}
              className={`text-lg leading-5 font-semibold text-text break-words min-w-0 ${editingName ? 'outline-hidden rounded border border-brand px-1' : ''}`}
            >
              {project?.name || ''}
            </h1>
            {canEditName ? (
              <button type="button" aria-label="Edit project name" title="Edit project name" onClick={startEditName} className={`${iconBtn} shrink-0`}>
                <Edit aria-hidden="true" className="h-4 w-4" />
              </button>
            ) : ''}
          </div>
          <div className="flex items-center gap-2 [&_button]:whitespace-nowrap">
            <ManageAssignee
              assignees={project.members || []}
              onAdd={(member) => handleMemberAddRemove({
                projectId: project.id, member, method: 'add', creator: project.owner,
              })}
              onRemove={(member) => handleMemberAddRemove({
                projectId: project.id, member, method: 'remove', auth: true, creator: project.owner,
              })}
              allUser
            />
            <button
              type="button"
              aria-label="Favourite"
              title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              aria-pressed={isFavourite}
              onClick={onFavourite}
              className={iconBtn}
            >
              <Favourite aria-hidden="true" className={`stroke-darkIconBorder ${isFavourite ? 'fill-red-500 stroke-red-500' : ''}`} />
            </button>
            {canDelete && (
              <>
                <button
                  ref={menuRef}
                  type="button"
                  aria-label="Project options"
                  aria-haspopup="dialog"
                  aria-expanded={menuOpen}
                  title="Project options"
                  onClick={() => setMenuOpen((o) => !o)}
                  className={iconBtn}
                >
                  <Dot3 aria-hidden="true" className="stroke-darkIconBorder" />
                </button>
                <Popover open={menuOpen} onClose={() => setMenuOpen(false)} anchorRef={menuRef} align="end" label="Project options">
                  <PDeleteModal project={project} onClick={() => setMenuOpen(false)} />
                </Popover>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
