/** Legacy (misspelled) priority values and their correct spelling. Both are accepted on input. */
export const PRIORITY_ALIASES = { Immidate: 'Immediate', Tomorow: 'Tomorrow' };

/** Returns the correctly spelled priority; any other value is returned unchanged. */
export const normalizePriority = (value) => (typeof value === 'string' && Object.hasOwn(PRIORITY_ALIASES, value) ? PRIORITY_ALIASES[value] : value);

/** Normalises `priority` on a request body in place. */
export const normalizeBodyPriority = (body) => {
  if (body && typeof body === 'object' && 'priority' in body) body.priority = normalizePriority(body.priority);
  return body;
};
