// Shared helpers for the task table. Values are stored on tasks, so `name` must not change.
// `label` is the text shown to users.
export const priorityOptions = [
  { name: 'Normal', label: 'Normal', class: 'fill-transparent stroke-[#64748B]' },
  { name: 'Immediate', aliases: ['Immidate'], label: 'Immediate', class: 'fill-[#6239ED] stroke-[#6239ED]' },
  { name: 'Tomorrow', aliases: ['Tomorow'], label: 'Tomorrow', class: 'fill-[#FE7317] stroke-[#FE7317]' },
  { name: 'Usual', label: 'Usual', class: 'fill-[#22C55E] stroke-[#22C55E]' },
  { name: 'Urgent', label: 'Urgent', class: 'fill-[#DC2626] stroke-[#DC2626]' },
];

// Data created before the spelling fix still stores 'Immidate' / 'Tomorow'. Both spellings map to the same option.
export const findPriorityStrict = (value) => priorityOptions.find((p) => p.name === value || p.aliases?.includes(value)) ?? null;

export const findPriority = (value) => findPriorityStrict(value) ?? priorityOptions[0];

// Canonical stored name for any known spelling, so sorting and filtering treat both alike
export const canonicalPriority = (value) => findPriorityStrict(value)?.name ?? value;

// Maps a view's bundle type to the task collection name used by the API
export const taskTypeFor = (bundleInfo) => {
  if (bundleInfo?.type === 'sprint') {return 'sprints';}
  if (bundleInfo?.type === 'bug') {return 'bugs';}
  if (bundleInfo?.type === 'backlog') {return 'tasks';}
  return null;
};

// Estimates may only use the h (hours), d (days) and m (minutes) units, e.g. 1h30m
export const isValidEstimate = (value) => [...value.replace(/[^a-zA-Z]/g, '').toLowerCase()]
  .every((c) => 'hdm'.includes(c));

// Chip colours for priority values. Light tints with dark text and dark tints with light text keep AA contrast.
export const priorityChipClass = {
  Normal: 'bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300',
  Immediate: 'bg-violet-100 text-violet-800 dark:bg-violet-400/15 dark:text-violet-300',
  Tomorrow: 'bg-orange-100 text-orange-900 dark:bg-orange-400/15 dark:text-orange-300',
  Usual: 'bg-green-100 text-green-900 dark:bg-green-400/15 dark:text-green-300',
  Urgent: 'bg-red-100 text-red-800 dark:bg-red-400/15 dark:text-red-300',
};
// Legacy spellings share the chip colours of the corrected names
priorityChipClass.Immidate = priorityChipClass.Immediate;
priorityChipClass.Tomorow = priorityChipClass.Tomorrow;

// Shared table geometry. Header, rows and the create row use the same classes so columns line up.
// Below the @3xl container width a row becomes a card, so widths only apply from @3xl up.
export const cell = {
  lead: '@3xl:-order-2 @3xl:flex-1 @3xl:basis-80 @3xl:min-w-80',
  assignee: '@3xl:w-24 @3xl:shrink-0',
  due: '@3xl:w-24 @3xl:shrink-0',
  estimate: '@3xl:w-24 @3xl:shrink-0',
  elapsed: '@3xl:w-24 @3xl:shrink-0',
  priority: '@3xl:w-32 @3xl:shrink-0',
  custom: '@3xl:w-32 @3xl:shrink-0',
};

// Text used for empty cells so the table stays calm when values are missing
export const emptyCellClass = 'text-text-muted/70';

// ---- dates ---------------------------------------------------------------
// Calendar days are stored as instants. Picking a day saves local noon so every timezone within
// 12 hours of the picker shows the same day. Older data may sit at exactly 00:00 UTC, which we
// read as that UTC calendar day rather than the previous evening in western timezones.
export function toDay(value) {
  if (!value) {return null;}
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {return null;}
  const atUtcMidnight = date.getUTCHours() === 0 && date.getUTCMinutes() === 0
    && date.getUTCSeconds() === 0 && date.getUTCMilliseconds() === 0;
  return atUtcMidnight
    ? new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    : new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Date to send to the API for a picked calendar day
export const noonOf = (day) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12);

export const dayKey = (day) => (day ? day.getFullYear() * 10000 + day.getMonth() * 100 + day.getDate() : null);

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "24 Nov", or "" when there is no date
export function shortDateText(value) {
  const day = toDay(value);
  return day ? `${day.getDate()} ${SHORT_MONTHS[day.getMonth()]}` : '';
}

export const fullDateText = (value) => {
  const day = toDay(value);
  return day ? day.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '';
};

// ---- estimates -----------------------------------------------------------
const ESTIMATE_RE = /^(?:(\d+)\s*d)?\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?$/i;

// "2h30m", "1d", "1d 4h" -> canonical "2h30m" style text, or null when invalid
export function parseEstimate(input) {
  const value = String(input ?? '').trim().replace(/\s+/g, '');
  if (!value) {return null;}
  const match = ESTIMATE_RE.exec(value);
  if (!match || (!match[1] && !match[2] && !match[3])) {return null;}
  return [
    match[1] && `${Number(match[1])}d`,
    match[2] && `${Number(match[2])}h`,
    match[3] && `${Number(match[3])}m`,
  ].filter(Boolean).join('');
}
