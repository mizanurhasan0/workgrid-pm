import React from 'react';
import { Link } from '../../../../assets';
import CustomTruncate from '../../../../Utils/CustomTruncate';

// Only web links become anchors; anything else (javascript:, data:) is shown as text.
const isWebLink = (url) => /^https?:\/\//i.test(String(url));

export default function Links({ links = [], id, hidden = false }) {
  return (
    <ul id={id} hidden={hidden} className="max-h-72 min-h-0 overflow-y-auto">
      {links.length === 0 && <li className="py-2 text-center text-sm text-text-muted">No links.</li>}
      {links.map((link, i) => (
        <li key={`${link}-${i}`} className="flex min-h-11 items-center gap-2 rounded-lg px-2 hover:bg-text/10">
          <Link className="h-5 w-5 shrink-0 text-text-muted" />
          {isWebLink(link) ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 truncate text-sm font-medium text-brand underline focus-visible:outline-2 focus-visible:outline-focus-ring"
            >
              {CustomTruncate(link)}
            </a>
          ) : (
            <span className="min-w-0 truncate text-sm font-medium text-text-muted">{CustomTruncate(link)}</span>
          )}
        </li>
      ))}
    </ul>
  );
}
