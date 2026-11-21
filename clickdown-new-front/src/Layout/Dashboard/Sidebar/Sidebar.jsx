import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import {
  Avatar,
  Message2,
  Notification,
  Project,
  Setting,
  Navlogo,
} from '../../../assets';
import { useGlobalCtx } from '../../../Context/GlobalProvider';
import { useAuth } from '../../../Context/AuthProvider';
import ThemeToggle from '../../../Components/Theme/ThemeToggle';
import './Sidebar.css';
import Image from '../../../Components/Image';

const menuData = [
  { icon: Project, id: 1, name: 'Projects', path: '/', match: (p) => !p.startsWith('/notification') && !p.startsWith('/chat') },
  { icon: Notification, id: 2, name: 'Notifications', path: '/notification', match: (p) => p.startsWith('/notification') },
  { icon: Message2, id: 3, name: 'Chat', path: '/chat/create', match: (p) => p.startsWith('/chat') },
];

const itemBase = 'relative flex flex-1 md:flex-none flex-col items-center justify-center gap-0.5 min-h-tap md:h-12 md:w-12 rounded-control text-xs font-medium transition-colors';
const itemIdle = 'text-text-muted hover:text-brand hover:bg-hover';
const itemActive = 'text-brand bg-selected';

/**
 * Dashboard navigation. Icon rail from md up, bottom tab bar on phones.
 * The account menu holds the theme switch and sign out.
 * @returns {JSX.Element}
 */
export default function Sidebar() {
  // The menu is tied to the route it was opened on, so navigating closes it.
  const [openAt, setOpenAt] = useState(null);
  const { settingsModal, setSettingsModal } = useGlobalCtx();
  const { logout, user } = useAuth();
  const { pathname } = useLocation();
  const menuOpen = openAt === pathname;
  const setMenuOpen = (next) => setOpenAt((current) => {
    const value = typeof next === 'function' ? next(current === pathname) : next;
    return value ? pathname : null;
  });

  // The account menu closes on an outside press or Escape (focus returns to its button).
  useEffect(() => {
    if (!menuOpen) {return undefined;}
    const onPress = (event) => {
      if (!event.target.closest?.('[data-account]')) {setOpenAt(null);}
    };
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpenAt(null);
        const triggers = [...document.querySelectorAll('[data-account] > button')];
        triggers.find((el) => el.offsetParent !== null)?.focus();
      }
    };
    document.addEventListener('pointerdown', onPress);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPress);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <nav
      aria-label="Main navigation"
      className="dash-nav order-2 md:order-1 shrink-0 z-nav flex flex-row md:flex-col items-stretch md:items-center md:w-rail md:py-5 border-t md:border-t-0 md:border-r border-border bg-app pb-safe"
    >
      <Link to="/" aria-label="Workgrid home" className="hidden md:flex rounded-control">
        <img src={Navlogo} alt="" width="36" height="36" className="h-9 w-9" />
      </Link>
      <ul className="flex flex-1 md:flex-none flex-row md:flex-col items-stretch md:items-center justify-around md:justify-start md:gap-3 md:mt-8 px-1 md:px-0">
        {menuData.map((item) => {
          const active = item.match(pathname);
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex flex-1 md:flex-none">
              <Link
                to={item.path}
                aria-label={item.name}
                aria-current={active ? 'page' : undefined}
                title={item.name}
                className={`${itemBase} ${active ? itemActive : itemIdle}`}
              >
                <Icon className="h-6 w-6" />
                <span className="md:sr-only">{item.name}</span>
              </Link>
            </li>
          );
        })}
        <li className="flex flex-1 md:flex-none">
          <button
            type="button"
            aria-label="Settings"
            title="Settings"
            aria-haspopup="dialog"
            aria-expanded={Boolean(settingsModal)}
            onClick={() => setSettingsModal(!settingsModal)}
            className={`${itemBase} w-full ${settingsModal ? itemActive : itemIdle}`}
          >
            <Setting className="h-6 w-6" />
            <span className="md:sr-only">Settings</span>
          </button>
        </li>
        <li className="flex flex-1 md:hidden">
          <AccountButton
            user={user}
            open={menuOpen}
            setOpen={setMenuOpen}
            logout={logout}
            mobile
          />
        </li>
      </ul>
      <div className="hidden md:flex md:mt-auto flex-col items-center gap-2">
        <ThemeToggle className="h-12 w-12" />
        <DesktopAccount
          user={user}
          open={menuOpen}
          setOpen={setMenuOpen}
          logout={logout}
        />
      </div>
    </nav>
  );
}

function AccountMenu({ logout, close, mobile }) {
  return (
    <div
      role="menu"
      aria-label="Account"
      className={`absolute z-dropdown w-48 rounded-card border border-border bg-raised p-1 shadow-elevated ${mobile ? 'bottom-full right-0 mb-2' : 'left-full bottom-0 ml-3'}`}
    >
      {mobile ? (
        <div className="px-1 pb-1 mb-1 border-b border-border">
          <ThemeToggle showLabel className="w-full justify-start px-3 !text-text" />
        </div>
      ) : null}
      <button
        type="button"
        role="menuitem"
        onClick={() => {
          close();
          logout();
        }}
        className="flex w-full items-center gap-2 min-h-tap rounded-control px-3 text-sm font-medium text-text hover:bg-hover"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Sign out
      </button>
    </div>
  );
}

function AccountButton({
  user, open, setOpen, logout, mobile = false,
}) {
  return (
    <div className="relative flex flex-1" data-account>
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`${itemBase} w-full ${open ? itemActive : itemIdle}`}
      >
        {user?.avatar ? <Image src={user.avatar} size="sm" className="rounded-full object-cover" alt="" /> : <Avatar className="h-6 w-6" />}
        <span className="md:sr-only">Account</span>
      </button>
      {open ? <AccountMenu logout={logout} close={() => setOpen(false)} mobile={mobile} /> : null}
    </div>
  );
}

function DesktopAccount({
  user, open, setOpen, logout,
}) {
  // Desktop and mobile triggers never show together (md:hidden / hidden md:flex), but they share state.
  return (
    <div className="relative" data-account>
      <button
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-12 w-12 items-center justify-center rounded-full"
      >
        {user?.avatar ? <Image src={user.avatar} size="sm" className="rounded-full object-cover" alt="" /> : <Avatar className="h-7 w-7" />}
      </button>
      {open ? <AccountMenu logout={logout} close={() => setOpen(false)} /> : null}
    </div>
  );
}
