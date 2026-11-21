import React, { useId, useState } from 'react';
import { ChevronRight, FolderOpen, SearchX } from 'lucide-react';
import { useAuth } from '../../../../Context/AuthProvider';
import ProjectCreateModal from '../ProjectCreateModal/ProjectCreateModal';
import PList from './PList';
import { useProjectsCtx } from '../../context/ProjectsProvider';
import Skilton from './Skilton';

// One collapsible section of the sidebar: Favorites or Workspace
export default function PSidebarItem({ info: { fieldName, name }, projectSt, searching = false }) {
  const [open, setOpen] = useState(true);
  const panelId = useId();
  const { loading } = useProjectsCtx();
  const { user } = useAuth();
  const isFavourites = fieldName === 'favourites';
  const userId = user?.id;

  const list = projectSt.filter((p) => {
    const isFav = (p.favorit ?? []).includes(userId);
    return isFavourites ? isFav : !isFav;
  });

  const allFavourited = !isFavourites && !searching && projectSt.length > 0;

  // The Favorites section is hidden until something is favourited
  if (isFavourites && list.length === 0 && !loading) {return null;}

  return (
    <section aria-label={name} className="pt-2">
      <button
        type="button"
        className="flex h-11 w-full items-center justify-between px-4 text-xs font-semibold uppercase tracking-wide text-text-muted hover:text-text focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-secondary md:h-10"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{name}</span>
        <ChevronRight size={16} aria-hidden="true" className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
      </button>
      <div id={panelId} hidden={!open}>
        {!isFavourites && <ProjectCreateModal />}
        {loading && (
          <div role="status" aria-label="Loading projects" className="space-y-1">
            <Skilton />
            <Skilton />
            <Skilton />
          </div>
        )}
        {!loading && list.length === 0 && !isFavourites && (
          <div className="flex flex-col items-center gap-2 px-6 py-6 text-center text-sm text-text-muted">
            {searching ? <SearchX size={24} aria-hidden="true" /> : <FolderOpen size={24} aria-hidden="true" />}
            <p>{searching ? 'No projects match your search' : allFavourited ? 'All projects are in Favorites' : 'No projects yet'}</p>
            {!searching && !allFavourited && <p className="text-xs text-text-muted">Use &quot;Add new space&quot; to create your first project.</p>}
          </div>
        )}
        {list.map((p, i) => (
          <PList key={p.id} index={i} project={p} />
        ))}
      </div>
    </section>
  );
}
