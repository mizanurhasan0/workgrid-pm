import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Image from '../../../../Components/Image';
import { AngleLeft, Call, Information, Video } from '../../../../assets';
import { useChatCtx } from '../../Context/ChatProvider';
import CallActions from '../CallActions';

const iconBtn = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring ';

export default function BodyHeader({ onOpenDetails }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const activeChat = useSelector((state) => state.chatsStore.chats.find((c) => c.id === id));
  const { getNameTruncate, getAvatar } = useChatCtx();

  if (!activeChat) {
    return (
      <header className="flex min-h-16 shrink-0 items-center border-b border-border bg-panel px-4 text-sm text-text-muted">
        <p>Select a chat to start messaging.</p>
      </header>
    );
  }

  const memberCount = activeChat.members?.length ?? 0;
  const subtitle = memberCount > 2 ? `${memberCount} members` : 'Direct message';

  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-panel px-2 py-2 md:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <button type="button" aria-label="Back to chats" onClick={() => navigate('/chat/create')} className={`${iconBtn} md:hidden`}>
          <AngleLeft className="h-6 w-6" />
        </button>
        <span className="flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-border">
          <Image src={getAvatar(activeChat)} alt="" className="h-full w-full object-cover" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold leading-6 text-text">{getNameTruncate(activeChat, 3)}</h2>
          <p className="truncate text-xs text-text-muted">{subtitle}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <CallActions
          chat={activeChat}
          AudioIcon={Call}
          VideoIcon={Video}
          buttonClass={iconBtn}
          iconClass="h-5 w-5"
          joinClass="h-11 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-on-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        />
        <button type="button" aria-label="Chat details" onClick={onOpenDetails} className={`${iconBtn} xl:hidden`}>
          <Information className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
