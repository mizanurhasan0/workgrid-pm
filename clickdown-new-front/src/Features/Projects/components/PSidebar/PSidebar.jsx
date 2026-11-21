import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { PanelLeftClose, Search, X } from 'lucide-react';
import PSidebarItem from './PSidebarItem';
import { useSidebar } from './SidebarContext';

const SECTIONS = [
  { name: 'Favorites', fieldName: 'favourites' },
  { name: 'Workspace', fieldName: 'projects' },
];

const iconBtn = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:h-10 md:w-10';

export default function PSidebar() {
  const { projects = [] } = useSelector((state) => state.projectStore);
  const [query, setQuery] = useState('');
  const { toggleCollapsed, closeMobile } = useSidebar();

  const search = query.trim().toLowerCase();
  const visibleProjects = search
    ? projects.filter((p) => (p.name ?? '').toLowerCase().includes(search))
    : projects;

  return (
    <nav aria-label="Project list" className="flex h-full w-full min-w-64 flex-col lg:min-w-72 border-r border-border bg-surface-alt">
      <div className="flex shrink-0 items-center gap-2 p-3">
        <form role="search" onSubmit={(e) => e.preventDefault()} className="relative min-w-0 flex-1">
          <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            aria-label="Search projects"
            placeholder="Search projects"
            autoComplete="off"
            className="h-11 w-full rounded-md border border-border bg-surface-raised pl-9 pr-9 text-sm text-text placeholder:text-text-muted focus-visible:border-secondary focus-visible:outline-2 focus-visible:outline-secondary md:h-10"
            type="search"
            name="projectSearch"
            id="projectSearch"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery('')}
              className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-text-muted hover:text-text"
            >
              <X size={16} aria-hidden="true" />
            </button>
          )}
        </form>
        <button type="button" aria-label="Hide projects panel" onClick={toggleCollapsed} className={`${iconBtn} max-md:hidden`}>
          <PanelLeftClose size={20} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Close projects list" onClick={closeMobile} className={`${iconBtn} md:hidden`}>
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-6">
        {SECTIONS.map((info) => (
          <PSidebarItem key={info.fieldName} info={info} projectSt={visibleProjects} searching={Boolean(search)} />
        ))}
      </div>
    </nav>
  );
}
