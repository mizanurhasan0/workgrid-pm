import React, { useEffect, useMemo, useRef, useState } from 'react';

// A handful of quick reactions; the server accepts any single emoji.
export const REACTION_CHOICES = [
  { emoji: '👍', label: 'thumbs up' },
  { emoji: '❤️', label: 'heart' },
  { emoji: '😂', label: 'laughing' },
  { emoji: '🎉', label: 'celebration' },
  { emoji: '😮', label: 'surprised' },
  { emoji: '🙏', label: 'thanks' },
];

/**
 * Groups reaction documents ({ id, emoji, user }) by emoji, keeping first-seen order.
 * Reactions stored before the server recorded who reacted have no user: they count but are never "mine".
 * @param {Array} reactions Reactions of a message (unpopulated ids are ignored).
 * @param {string} [userId] Signed-in user id.
 * @returns {Array<{emoji: string, count: number, mine: boolean}>}
 */
export function summarizeReactions(reactions = [], userId) {
  const groups = new Map();
  reactions.filter((r) => r && typeof r === 'object' && r.emoji).forEach((r) => {
    const group = groups.get(r.emoji) ?? { emoji: r.emoji, count: 0, mine: false };
    group.count += 1;
    if (userId && r.user === userId) {group.mine = true;}
    groups.set(r.emoji, group);
  });
  return [...groups.values()];
}

/**
 * Reaction chips shown under a bubble. Each chip toggles the signed-in user's reaction.
 */
export function ReactionChips({ reactions, userId, own, onToggle }) {
  const chips = useMemo(() => summarizeReactions(reactions, userId), [reactions, userId]);
  if (chips.length === 0) {return null;}
  return (
    <ul className={`m-0 mt-1 flex list-none flex-wrap gap-1 p-0 ${own ? 'justify-end' : 'justify-start'}`} aria-label="Reactions">
      {chips.map(({ emoji, count, mine }) => (
        <li key={emoji} className="list-none">
          <button
            type="button"
            aria-pressed={mine}
            aria-label={`${emoji} ${count} ${count === 1 ? 'reaction' : 'reactions'}${mine ? ', including yours. Remove your reaction' : '. Add your reaction'}`}
            onClick={() => onToggle(emoji, mine)}
            className={`flex min-h-9 items-center gap-1 rounded-full border px-2.5 text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring sm:min-h-7 ${mine
              ? 'border-brand bg-brand-solid/10 font-semibold text-brand'
              : 'border-border bg-card text-text hover:bg-brand-solid/10'}`}
          >
            <span aria-hidden="true">{emoji}</span>
            <span aria-hidden="true">{count}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Small emoji picker opened from a "React" button. Closes on Escape, outside click or after a choice.
 */
export function ReactionPicker({
  reactions, userId, own, onToggle, onOpenChange,
}) {
  const [open, setOpen] = useState(false);
  useEffect(() => { onOpenChange?.(open); }, [open, onOpenChange]);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const mine = useMemo(() => new Set(summarizeReactions(reactions, userId).filter((c) => c.mine).map((c) => c.emoji)), [reactions, userId]);

  useEffect(() => {
    if (!open) {return undefined;}
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {setOpen(false);}
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // No "relative" on the wrapper: the popover is positioned against the message row so it stays on screen on phones.
  return (
    <div ref={rootRef} className="shrink-0">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Add reaction"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 w-9 items-center justify-center rounded-md text-lg hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring ${open ? 'bg-text/10' : ''}`}
      >
        <span aria-hidden="true">☺</span>
      </button>
      {open && (
        <div
          role="group"
          aria-label="Choose a reaction"
          className={`absolute bottom-full z-popover mb-1 flex gap-1 rounded-xl border border-border bg-raised p-1 shadow-elevated ${own ? 'left-0' : 'right-0'}`}
        >
          {REACTION_CHOICES.map(({ emoji, label }) => (
            <button
              key={emoji}
              type="button"
              aria-pressed={mine.has(emoji)}
              aria-label={`${mine.has(emoji) ? 'Remove' : 'React with'} ${label} ${emoji}`}
              onClick={() => {
                onToggle(emoji, mine.has(emoji));
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-lg text-xl focus-visible:outline-2 focus-visible:outline-focus-ring sm:h-9 sm:w-9 ${mine.has(emoji) ? 'bg-brand-solid/15' : 'hover:bg-text/10'}`}
            >
              <span aria-hidden="true">{emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
