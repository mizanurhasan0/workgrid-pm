import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import Image from '../../../../Components/Image';
import { RightArrow } from '../../../../assets';
import ActionDetails from '../Notification/AllNotification/ActionDetails';
import RelativeTime from '../../Utils/relativeTime';
import { logKey } from '../../Utils/logs';

/**
 * List of notification rows shared by the All, Comment and Archived tabs.
 * Each row is selectable (shows the details panel) and can be archived or restored.
 */
export default function LogList({
  logs, flags, onSelect, mode = 'all', emptyText, emptyHint = 'New activity from your workspace will appear here.', onEnd, hasMore = false,
}) {
  const sentinel = useRef(null);
  const selected = useSelector((state) => state.notifyStore.view);

  // Infinite scroll: ask for the next page when the end marker becomes visible.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore || !onEnd || typeof IntersectionObserver === 'undefined') {return undefined;}
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {onEnd();}
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, onEnd, logs.length]);

  if (logs.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <p className="text-base font-medium text-text">{emptyText}</p>
        <p className="text-sm text-text-muted">{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="list-none space-y-3 p-4 sm:p-6">
      {logs.map((log, index) => {
        const id = log?.id || log?._id;
        const unread = mode !== 'archive' && !flags.isRead(id);
        const title = mode === 'comment'
          ? `${log?.user?.name || 'Someone'} commented on ${log?.task?.name || ''}`
          : `${log?.user?.name || 'Someone'} has ${log?.action}d ${log?.task?.name || ''}`;
        const isSelected = selected?.id && selected.id === log?.task?.id;
        return (
          <li
            key={logKey(log, index)}
            className={`rounded-lg border p-4 ${isSelected ? 'border-brand-solid ring-1 ring-brand-solid/40' : 'border-border hover:border-border-strong'} ${unread ? 'bg-surface-raised' : 'bg-surface-alt'} text-text shadow-card transition-colors`}
          >
            <div className="flex items-start gap-3">
              <Image src={log?.user?.avatar} alt="" className="h-8 w-8 shrink-0 rounded-full object-cover" />
              <button
                type="button"
                onClick={() => { onSelect(log); flags.markRead(id); }}
                className="min-h-11 min-w-0 flex-1 rounded text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring"
              >
                <span className="flex items-start gap-2">
                  {unread ? <span className="h-2 w-2 shrink-0 rounded-full bg-brand-solid ring-4 ring-brand-solid/20 mt-[0.4rem]" aria-hidden="true" /> : null}
                  <span className={`line-clamp-2 break-words text-sm text-text ${unread ? 'font-semibold' : 'font-medium'}`}>{title}</span>
                  {unread ? <span className="sr-only">Unread</span> : null}
                </span>
                <span className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-text-muted">
                  <RelativeTime value={log?.updatedAt} />
                  {log?.task?.project?.name ? (
                    <>
                      <span className="max-w-40 truncate">{log.task.project.name}</span>
                      <RightArrow className="h-3 w-3 shrink-0" aria-hidden="true" />
                    </>
                  ) : null}
                  <span className="truncate max-w-40">{log?.task?.name}</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => (mode === 'archive' ? flags.unarchive(id) : flags.archive(id))}
                className="min-h-11 shrink-0 rounded px-3 text-xs font-medium text-brand hover:bg-brand-solid/10 focus-visible:outline-2 focus-visible:outline-focus-ring"
                aria-label={`${mode === 'archive' ? 'Restore' : 'Archive'} notification: ${title}`}
              >
                {mode === 'archive' ? 'Restore' : 'Archive'}
              </button>
            </div>
            <hr className="my-3 border-border" />
            <div className="min-w-0 break-words">
              <ActionDetails log={mode === 'comment' && log?.comment ? { ...log, typeField: 'comment' } : log} />
            </div>
          </li>
        );
      })}
      {hasMore ? <li ref={sentinel} aria-hidden="true" className="h-8 py-2 text-center text-xs text-text-muted" role="status">Loading more...</li> : null}
    </ul>
  );
}
