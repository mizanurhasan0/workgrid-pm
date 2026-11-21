import React, {
  useCallback, useEffect, useMemo, useState, useSyncExternalStore,
} from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, PanelLeftOpen } from 'lucide-react';
import { useProjectsCtx } from '../context/ProjectsProvider';
import PSidebar from './PSidebar/PSidebar';
import { SidebarCtx } from './PSidebar/SidebarContext';
import MainDrawer from './MainDrawer/MainDrawer';
import TopBar from './TopBar/TopBar';

const DESKTOP_QUERY = '(min-width: 1024px)';

function useIsDesktop() {
  const subscribe = useCallback((cb) => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
  }, []);
  return useSyncExternalStore(subscribe, () => window.matchMedia(DESKTOP_QUERY).matches, () => true);
}

export default function ProjectsWrapper() {
  const { gridRef } = useProjectsCtx();
  const { projectId } = useParams();
  const projectName = useSelector(
    (state) => state.projectStore.projects?.find((p) => p.id === projectId)?.name,
  );
  const isDesktop = useIsDesktop();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // The off-canvas panel only opens on the user's request: any navigation to another project
  // (selection, or a redirect after a socket event) closes it again.
  const [seenProjectId, setSeenProjectId] = useState(projectId);
  if (seenProjectId !== projectId) {
    setSeenProjectId(projectId);
    setMobileOpen(false);
  }

  // Escape closes the open phone panel
  useEffect(() => {
    if (isDesktop || !mobileOpen) {return undefined;}
    const onKey = (e) => {
      if (e.key === 'Escape') {setMobileOpen(false);}
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isDesktop, mobileOpen]);

  const ctx = useMemo(() => ({
    isDesktop,
    collapsed,
    toggleCollapsed: () => setCollapsed((c) => !c),
    mobileOpen,
    setMobileOpen,
    closeMobile: () => setMobileOpen(false),
  }), [isDesktop, collapsed, mobileOpen]);

  const panelHidden = isDesktop ? collapsed : !mobileOpen;
  const showBar = !isDesktop || collapsed;

  return (
    <SidebarCtx.Provider value={ctx}>
      <TopBar />
      <div
        ref={gridRef}
        className={`grid h-full grid-cols-1 transition-[grid-template-columns] duration-300 ${collapsed ? 'lg:grid-cols-[0px_minmax(0,1fr)]' : 'lg:grid-cols-[18rem_minmax(0,1fr)]'}`}
      >
        {!isDesktop && mobileOpen && (
          <div className="fixed inset-0 z-30 bg-scrim" aria-hidden="true" onClick={() => setMobileOpen(false)} />
        )}
        <aside
          id="projects-panel"
          aria-label="Projects"
          inert={panelHidden}
          className={`fixed inset-y-0 left-0 z-40 max-md:bottom-14 w-[min(20rem,88vw)] transition-transform duration-300 lg:static lg:z-auto lg:w-auto lg:min-w-0 lg:overflow-hidden lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <PSidebar />
        </aside>
        <div id="projectOutlet" className="flex h-full min-h-0 min-w-0 flex-col overflow-auto px-4 md:px-5">
          {showBar && (
            <div className="sticky top-0 z-20 -mx-4 flex min-h-12 shrink-0 items-center gap-2 border-b border-border bg-surface-raised px-2 md:-mx-5 md:px-4">
              <button
                type="button"
                aria-label={isDesktop ? 'Show projects panel' : 'Open projects list'}
                aria-controls="projects-panel"
                aria-expanded={isDesktop ? !collapsed : mobileOpen}
                onClick={() => (isDesktop ? setCollapsed(false) : setMobileOpen(true))}
                className="flex h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-sm font-medium text-text hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary"
              >
                {isDesktop ? <PanelLeftOpen size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
                <span className={isDesktop ? 'sr-only' : ''}>Projects</span>
              </button>
              {projectName && (
                <span title={projectName} className="min-w-0 truncate text-sm font-semibold text-text">{projectName}</span>
              )}
            </div>
          )}
          <Outlet />
        </div>
        <MainDrawer />
      </div>
    </SidebarCtx.Provider>
  );
}
