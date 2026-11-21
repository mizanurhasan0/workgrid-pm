import React, { useEffect, useRef, useState } from 'react';
import {
  Attach, Cancel, MailOpen, Sent, Smile, Text,
} from '../../../../assets';
import { useChatCtx } from '../../Context/ChatProvider';
import AlertToster from '../../../../Components/AlertToster';
import MarkDown from '../MarkDown/MarkDown';

const EMOJIS = ['💗', '😍', '😄', '😁', '😃', '😂', '😅', '👍'];
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 10;

const toolBtn = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring md:h-10 md:w-10 ';

// Enter sends on devices with a keyboard; on touch screens Enter inserts a new line.
const prefersEnterToSend = () => !(window.matchMedia?.('(pointer: coarse)').matches);

function ChatFooter() {
  const fileUploadRef = useRef(null);
  const emojiBoxRef = useRef(null);
  const {
    submitMessage, onWriteFileSize, appendText, sizeWrite, sending,
  } = useChatCtx();
  const [files, setFiles] = useState([]);
  const [emojiOpen, setEmojiOpen] = useState(false);

  // The emoji picker closes on an outside click or Escape.
  useEffect(() => {
    if (!emojiOpen) {return undefined;}
    const onPointer = (e) => {
      if (emojiBoxRef.current && !emojiBoxRef.current.contains(e.target)) {setEmojiOpen(false);}
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {setEmojiOpen(false);}
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [emojiOpen]);

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files ?? []);
    // Reset so the same file can be picked again.
    e.target.value = '';
    const tooBig = picked.filter((f) => f.size > MAX_FILE_BYTES);
    if (tooBig.length) {AlertToster(`${tooBig[0].name} is larger than 25 MB and was not added.`, 'warning');}
    const ok = picked.filter((f) => f.size <= MAX_FILE_BYTES);
    if (!ok.length) {return;}
    const merged = [...files, ...ok];
    if (merged.length > MAX_FILES) {AlertToster(`You can attach up to ${MAX_FILES} files.`, 'warning');}
    setFiles(merged.slice(0, MAX_FILES));
  };

  const handleSubmit = async () => {
    if (sending) {return;}
    const sent = await submitMessage({ files });
    if (sent) {setFiles([]);}
  };

  // Enter sends, Shift+Enter adds a line. Ctrl/Cmd+Enter always sends. Enter that confirms
  // an IME composition (keyCode 229 / isComposing) is left alone.
  const onKeyDown = (e) => {
    if (e.target.tagName !== 'TEXTAREA' || e.key !== 'Enter') {return;}
    if (e.nativeEvent.isComposing || e.keyCode === 229) {return;}
    const modified = e.ctrlKey || e.metaKey;
    if (modified || (!e.shiftKey && prefersEnterToSend())) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="shrink-0 border-t border-border bg-panel px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2"
      onKeyDown={onKeyDown}
    >
      {files.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2" aria-label="Attached files">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}-${f.lastModified}-${i}`} className="flex max-w-full items-center gap-1 rounded-lg border border-border bg-card py-1 pl-3 pr-1 text-xs text-text">
              <span className="max-w-48 truncate">{f.name}</span>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                <Cancel className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <MarkDown placeholder="Type a new message..." />
      <div className="mt-1 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center">
          <button
            type="button"
            aria-label="Formatting toolbar"
            aria-pressed={!sizeWrite}
            onClick={onWriteFileSize}
            className={`${toolBtn} ${!sizeWrite ? 'bg-brand-solid/10 text-brand' : ''}`}
          >
            <Text className="h-5 w-5" />
          </button>
          <div className="relative" ref={emojiBoxRef}>
            <button
              type="button"
              aria-label="Insert emoji"
              aria-expanded={emojiOpen}
              aria-haspopup="true"
              onClick={() => setEmojiOpen((o) => !o)}
              className={toolBtn}
            >
              <Smile className="h-5 w-5" />
            </button>
            {emojiOpen && (
              <div className="absolute bottom-full left-0 z-dropdown mb-1 grid w-48 grid-cols-4 gap-1 rounded-lg border border-border bg-raised p-2 shadow-elevated">
                {EMOJIS.map((em) => (
                  <button
                    type="button"
                    key={em}
                    aria-label={`Insert ${em}`}
                    onClick={() => appendText(em)}
                    className="flex h-10 w-10 items-center justify-center rounded-md text-xl hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring "
                  >
                    {em}
                  </button>
                ))}
              </div>
            )}
          </div>
          <input
            ref={fileUploadRef}
            type="file"
            multiple
            tabIndex={-1}
            aria-hidden="true"
            className="hidden"
            accept="image/*,.doc,.docx,.ppt,.pptx,.txt,.pdf"
            onChange={onPickFiles}
          />
          <button type="button" aria-label="Attach files" onClick={() => fileUploadRef.current?.click()} className={toolBtn}>
            <Attach className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          aria-label="Send message"
          disabled={sending}
          onClick={handleSubmit}
          className="flex h-11 shrink-0 items-center gap-2 rounded-lg bg-brand-solid px-4 text-sm font-semibold text-on-brand hover:bg-brand-solid-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-60 md:h-10"
        >
          <Sent className="h-5 w-5" />
          <span className="hidden sm:inline">{sending ? 'Sending...' : 'Send'}</span>
        </button>
      </div>
    </div>
  );
}

function EmptyMsg({ title, hint = 'Send a message to start the conversation.' }) {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <div className="flex max-w-xs flex-col items-center gap-2 text-center text-text-muted">
        <MailOpen className="h-10 w-10" />
        <h2 className="text-lg font-semibold text-text">{title}</h2>
        <p className="text-sm">{hint}</p>
      </div>
    </div>
  );
}

function ChatBodySkilton() {
  return (
    <div className="mb-4 space-y-3 motion-safe:animate-pulse" role="status" aria-label="Loading messages">
      <div className="flex items-end gap-2">
        <div className="h-8 w-8 rounded-full bg-text/10" />
        <div className="h-12 w-1/2 rounded-2xl bg-text/10" />
      </div>
      <div className="flex items-end justify-end gap-2">
        <div className="h-10 w-1/3 rounded-2xl bg-text/10" />
      </div>
      <div className="flex items-end gap-2">
        <div className="h-8 w-8 rounded-full bg-text/10" />
        <div className="h-16 w-2/3 rounded-2xl bg-text/10" />
      </div>
    </div>
  );
}

export {
  ChatFooter,
  EmptyMsg,
  ChatBodySkilton,
};
