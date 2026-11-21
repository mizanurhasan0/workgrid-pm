import React from 'react';
import { useSelector } from 'react-redux';
import PList from './Projects/PList';
import { useAuth } from '../../../../../Context/AuthProvider';

// Picker for copying or moving the selected tasks into a project folder
export default function ProjectsTree({ action = 'copy' }) {
  const projects = useSelector((state) => state.projectStore.projects) ?? [];
  const { user } = useAuth();
  const isFavourite = (p) => (p.favorit ?? []).includes(user?.id);
  const favourites = projects.filter(isFavourite);
  const others = projects.filter((p) => !isFavourite(p));

  return (
    <div className="absolute left-0 top-full z-10 mt-1 rounded-lg border border-border bg-surface-raised text-text shadow-2xl max-sm:fixed max-sm:inset-x-2 max-sm:top-24">
      <p className="border-b border-border px-3 py-3 text-sm font-medium text-text">{action === 'move' ? 'Move tasks' : 'Duplicate tasks'}</p>
      <div className="max-h-72 overflow-y-auto overflow-x-hidden pb-2">
        {favourites.length > 0 && (
          <>
            <p className="px-3 pt-2 text-xs font-medium text-text-muted">Favorites</p>
            {favourites.map((p, i) => (
              <PList key={p.id} index={i} project={p} action={action} />
            ))}
          </>
        )}
        <p className="px-3 pt-2 text-xs font-medium text-text-muted">Spaces</p>
        {others.map((p, i) => (
          <PList key={p.id} index={i} project={p} action={action} />
        ))}
      </div>
    </div>
  );
}
