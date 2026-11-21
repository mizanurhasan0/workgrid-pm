import React, { useRef } from 'react';
import { UserGroup } from '../../../../assets';
import { useAuth } from '../../../../Context/AuthProvider';
import Image from '../../../Image';

/**
 * Tab strip of the settings dialog (My account, notifications, members).
 * Scrolls sideways on narrow screens.
 * @param {Object} props
 * @param {string} props.type Active tab key.
 * @param {function} props.setType Selects a tab.
 * @returns {JSX.Element}
 */
export default function BreadCrumbs({ type, setType }) {
  const { user } = useAuth();
  const refs = useRef({});
  const isAdmin = ['admin', 'owner'].includes(user?.role?.name || 'member');
  const tabs = [
    {
      key: 'account',
      label: 'My account',
      icon: <Image className="h-6 w-6 rounded-full object-cover" src={user?.avatar} alt="" />,
    },
    { key: 'settings', label: 'Notifications & settings', icon: <UserGroup className="h-5 w-5" /> },
    ...(isAdmin ? [{ key: 'user', label: 'Members', icon: <UserGroup className="h-5 w-5" /> }] : []),
  ];

  const onKeyDown = (e, index) => {
    let next = null;
    if (e.key === 'ArrowRight') {next = (index + 1) % tabs.length;}
    if (e.key === 'ArrowLeft') {next = (index - 1 + tabs.length) % tabs.length;}
    if (next === null) {return;}
    e.preventDefault();
    setType(tabs[next].key);
    refs.current[tabs[next].key]?.focus();
  };

  return (
    <div role="tablist" aria-label="Settings sections" className="flex gap-1 overflow-x-auto px-4 pb-2 sm:px-8 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
      {tabs.map(({ key, label, icon }, index) => {
        const active = type === key;
        return (
          <button
            key={key}
            ref={(el) => { refs.current[key] = el; }}
            type="button"
            role="tab"
            id={`settings-tab-${key}`}
            aria-selected={active}
            aria-controls={`settings-panel-${key}`}
            tabIndex={active ? 0 : -1}
            onClick={() => setType(key)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={`flex min-h-11 shrink-0 items-center gap-2 rounded-t-md border-b-2 px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${active
              ? 'border-brand-solid bg-brand-solid/10 text-brand'
              : 'border-transparent text-text-muted hover:bg-brand-solid/5'}`}
          >
            {icon}
            <span className="whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
