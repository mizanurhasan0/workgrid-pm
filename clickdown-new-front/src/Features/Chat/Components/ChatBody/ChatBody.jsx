import React, {
  useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { useSelector } from 'react-redux';
import { ArrowDown } from '../../../../assets';
import BodyHeader from './BodyHeader';
import Preview from '../ViewModal/Preview';
import Message from './Message';
import { ChatBodySkilton, ChatFooter, EmptyMsg } from './Handler';
import { useChatCtx } from '../../Context/ChatProvider';
import { useAuth } from '../../../../Context/AuthProvider';

const NEAR_BOTTOM_PX = 120;
const GROUP_GAP_MS = 5 * 60 * 1000;

const dayKey = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const dayLabel = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {return '';}
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(d) === dayKey(today)) {return 'Today';}
  if (dayKey(d) === dayKey(yesterday)) {return 'Yesterday';}
  return d.toLocaleDateString([], {
    weekday: 'short', month: 'short', day: 'numeric', year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
};

// Adds the day heading and the "first of a run by one author" flag to each message.
const withGrouping = (messages) => messages.map((msg, i) => {
  const prev = messages[i - 1];
  const newDay = !prev || dayKey(prev.createdAt) !== dayKey(msg.createdAt);
  const first = newDay
    || prev.author?.id !== msg.author?.id
    || prev.deleted !== msg.deleted
    || new Date(msg.createdAt) - new Date(prev.createdAt) > GROUP_GAP_MS;
  return { msg, first, heading: newDay ? dayLabel(msg.createdAt) : null };
});

export default function ChatBody({ onOpenDetails }) {
  const bodyMsgRef = useRef(null);
  const nearBottomRef = useRef(true);
  const scrolledChatRef = useRef(null);
  const [unseenBelow, setUnseenBelow] = useState(false);
  const { user } = useAuth();
  const { onScrollLoadMSG, msgLoading } = useChatCtx();
  const { selected, previewData, chatScroll } = useSelector((state) => state.chatsStore);
  const messages = selected?.msg;
  const rows = useMemo(() => withGrouping(messages ?? []), [messages]);

  const scrollToBottom = () => {
    const el = bodyMsgRef.current;
    if (el) {el.scrollTop = el.scrollHeight;}
    nearBottomRef.current = true;
    setUnseenBelow(false);
  };

  // chatScroll flips whenever a page of messages arrives or a message is added. Follow it
  // only when the chat was just opened, the reader is already at the bottom, or the
  // message is their own; otherwise offer a jump button instead of moving the page.
  useLayoutEffect(() => {
    const list = messages ?? [];
    const last = list[list.length - 1];
    const opened = scrolledChatRef.current !== selected?.chatId && list.length > 0;
    if (opened || nearBottomRef.current || last?.author?.id === user?.id) {
      if (messages.length > 0) {scrolledChatRef.current = selected?.chatId;}
      scrollToBottom();
    } else {
      setUnseenBelow(true);
    }
    // Only the flip signals a change; messages and the chat are read from the same render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatScroll]);

  useEffect(() => {
    if (!selected?.chatId) {scrolledChatRef.current = null;}
  }, [selected?.chatId]);

  const onScroll = (e) => {
    const el = e.currentTarget;
    nearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (nearBottomRef.current) {setUnseenBelow(false);}
    onScrollLoadMSG(e);
  };

  return (
    <section
      aria-label="Conversation"
      className="relative flex h-full min-h-0 min-w-0 flex-1 flex-col border-l border-border bg-app"
    >
      <BodyHeader onOpenDetails={onOpenDetails} />
      <div className="relative min-h-0 flex-1">
      <div
        className="h-full overflow-y-auto overscroll-contain px-3 py-2 md:px-4"
        ref={bodyMsgRef}
        onScroll={onScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Messages"
      >
        {msgLoading && <ChatBodySkilton />}
        {rows.length > 0 ? rows.map(({ msg, first, heading }) => (
          <React.Fragment key={msg.id}>
            {heading && (
              <div className="my-3 flex justify-center">
                <span className="rounded-full border border-border bg-panel px-3 py-1 text-xs font-medium text-text-muted">{heading}</span>
              </div>
            )}
            <Message msg={msg} first={first} />
          </React.Fragment>
        )) : (!msgLoading && <EmptyMsg title="No messages yet" />)}
      </div>
      {unseenBelow && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-3 right-4 z-10 flex h-10 items-center gap-1 rounded-full bg-brand-solid px-4 text-sm font-semibold text-on-brand shadow-elevated hover:bg-brand-solid-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
        >
          <ArrowDown className="h-4 w-4" />
          New messages
        </button>
      )}
      </div>
      <ChatFooter />
      {Object.keys(previewData ?? {}).length > 0 && <Preview previewData={previewData} />}
    </section>
  );
}
