import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Chate, Pin, Plus } from '../../../../assets';
import ChatItem from './ChatItem';
import ChatsHead from './ChatsHead';
import Title from './Title';
import { useAuth } from '../../../../Context/AuthProvider';
import { setActionModal } from '../../ChatReducer';
import { useChatCtx } from '../../Context/ChatProvider';

export default function Chats() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { chats } = useSelector((state) => state.chatsStore);
  const { onScrollChats, getNameTruncate } = useChatCtx();
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState({ pinned: false, recent: false });

  const pinnedIds = user?.pinnedChats ?? [];
  const needle = query.trim().toLowerCase();
  const matches = (c) => !needle || (getNameTruncate(c, 99) ?? '').toLowerCase().includes(needle);
  const pinned = chats.filter((c) => pinnedIds.includes(c.id) && matches(c));
  const recent = chats.filter((c) => !pinnedIds.includes(c.id) && matches(c));

  const toggle = (key) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <section
      aria-label="Chats"
      className="flex h-full min-h-0 w-full min-w-0 flex-col gap-4 bg-panel px-4 pt-6"
    >
      <ChatsHead query={query} onQuery={setQuery} />
      <button
        type="button"
        onClick={() => dispatch(setActionModal({ show: true, chatData: null }))}
        className="flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-solid text-sm font-semibold text-on-brand hover:bg-brand-solid-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
      >
        <Plus className="h-5 w-5" />
        New chat
      </button>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-4" onScroll={onScrollChats}>
        {pinnedIds.length > 0 && (
          <>
            <Title
              Icon={Pin}
              title="Pinned chats"
              expanded={!collapsed.pinned}
              controls="pinChatBody"
              onToggle={() => toggle('pinned')}
            />
            <ul id="pinChatBody" hidden={collapsed.pinned} className="space-y-1">
              {pinned.map((c) => <ChatItem key={c.id} chat={c} />)}
            </ul>
          </>
        )}
        <Title
          Icon={Chate}
          title="Recent messages"
          expanded={!collapsed.recent}
          controls="recentChatBody"
          onToggle={() => toggle('recent')}
        />
        <ul
          id="recentChatBody"
          hidden={collapsed.recent}
          className="space-y-1"
        >
          {recent.map((c) => <ChatItem key={c.id} chat={c} />)}
        </ul>
        {recent.length === 0 && !collapsed.recent && (
          <p className="py-4 text-center text-sm text-text-muted">
            {needle ? 'No chats match your search.' : 'No chats yet.'}
          </p>
        )}
      </div>
    </section>
  );
}
