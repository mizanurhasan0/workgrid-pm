import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Image from '../../../../Components/Image';
import { Dot3 } from '../../../../assets';
import ChatMenu from './ChatMenu';
import TimeDuration from '../../../../Utils/TimeDuration';
import { resetState, setActionModal, setSelectedUsers } from '../../ChatReducer';
import AlertToster from '../../../../Components/AlertToster';
import { useAuth } from '../../../../Context/AuthProvider';
import { useChatCtx } from '../../Context/ChatProvider';
import plainText from '../../Utils/plainText';

export default function ChatItem({ chat }) {
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const itemRef = useRef(null);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const {
    deleteChat, getNameTruncate, onLeave, onPinChat, getAvatar,
  } = useChatCtx();

  const active = activeId === chat.id;
  const isPinned = !!user?.pinnedChats?.includes(chat.id);
  const isCreator = chat.creator?.id === user?.id;
  const isUnread = !!chat.lastMessage && !chat.lastMessage.read_by?.includes(user?.id);
  const title = getNameTruncate(chat) ?? '';

  const getAction = (name) => {
    setMenuOpen(false);
    if (name === 'Update') {
      dispatch(resetState({ name: 'selectedUsers' }));
      dispatch(setSelectedUsers((chat.members ?? []).filter((m) => m.id !== user?.id)));
      dispatch(setActionModal({ show: true, chatData: chat }));
    } else if (name === 'Delete') {
      if ((chat.members?.length ?? 0) <= 1) {AlertToster('A self chat cannot be deleted.', 'error');}
      else if (window.confirm(`Delete "${title}" for everyone? This cannot be undone.`)) {deleteChat(chat.id);}
    } else if (name === 'Leave') {
      if (window.confirm(`Leave "${title}"?`)) {
        onLeave({
          cId: chat.id,
          selectUsrs: (chat.members ?? []).filter((m) => m.id !== user?.id),
          name: chat.name,
          pinChat: isPinned,
        });
      }
    } else if (name === 'Pin' || name === 'Unpin') {
      onPinChat(chat.id, name);
    }
  };

  // The menu closes on an outside click or Escape.
  useEffect(() => {
    if (!menuOpen) {return undefined;}
    const onPointer = (e) => {
      if (itemRef.current && !itemRef.current.contains(e.target)) {setMenuOpen(false);}
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {setMenuOpen(false);}
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const lastText = chat.lastMessage
    ? (chat.lastMessage.deleted ? '[Deleted]' : plainText(chat.lastMessage.message) || '[empty text]')
    : '';

  return (
    <li
      ref={itemRef}
      className="relative"
      onContextMenu={(e) => {
        e.preventDefault();
        setMenuOpen(true);
      }}
    >
      <div className={`flex items-center gap-1 rounded-lg ${active ? 'bg-selected ring-1 ring-border' : 'hover:bg-text/5'}`}>
        <button
          type="button"
          aria-current={active ? 'page' : undefined}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className="flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-lg px-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          <span className="relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full bg-border">
            <Image src={getAvatar(chat)} alt="" className="h-full w-full object-cover" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className={`min-w-0 truncate text-sm text-text ${isUnread ? 'font-bold' : 'font-semibold'}`}>{title}</span>
              {chat.lastMessage ? (
                <time dateTime={chat.lastMessage.updatedAt} className="shrink-0 text-xs tabular-nums text-text-muted">
                  {TimeDuration(chat.lastMessage.updatedAt)}
                </time>
              ) : null}
            </span>
            <span className="mt-0.5 flex items-center justify-between gap-2">
              <span className={`min-w-0 flex-1 truncate text-sm ${isUnread ? 'font-semibold text-text' : 'text-text-muted'}`}>
                {lastText}
              </span>
              {isUnread && (
                <span role="img" aria-label="Unread messages" className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-solid" />
              )}
            </span>
          </span>
        </button>
        <button
          type="button"
          aria-label={`Options for ${title}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring "
        >
          <Dot3 className="h-5 w-5" />
        </button>
      </div>
      {menuOpen && (
        <div className="absolute right-2 top-12 z-dropdown">
          <ChatMenu getAction={getAction} isPinned={isPinned} isCreator={isCreator} />
        </div>
      )}
    </li>
  );
}
