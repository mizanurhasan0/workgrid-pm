import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bold, BulletList, Code, InsetLink, Italy, LeftAlign, LineThrough,
  NumberList, Quote, RightAlign,
} from '../../../../../assets';
import FontSize from './Font/FontSize';
import { useChatCtx } from '../../../Context/ChatProvider';
import { setUpdateChat } from '../../../ChatReducer';
import { useAuth } from '../../../../../Context/AuthProvider';

const tool = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring ';
const icon = 'h-5 w-5';
const divider = <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" />;

export default function Write({ placeholder = 'Type a new message...' }) {
  const {
    onSeenMsg,
    applyStyle,
    markInputRef,
    insertTabSpace,
    removeTabSpace,
    sizeWrite,
    setTextValue,
  } = useChatCtx();
  const { id } = useParams();
  const { user } = useAuth();
  const dispatch = useDispatch();

  // Opening a chat marks its last message as read for this user.
  const onSeenMessages = () => {
    dispatch((update, state) => {
      const targetChat = state().chatsStore.chats.find((c) => c.id === id);
      const readBy = targetChat?.lastMessage?.read_by;
      if (readBy && user && !readBy.includes(user.id)) {
        onSeenMsg({ cId: id });
        const lastMsg = { ...targetChat.lastMessage, read_by: [...readBy, user.id] };
        update(setUpdateChat({ ...targetChat, lastMessage: lastMsg }));
      }
    });
  };

  // Messages that arrive while this chat is open and visible count as read.
  const lastReadBy = useSelector((state) => state.chatsStore.chats.find((c) => c.id === id)?.lastMessage?.read_by);
  useEffect(() => {
    if (document.visibilityState === 'visible') {onSeenMessages();}
    // onSeenMessages only reads the store; it re-runs when the last message's readers change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, lastReadBy]);

  const coarse = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

  return (
    <section>
      <div className="flex flex-col rounded-lg border border-border bg-card focus-within:border-brand focus-within:ring-1 focus-within:ring-focus-ring">
        <div role="toolbar" aria-label="Text formatting" className={`${sizeWrite ? 'hidden' : 'flex'} flex-wrap items-center border-b border-border px-1 py-1`}>
          <button type="button" aria-label="Bold" className={tool} onClick={(e) => applyStyle('bold', e)}>
            <Bold className={icon} />
          </button>
          <button type="button" aria-label="Italic" className={tool} onClick={(e) => applyStyle('italic', e)}>
            <Italy className={icon} />
          </button>
          <button type="button" aria-label="Strikethrough" className={tool} onClick={(e) => applyStyle('strike', e)}>
            <LineThrough className={icon} />
          </button>
          {divider}
          <FontSize buttonClass={tool} />
          <button type="button" aria-label="Outdent" className={tool} onClick={removeTabSpace}>
            <LeftAlign className={icon} />
          </button>
          <button type="button" aria-label="Indent" className={tool} onClick={insertTabSpace}>
            <RightAlign className={icon} />
          </button>
          {divider}
          <button type="button" aria-label="Numbered list" className={tool} onClick={(e) => applyStyle('ollist', e)}>
            <NumberList className={icon} />
          </button>
          <button type="button" aria-label="Bulleted list" className={tool} onClick={(e) => applyStyle('ullist', e)}>
            <BulletList className={icon} />
          </button>
          <button type="button" aria-label="Quote" className={tool} onClick={(e) => applyStyle('quote', e)}>
            <Quote className={icon} />
          </button>
          {divider}
          <button type="button" aria-label="Insert link" className={tool} onClick={(e) => applyStyle('url', e)}>
            <InsetLink className={icon} />
          </button>
          <button type="button" aria-label="Code block" className={tool} onClick={(e) => applyStyle('code', e)}>
            <Code className={icon} />
          </button>
        </div>
        <textarea
          ref={markInputRef}
          name="markdown"
          rows={1}
          aria-label={placeholder}
          placeholder={placeholder}
          // Focusing on a phone would open the keyboard as soon as a chat opens.
          autoFocus={!coarse}
          maxLength={4000}
          onChange={(e) => setTextValue(e.target.value)}
          onFocus={onSeenMessages}
          className={`${sizeWrite ? 'min-h-11' : 'min-h-20'} max-h-40 w-full resize-none rounded-lg bg-transparent px-3 py-2.5 text-base leading-6 text-text outline-none [field-sizing:content] placeholder:text-text-muted`}
        />
      </div>
    </section>
  );
}
