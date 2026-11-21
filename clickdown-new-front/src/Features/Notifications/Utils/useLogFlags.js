import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import req from '../../../Utils/req';
import AlertToster from '../../../Components/AlertToster';
import { setNotify } from '../../../Reducers/notifyReducer';

// localStorage only holds flags the server could not be told about (offline), or that an older
// version of the app kept there. They are sent to the server (POST notification/import) and removed.
const storeKey = (kind, userId) => `notify:${kind}:${userId || 'anon'}`;

const readStore = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    return [];
  }
};
const writeStore = (key, ids) => {
  try {
    if (ids.length === 0) {localStorage.removeItem(key);} else {localStorage.setItem(key, JSON.stringify(ids.slice(-500)));}
  } catch {
    // Storage can be blocked; the flags then only live for this visit.
  }
};

const idOf = (log) => log?.id || log?._id;
// A request with no response means the network is down; anything else is a server decision.
const isOffline = (e) => !e?.response;

/**
 * Read and archived state of the signed-in user's notifications.
 * The state lives on the server: every notification from `GET task/notify/:userId` carries `read` and
 * `archived`, changes go through `PATCH notification/...`, and the unread badge comes from
 * `GET notification/unread-count`. The Redux log list is updated optimistically and rolled back on errors.
 * @param {string} userId Signed-in user id.
 * @returns {{isRead: function, isArchived: function, markRead: function, markAllRead: function, archive: function, unarchive: function, unreadCount: number}}
 */
export default function useLogFlags(userId) {
  const dispatch = useDispatch();
  const logs = useSelector((state) => state.notifyStore.notify.logs);
  const logsRef = useRef(logs);
  const readKey = storeKey('read', userId);
  const archKey = storeKey('archived', userId);
  // Flags saved on this device only (offline) and not yet known to the server.
  const [pending, setPending] = useState(() => ({ read: new Set(readStore(readKey)), archived: new Set(readStore(archKey)) }));
  const [serverCount, setServerCount] = useState(null);

  useEffect(() => { logsRef.current = logs; }, [logs]);

  const byId = useMemo(() => new Map((logs || []).map((l) => [idOf(l), l])), [logs]);

  const refreshCount = useCallback(() => {
    if (!userId) {return Promise.resolve();}
    return req({ uri: 'notification/unread-count' })
      .then(({ data }) => setServerCount(Number.isInteger(data?.count) ? data.count : null))
      .catch(() => {});
  }, [userId]);

  const patchLogs = useCallback((ids, patch) => {
    const set = new Set(ids);
    dispatch(setNotify((logsRef.current || []).map((l) => (set.has(idOf(l)) ? { ...l, ...patch } : l))));
  }, [dispatch]);

  const remember = useCallback((kind, id, on) => {
    setPending((prev) => {
      const next = { ...prev, [kind]: new Set(prev[kind]) };
      if (on) {next[kind].add(id);} else {next[kind].delete(id);}
      writeStore(storeKey(kind, userId), [...next[kind]]);
      return next;
    });
  }, [userId]);

  // Sends flags kept in localStorage to the server once, then forgets them.
  useEffect(() => {
    if (!userId) {return;}
    const read = readStore(readKey);
    const archived = readStore(archKey);
    if (read.length === 0 && archived.length === 0) {return;}
    req({ method: 'POST', uri: 'notification/import', data: { read, archived } })
      .then(() => {
        writeStore(readKey, []);
        writeStore(archKey, []);
        setPending({ read: new Set(), archived: new Set() });
        patchLogs(read, { read: true });
        patchLogs(archived, { read: true, archived: true });
        return refreshCount();
      })
      .catch(() => {});
  }, [userId, readKey, archKey, patchLogs, refreshCount]);

  // The badge is refreshed on mount and whenever the list grows (a new notification arrived).
  const total = (logs || []).length;
  useEffect(() => {
    refreshCount();
  }, [refreshCount, total]);

  /** Runs one change: optimistic update first, rollback on a server error, kept locally when offline. */
  const change = useCallback(({
    ids, patch, undo, request, kind, on,
  }) => {
    patchLogs(ids, patch);
    return request()
      .then(() => {
        ids.forEach((id) => {
          if (kind) {remember(kind, id, false);}
        });
        return refreshCount();
      })
      .catch((e) => {
        if (isOffline(e)) {
          ids.forEach((id) => remember(kind, id, on));
          AlertToster('You are offline. This change is kept on this device and saved when you are back online.', 'warning');
          return;
        }
        patchLogs(ids, undo);
        AlertToster(e?.serverMessage || 'Could not update the notification.', 'error');
      });
  }, [patchLogs, refreshCount, remember]);

  const isRead = useCallback((id) => !!byId.get(id)?.read || pending.read.has(id) || pending.archived.has(id), [byId, pending]);
  const isArchived = useCallback((id) => {
    if (pending.archived.has(id)) {return true;}
    return !!byId.get(id)?.archived;
  }, [byId, pending]);

  const markRead = useCallback((id) => {
    if (!id || byId.get(id)?.read) {return undefined;}
    return change({
      ids: [id], patch: { read: true }, undo: { read: false }, kind: 'read', on: true, request: () => req({ method: 'PATCH', uri: `notification/${id}/read`, data: {} }),
    });
  }, [byId, change]);

  const markAllRead = useCallback(() => {
    const ids = (logsRef.current || []).filter((l) => !l.read && !l.archived).map(idOf).filter(Boolean);
    patchLogs(ids, { read: true });
    return req({ method: 'PATCH', uri: 'notification/read-all', data: {} })
      .then(refreshCount)
      .catch((e) => {
        patchLogs(ids, { read: false });
        AlertToster(isOffline(e) ? 'You are offline. Try again when you are back online.' : (e?.serverMessage || 'Could not mark notifications as read.'), 'error');
      });
  }, [patchLogs, refreshCount]);

  const archive = useCallback((id) => {
    if (!id) {return undefined;}
    const before = { read: !!byId.get(id)?.read, archived: false };
    return change({
      ids: [id], patch: { read: true, archived: true }, undo: before, kind: 'archived', on: true, request: () => req({ method: 'PATCH', uri: `notification/${id}/archive`, data: {} }),
    });
  }, [byId, change]);

  const unarchive = useCallback((id) => {
    if (!id) {return undefined;}
    return change({
      ids: [id], patch: { archived: false }, undo: { archived: true }, kind: 'archived', on: false, request: () => req({ method: 'PATCH', uri: `notification/${id}/restore`, data: {} }),
    });
  }, [change]);

  // Until the server answers, count from the loaded list.
  const unreadCount = serverCount ?? (logs || []).filter((l) => !isRead(idOf(l)) && !isArchived(idOf(l))).length;

  return useMemo(() => ({
    isRead, isArchived, markRead, markAllRead, archive, unarchive, unreadCount,
  }), [isRead, isArchived, markRead, markAllRead, archive, unarchive, unreadCount]);
}
