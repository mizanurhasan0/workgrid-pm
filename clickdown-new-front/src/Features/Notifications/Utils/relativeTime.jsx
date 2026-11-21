import React from 'react';
import LogDateFormate from '../../../Utils/LogDateFormate';

const UNITS = [
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

/**
 * Short relative label such as "5 min ago". Falls back to the absolute date after a week.
 * @param {string|number|Date} value Date value.
 * @param {number} now Current time in ms (injectable for tests).
 * @returns {string}
 */
export function relativeLabel(value, now = Date.now()) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {return '';}
  const seconds = Math.round((now - date.getTime()) / 1000);
  if (seconds < 45) {return 'Just now';}
  if (seconds > 7 * 86400) {return LogDateFormate({ dateString: value, activeTime: true });}
  const [unit, size] = UNITS.find(([, s]) => seconds >= s) || ['minute', 60];
  const n = Math.max(1, Math.round(seconds / size));
  const short = unit === 'minute' ? 'min' : unit === 'hour' ? 'hr' : 'day';
  return `${n} ${short}${unit === 'day' && n > 1 ? 's' : ''} ago`;
}

/**
 * Time element with a relative label and the exact date as title.
 */
export default function RelativeTime({ value, className = '' }) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) {return null;}
  return (
    <time dateTime={date.toISOString()} title={LogDateFormate({ dateString: value })} className={className}>
      {relativeLabel(value)}
    </time>
  );
}
