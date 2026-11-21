import { createContext, useContext } from 'react';

// State of the project list panel: collapsed on desktop, off-canvas on phones.
export const SidebarCtx = createContext({
  isDesktop: true,
  collapsed: false,
  toggleCollapsed: () => { },
  mobileOpen: false,
  setMobileOpen: () => { },
  closeMobile: () => { },
});

export const useSidebar = () => useContext(SidebarCtx);
