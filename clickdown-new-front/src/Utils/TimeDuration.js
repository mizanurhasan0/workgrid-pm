const INTERVALS = [
  { unit: 'y', ms: 31557600000 },
  { unit: 'mos', ms: 2629800000 },
  { unit: 'd', ms: 86400000 },
  { unit: 'h', ms: 3600000 },
  { unit: 'm', ms: 60000 },
  { unit: 's', ms: 1000 },
];

/**
 * Time elapsed since startTime, for example "2m" or "3h". Less than a second, a future
 * date or a missing or invalid value gives '0s' (missing or invalid gives '').
 * @param {string|number|Date} startTime Start time.
 * @returns {string}
 */
export default function TimeDuration(startTime) {
  if (!startTime) {return '';}
  const start = new Date(startTime).getTime();
  if (Number.isNaN(start)) {return '';}
  const diff = Date.now() - start;
  const match = INTERVALS.find((interval) => diff >= interval.ms);
  return match ? `${Math.floor(diff / match.ms)}${match.unit}` : '0s';
}
