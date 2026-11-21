import React from 'react';
import { Outlet } from 'react-router-dom';
import Setting from '../../Components/Profile/Setting';
import { useGlobalCtx } from '../../Context/GlobalProvider';
import Sidebar from './Sidebar/Sidebar';

/**
 * Authenticated shell: navigation (rail on md+, tab bar on phones) plus the routed page.
 * Pages inside can use h-screen: it resolves to the visible area next to the tab bar.
 * @returns {JSX.Element}
 */
export default function Dashboard() {
  const { settingsModal } = useGlobalCtx();

  return (
    <>
      <div
        style={settingsModal ? { filter: 'blur(18px)' } : undefined}
        id="dashboard"
        className="flex h-screen w-full flex-col overflow-hidden md:flex-row"
      >
        <a href="#main" className="skip-link">Skip to content</a>
        <Sidebar />
        <main
          id="main"
          tabIndex={-1}
          style={{ '--app-h': 'calc(var(--vh-full) - var(--tabbar-h))' }}
          className="order-1 md:order-2 min-h-0 min-w-0 flex-1 overflow-auto outline-none"
        >
          <Outlet />
        </main>
      </div>
      {settingsModal ? <Setting /> : ''}
    </>
  );
}
