import { isValidObjectId } from 'mongoose';
import Notifications from './notify.schema';
import NotificationState from './notifyState.schema';
import { fail, sendFailure, HttpError } from '../../utils/httpError';

const MAX_IMPORT_IDS = 1000;

/** Ids of the user's notifications that are read or archived (i.e. not unread). */
const seenIds = (userId) => NotificationState.find({ user: userId, $or: [{ read: true }, { archived: true }] }).distinct('notification');

/** Ids of the user's archived notifications. */
export const archivedIds = (userId) => NotificationState.find({ user: userId, archived: true }).distinct('notification');

/**
 * Adds `read` and `archived` (for the given user) to every notification of a list response.
 * @param {string} userId Current user.
 * @param {Array} docs Notification documents.
 * @returns {Promise<Array>} Plain objects with the flags.
 */
export const withStates = async (userId, docs = []) => {
  const states = await NotificationState.find({ user: userId, notification: { $in: docs.map((d) => d._id ?? d.id) } }).lean();
  const byId = new Map(states.map((s) => [String(s.notification), s]));
  return docs.map((doc) => {
    const plain = JSON.parse(JSON.stringify(doc));
    const state = byId.get(String(doc._id ?? doc.id));
    return { ...plain, read: !!state?.read, archived: !!state?.archived };
  });
};

/** Loads a notification the user is a recipient of. Throws HttpError 404 / 403. */
const ownNotification = async (id, userId) => {
  if (!isValidObjectId(id)) throw new HttpError(400, 'Invalid notification id');
  const notification = await Notifications.findById(id).select('members');
  if (!notification) throw new HttpError(404, 'Notification not found');
  if (!notification.members.some((m) => m.toString() === userId)) throw new HttpError(403, 'You can only change your own notifications.');
  return notification;
};

const stateResponse = (state) => ({ id: String(state.notification), read: state.read, archived: state.archived });

const setState = (userId, notificationId, set) => NotificationState.findOneAndUpdate(
  { user: userId, notification: notificationId },
  { $set: set },
  { upsert: true, returnDocument: 'after' },
);

/** GET /notification/unread-count -> { count } of notifications that are neither read nor archived. */
export const unreadCount = () => async (req, res) => {
  try {
    const count = await Notifications.countDocuments({ members: req.user._id, _id: { $nin: await seenIds(req.user._id) } });
    return res.status(200).send({ count });
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/** PATCH /notification/:id/read  { read?: boolean (default true) } -> { id, read, archived } */
export const markRead = () => async (req, res) => {
  try {
    const read = req.body?.read === undefined ? true : req.body.read;
    if (typeof read !== 'boolean') return fail(res, 400, '"read" must be a boolean');
    const notification = await ownNotification(req.params.id, req.user.id);
    const state = await setState(req.user._id, notification._id, { read, readAt: read ? new Date() : null });
    return res.status(200).send(stateResponse(state));
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/** PATCH /notification/read-all -> { updated } marks every unread notification of the user as read. */
export const markAllRead = () => async (req, res) => {
  try {
    const unread = await Notifications.find({ members: req.user._id, _id: { $nin: await seenIds(req.user._id) } }).distinct('_id');
    if (unread.length) {
      const now = new Date();
      await NotificationState.bulkWrite(unread.map((id) => ({
        updateOne: { filter: { user: req.user._id, notification: id }, update: { $set: { read: true, readAt: now } }, upsert: true },
      })));
    }
    return res.status(200).send({ updated: unread.length });
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/** PATCH /notification/:id/archive -> archives (and marks as read). */
export const archive = () => async (req, res) => {
  try {
    const notification = await ownNotification(req.params.id, req.user.id);
    const now = new Date();
    const state = await setState(req.user._id, notification._id, { archived: true, archivedAt: now, read: true, readAt: now });
    return res.status(200).send(stateResponse(state));
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/** PATCH /notification/:id/restore -> brings an archived notification back (stays read). */
export const restore = () => async (req, res) => {
  try {
    const notification = await ownNotification(req.params.id, req.user.id);
    const state = await setState(req.user._id, notification._id, { archived: false, archivedAt: null });
    return res.status(200).send(stateResponse(state));
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/**
 * POST /notification/import  { read: [ids], archived: [ids] }
 * One-time import of flags a browser kept in localStorage. Ids the user is not a recipient of are ignored.
 */
export const importStates = () => async (req, res) => {
  try {
    const clean = (list) => (Array.isArray(list) ? [...new Set(list.filter((id) => typeof id === 'string' && isValidObjectId(id)))].slice(0, MAX_IMPORT_IDS) : null);
    const readIds = clean(req.body?.read ?? []);
    const archivedList = clean(req.body?.archived ?? []);
    if (!readIds || !archivedList) return fail(res, 400, '"read" and "archived" must be arrays of notification ids');
    const all = [...new Set([...readIds, ...archivedList])];
    const own = new Set((await Notifications.find({ _id: { $in: all }, members: req.user._id }).distinct('_id')).map(String));
    const archivedSet = new Set(archivedList.filter((id) => own.has(id)));
    const ops = [...new Set([...readIds, ...archivedList])].filter((id) => own.has(id)).map((id) => {
      const set = { read: true, readAt: new Date() };
      if (archivedSet.has(id)) Object.assign(set, { archived: true, archivedAt: new Date() });
      return { updateOne: { filter: { user: req.user._id, notification: id }, update: { $set: set }, upsert: true } };
    });
    if (ops.length) await NotificationState.bulkWrite(ops);
    return res.status(200).send({ imported: ops.length });
  }
  catch (e) {
    return sendFailure(res, e);
  }
};
