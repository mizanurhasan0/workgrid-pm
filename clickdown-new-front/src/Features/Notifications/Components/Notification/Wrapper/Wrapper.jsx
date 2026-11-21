import React, { useState } from 'react';
import { useAuth } from '../../../../../Context/AuthProvider';
import Tabs from '../../Tabs/Tabs';
import AllNotification from '../AllNotification/AllNotification';
import Comment from '../Comment/Comment';
import Archieves from '../Archieves/Archieves';
import useLogFlags from '../../../Utils/useLogFlags';

const PANELS = {
  all: AllNotification,
  comment: Comment,
  archieve: Archieves,
};

export default function Wrapper({ onSelect }) {
  const [type, setType] = useState('all');
  const { user } = useAuth();
  const flags = useLogFlags(user?.id);
  const unread = flags.unreadCount;
  const tabs = [
    { key: 'all', label: 'All', badge: unread },
    { key: 'comment', label: 'Comments' },
    { key: 'archieve', label: 'Archived' },
  ];
  const Panel = PANELS[type];

  return (
    <section className="min-h-dvh border-r border-border" aria-labelledby="notifications-title">
      <div className="flex items-center justify-between gap-3 p-4 sm:p-6">
        <h1 id="notifications-title" className="text-xl! font-bold text-strong">Notifications</h1>
        {unread > 0 ? (
          <button
            type="button"
            onClick={flags.markAllRead}
            className="min-h-11 rounded-md px-3 text-sm font-medium text-brand hover:bg-brand-solid/10 focus-visible:outline-2 focus-visible:outline-focus-ring"
          >
            Mark all as read
          </button>
        ) : null}
      </div>
      <div className="border-y border-border">
        <Tabs tabs={tabs} value={type} onChange={setType} label="Notification filters" idPrefix="notif" />
      </div>
      <div role="tabpanel" id={`notif-panel-${type}`} aria-labelledby={`notif-tab-${type}`} tabIndex={0}>
        <Panel flags={flags} onSelect={onSelect} />
      </div>
    </section>
  );
}
