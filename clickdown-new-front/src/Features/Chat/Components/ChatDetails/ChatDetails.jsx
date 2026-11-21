import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Cancel } from '../../../../assets';
import Attachments from './Attachments';
import DetailsCard from './DetailsCard';
import Links from './Links';
import Title from './Title';

const matchesQuery = (text, query) => !query.trim() || String(text ?? '').toLowerCase().includes(query.trim().toLowerCase());

/**
 * Chat details. A column next to the conversation on wide screens (xl), a sheet that
 * slides over it on smaller ones (bottom sheet on phones, side drawer from md).
 */
export default function ChatDetails({ open = false, onClose = () => {} }) {
  const { attach } = useSelector((state) => state.chatsStore);
  const [queries, setQueries] = useState({ attachment: '', links: '' });
  const [collapsed, setCollapsed] = useState({ attachment: false, links: false });
  const closeRef = useRef(null);

  const setQuery = (key) => (value) => setQueries((prev) => ({ ...prev, [key]: value }));
  const toggle = (key) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  const files = (attach?.attachment ?? []).filter((a) => matchesQuery(a.location, queries.attachment));
  const links = (attach?.links ?? []).filter((l) => matchesQuery(l, queries.links));

  useEffect(() => {
    if (!open) {return undefined;}
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {onClose();}
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close details"
          tabIndex={-1}
          onClick={onClose}
          className="fixed inset-0 z-[48] cursor-default bg-scrim xl:hidden"
        />
      )}
      <aside
        aria-label="Chat details"
        className={`${open ? 'flex' : 'hidden'} fixed inset-x-0 bottom-0 z-drawer max-h-[85dvh] min-w-0 flex-col gap-3 overflow-y-auto rounded-t-2xl bg-panel p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-elevated md:inset-y-0 md:left-auto md:right-0 md:max-h-none md:w-80 md:rounded-none xl:static xl:z-auto xl:flex xl:h-full xl:w-80 xl:shrink-0 xl:rounded-none xl:border-l xl:border-border xl:shadow-none`}
      >
        <div className="flex items-center justify-between xl:hidden">
          <h2 className="text-base font-semibold text-text">Details</h2>
          <button
            type="button"
            ref={closeRef}
            aria-label="Close details"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-text hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring "
          >
            <Cancel className="h-5 w-5" />
          </button>
        </div>
        <DetailsCard />
        <Title
          title="Attachments"
          searchLabel="Search attachments"
          expanded={!collapsed.attachment}
          controls="attachRef"
          onToggle={() => toggle('attachment')}
          query={queries.attachment}
          onQuery={setQuery('attachment')}
        />
        <Attachments id="attachRef" hidden={collapsed.attachment} files={files} />
        <Title
          title="Links"
          searchLabel="Search links"
          expanded={!collapsed.links}
          controls="linkRef"
          onToggle={() => toggle('links')}
          query={queries.links}
          onQuery={setQuery('links')}
        />
        <Links id="linkRef" hidden={collapsed.links} links={links} />
      </aside>
    </>
  );
}
