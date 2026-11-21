import React, {
  useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Check, CheckCheck } from 'lucide-react';
import Image from '../../../../Components/Image';
import { Delete } from '../../../../assets';
import Icons from '../Icons';
import RenderMarkdown from '../MarkDown/RenderMarkdown';
import { useAuth } from '../../../../Context/AuthProvider';
import { useChatCtx } from '../../Context/ChatProvider';
import { setPreviewData } from '../../ChatReducer';
import { ReactionChips, ReactionPicker } from './Reactions';

const PAGE_SIZE = 6;

// Images are shown before other files.
const fileRank = (file) => (file.type === 'image' ? 0 : 1);
const fileNameOf = (file) => (file.location || '').split('/').pop();

const clock = (value) => {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * One message bubble.
 * @param {Object} msg the message
 * @param {boolean} first first message of a run by the same author, so it shows name and avatar
 */
export default function Message({ msg, first = true }) {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { id: chatId } = useParams();
  const { onMsgDelete, onReact } = useChatCtx();
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState(false);

  const own = !!msg.author && msg.author.id === user?.id;
  const name = msg.author?.name ?? 'Unknown';
  const text = msg.message ?? '';
  const [clipped, setClipped] = useState(false);
  const bodyRef = useRef(null);

  // The body is clamped to a few lines; the toggle shows only when text is actually cut.
  useLayoutEffect(() => {
    const el = bodyRef.current;
    if (el && !expanded) {setClipped(el.scrollHeight > el.clientHeight + 1);}
  }, [text, expanded]);
  const isLong = clipped || expanded;
  const attachments = [...(msg.attachments ?? [])].sort((a, b) => fileRank(a) - fileRank(b));
  const shown = attachments.slice(0, page * PAGE_SIZE);
  const remaining = attachments.length - shown.length;
  const seen = own && (msg.read_by ?? []).some((rid) => rid !== user?.id);

  const onDelete = () => {
    if (window.confirm('Delete this message for everyone?')) {onMsgDelete({ mId: msg.id, chatId });}
  };

  const onToggleReaction = (emoji, mine) => onReact({ mId: msg.id, emoji, remove: mine });

  const [barOpen, setBarOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const rowRef = useRef(null);
  const barVisible = barOpen || pickerOpen;

  // Touch screens have no hover: a tap on the bubble shows the action toolbar, a tap elsewhere hides it.
  const onRowTap = (e) => {
    if (!window.matchMedia?.('(hover: none)').matches || msg.deleted) {return;}
    if (e.target.closest('a,button,[role="toolbar"]')) {return;}
    setBarOpen((o) => !o);
  };
  useEffect(() => {
    if (!barOpen) {return undefined;}
    const onDown = (e) => {
      if (rowRef.current && !rowRef.current.contains(e.target)) {setBarOpen(false);}
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [barOpen]);

  const bubbleTone = own
    ? 'bg-brand-solid text-on-brand'
    : 'border border-border bg-raised text-text';
  const metaTone = own ? 'text-on-brand/85' : 'text-text-muted';
  const chipTone = own ? 'bg-black/20' : 'bg-text/10';

  return (
    <div className={`relative flex items-end gap-2 ${own ? 'flex-row-reverse' : ''} ${first ? 'mt-3' : 'mt-0.5'}`}>
      <span className={`flex h-8 w-8 shrink-0 overflow-hidden rounded-full ${first ? 'bg-border' : ''}`}>
        {first && <Image src={msg.author?.avatar} alt="" className="h-full w-full object-cover" />}
      </span>
      <div
        ref={rowRef}
        onClick={onRowTap}
        className="group relative min-w-0 max-w-[85%] md:max-w-[75%] lg:max-w-[65ch]"
      >
        <div className={`flex min-w-0 flex-col ${own ? 'items-end' : 'items-start'}`}>
        <div className={`min-w-0 rounded-2xl px-3 py-2 ${own ? 'rounded-br-md' : 'rounded-bl-md'} ${msg.deleted ? 'border border-dashed border-border italic text-text-muted' : bubbleTone}`}>
          {msg.deleted ? (
            <p className="text-sm">This message has been deleted.</p>
          ) : (
            <>
              {!own && first && (
                <p className="mb-0.5 truncate text-xs font-semibold capitalize text-brand">{name}</p>
              )}
              <div ref={bodyRef} className={expanded ? '' : 'line-clamp-[12]'}>
                <RenderMarkdown>{text}</RenderMarkdown>
              </div>
              {isLong && (
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpanded((e) => !e)}
                  className="mt-1 block text-xs font-semibold underline focus-visible:outline-2 focus-visible:outline-current"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
              {attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {shown.map((f) => (f.type === 'image' ? (
                    <button
                      type="button"
                      key={f.id}
                      aria-label={`Preview image ${fileNameOf(f)}`}
                      className="h-24 w-24 overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                      onClick={() => dispatch(setPreviewData(f))}
                    >
                      <Image src={f.location} alt={fileNameOf(f)} className="h-full w-full object-cover" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      key={f.id}
                      aria-label={`Preview ${fileNameOf(f)}`}
                      onClick={() => dispatch(setPreviewData(f))}
                      className={`flex h-12 max-w-full items-center gap-2 rounded-lg ${chipTone} px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}
                    >
                      <Icons location={f.location} className="h-5 w-5 shrink-0" />
                      <span className="min-w-0 truncate">{fileNameOf(f)}</span>
                    </button>
                  )))}
                  {remaining > 0 && (
                    <button
                      type="button"
                      aria-label={`Show ${remaining} more attachments`}
                      onClick={() => setPage((p) => p + 1)}
                      className={`flex h-24 w-24 items-center justify-center rounded-lg ${chipTone} text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current`}
                    >
                      {`+${remaining}`}
                    </button>
                  )}
                </div>
              )}
              <p className={`mt-1 flex items-center justify-end gap-1 text-xs tabular-nums ${metaTone}`}>
                <time dateTime={msg.createdAt} title={msg.createdAt ? new Date(msg.createdAt).toLocaleString() : undefined}>{clock(msg.createdAt)}</time>
                {own && (seen
                  ? <CheckCheck className="h-4 w-4" aria-label="Seen" role="img" />
                  : <Check className="h-4 w-4" aria-label="Sent" role="img" />)}
              </p>
            </>
          )}
        </div>
        {!msg.deleted && <ReactionChips reactions={msg.reactions} userId={user?.id} own={own} onToggle={onToggleReaction} />}
        </div>
        {!msg.deleted && (
          <div
            role="toolbar"
            aria-label="Message actions"
            className={`absolute -top-6 z-10 flex items-center rounded-lg border border-border bg-raised p-0.5 text-text-muted shadow-elevated transition-opacity focus-within:pointer-events-auto focus-within:opacity-100 ${own ? 'left-2' : 'right-2'} ${barVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-100'}`}
          >
            <ReactionPicker reactions={msg.reactions} userId={user?.id} own={own} onToggle={onToggleReaction} onOpenChange={setPickerOpen} />
            {own && (
              <button
                type="button"
                aria-label="Delete message"
                onClick={onDelete}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md hover:bg-danger-soft hover:text-danger focus-visible:outline-2 focus-visible:outline-focus-ring"
              >
                <Delete className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
