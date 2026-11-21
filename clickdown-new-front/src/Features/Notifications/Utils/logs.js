/**
 * Builds the task shown in the details pane from a notification log.
 * Assignees are replaced by the matching member objects so the pane can show avatars and names.
 * @param {Object} log A notification log with task, members and user.
 * @returns {Object|null} The task view, or null when the log has no task.
 */
export function toTaskView(log) {
  const task = log?.task;
  if (!task) {return null;}
  const members = log.members || [];
  const assigneeIds = task.assignee || [];
  return { ...task, assignee: members.filter((m) => assigneeIds.includes(m.id)) };
}

/** Stable React key for a log: its id when present, the position otherwise. */
export const logKey = (log, index) => log?.id || log?._id || `log-${index}`;

const timeOf = (log) => {
  const t = Date.parse(log?.createdAt);
  return Number.isNaN(t) ? 0 : t;
};

/**
 * Removes duplicate logs (same id), keeping the first occurrence. Logs without an id are kept.
 * The result is ordered newest first, so logs merged in from other requests land in the right place.
 */
export function uniqueLogs(logs = []) {
  const seen = new Set();
  const list = logs.filter((log) => {
    const id = log?.id || log?._id;
    if (!id) {return true;}
    if (seen.has(id)) {return false;}
    seen.add(id);
    return true;
  });
  return list.every((l) => timeOf(l) > 0) ? [...list].sort((a, b) => timeOf(b) - timeOf(a)) : list;
}
