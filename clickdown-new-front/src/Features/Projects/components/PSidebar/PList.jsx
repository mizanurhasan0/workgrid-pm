import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, EllipsisVertical } from 'lucide-react';
import Image from '../../../../Components/Image';
import { useProjectsCtx } from '../../context/ProjectsProvider';
import { setFolderCrumb, setProjectCrumb } from '../../../../Reducers/breadCrumbReducer';
import PFolder from './PFolder';
import Actions from './Actions/Actions';
import { useSidebar } from './SidebarContext';

export default function PList({
  project: {
    id, name, icon, sprints,
    owner,
  }, index,
}) {
  const {
    prepareViewForProject,
    prepareViewForFolderClick,
    prepareViewForFileClick,
    createNewSprint,
  } = useProjectsCtx();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { closeMobile } = useSidebar();
  const menuRef = useRef();
  const triggerRef = useRef();
  const listRef = useRef();
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { projectId: paramsProjectId } = useParams();
  const active = paramsProjectId === id;

  const sprintFiles = (sprints ?? []).map((s, i) => ({
    name: s?.title || `Sprint ${i + 1}`,
    id: s.id,
  }));

  // Close the options menu on outside click or Escape (focus goes back to the trigger)
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
    listRef.current?.querySelector('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleProjectNameClick = (e) => {
    e.stopPropagation();
    navigate(`/${id}`);
    setExpanded((v) => !v || !active);
    dispatch(setProjectCrumb({ name, idx: index }));
    prepareViewForProject(id);
    closeMobile();
  };

  const handleFolderNameClick = (e, folderProject, folderKey, folderIndex) => {
    e.stopPropagation();
    if (folderProject !== paramsProjectId) {navigate(`/${folderProject}`);}
    dispatch(setFolderCrumb({
      project: { name, idx: index },
      folder: { name: folderKey, idx: folderIndex },
    }));
    prepareViewForFolderClick(id, folderKey);
    closeMobile();
  };

  const handleFileClick = (e, payload) => {
    e.stopPropagation();
    prepareViewForFileClick(id, payload);
    closeMobile();
  };

  const handlePlusClick = (e, pId, folderKey) => {
    e.stopPropagation();
    if (folderKey === 'sprint') {createNewSprint(pId);}
  };

  // Arrow keys move between the menu entries
  const onMenuKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {return;}
    const items = [...e.currentTarget.querySelectorAll('[role="menuitem"]')];
    if (items.length === 0) {return;}
    e.preventDefault();
    const at = items.indexOf(document.activeElement);
    const next = e.key === 'ArrowDown' ? (at + 1) % items.length : (at - 1 + items.length) % items.length;
    items[next].focus();
  };

  const folders = [
    {
      name: 'Backlog Management',
      folderKey: 'backlogManagement',
      files: [
        { name: 'backlog', id: 'backlog' },
        { name: 'bugs', id: 'bugs' },
      ],
    },
    {
      name: 'Sprint folder',
      folderKey: 'sprint',
      files: sprintFiles,
    },
  ];

  return (
    <div className="my-0.5">
      <div
        className={`group relative mx-2 flex items-center rounded-md ${active ? 'bg-secondary/15 text-brand' : 'text-text hover:bg-text/10'}`}
      >
        <button
          type="button"
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${name}`}
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="flex h-11 w-8 shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-secondary md:h-10"
        >
          <ChevronRight size={16} aria-hidden="true" className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </button>
        <button
          type="button"
          title={name}
          aria-current={active ? 'page' : undefined}
          className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md text-left text-sm font-medium focus-visible:outline-2 focus-visible:outline-secondary md:h-10"
          onClick={handleProjectNameClick}
        >
          <Image className="h-6 w-6 shrink-0 rounded-md bg-teal-50 object-cover" src={icon} alt="" size="sm" />
          <span className="truncate">{name}</span>
        </button>
        <div ref={menuRef} className="relative shrink-0">
          <button
            ref={triggerRef}
            type="button"
            aria-label={`Options for ${name}`}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-11 w-11 items-center justify-center rounded-md text-text-muted hover:text-text focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-secondary aria-expanded:opacity-100 md:h-10 md:w-10 md:opacity-0 md:group-hover:opacity-100"
          >
            <EllipsisVertical size={16} aria-hidden="true" />
          </button>
          {/* Always mounted so dialogs opened from the menu survive it closing */}
          <div
            ref={listRef}
            role="menu"
            hidden={!menuOpen}
            tabIndex={-1}
            aria-label={`Actions for ${name}`}
            onKeyDown={onMenuKeyDown}
            className="absolute right-0 top-full z-20 w-56 rounded-md border border-border bg-surface-raised p-1 text-sm text-text shadow-lg"
          >
            <Actions project={{ id, owner, name }} onDone={() => setMenuOpen(false)} />
          </div>
        </div>
      </div>
      {expanded && (
        <div>
          {folders.map((f, i) => (
            <PFolder
              key={f.folderKey}
              name={f.name}
              folderKey={f.folderKey}
              files={f.files}
              projectId={id}
              index={i}
              folderNameClick={handleFolderNameClick}
              fileClick={handleFileClick}
              handlePlusClick={handlePlusClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
