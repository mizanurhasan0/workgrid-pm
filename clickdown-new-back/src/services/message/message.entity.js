import Message from './message.schema';
import Attachments from '../attachments/attach.schema';
import Chat from '../chat/chat.schema';
import Reaction from '../reaction/reaction.schema';
import { imageUp } from '../../controllers/imageUp';
import detectURL from '../../utils/detectURL';
import sanitizeMessage from '../../utils/sanitizeMessage';
import { fail, sendFailure, toHttpError, HttpError } from '../../utils/httpError';

const allowedQuery = new Set(['chat', 'page', 'limit', 'sort', 'query', 'read_by']);
// Reactions are returned as [{ id, emoji, name, user }] (user = id of who reacted).
const reactionPopulate = { path: 'reactions', select: 'emoji name user' };
const msgPopulate = [{ path: 'author chat attachments' }, reactionPopulate];
const MAX_REACTIONS_PER_USER = 10;
// One pictographic emoji, optionally with variation selector, skin tone or ZWJ sequence parts.
const EMOJI_PATTERN = /^\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier})*$/u;
const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'svg', 'gif', 'avif', 'webp', 'pdf'];

/**
 * Stores uploaded files and returns their stored paths. Throws HttpError(403) for unsupported types.
 */
const getimagePath = async (files) => {
  const imgNames = [];
  for (const img of files) {
    const ext = img.originalFilename.split('.').pop();
    if (!IMAGE_EXTENSIONS.includes(ext.toLowerCase())) throw new HttpError(403, 'Image format not found!');
    imgNames.push(await imageUp(img.path));
  }
  return imgNames;
};

export const get = ({ db }) => async (req, res) => {
  try {
    const messages = await db.find({ table: Message, key: { query: { ...req.query }, allowedQuery, paginate: false, populate: msgPopulate } });
    return res.status(200).send(messages || []);
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

export const getMessages = ({ db }) => async (req, res) => {
  try {
    const msgByPage = await db.find({ table: Message, key: { chat: req.params.chatId, query: { ...req.query }, sort: 'desc', allowedQuery: allowedQuery, paginate: true, populate: msgPopulate } });
    return res.status(200).send(msgByPage);
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

const createAttachment = async (db, imgArr, chatId) => {
  const imageType = ['png', 'jpg', 'jpeg', 'gif'];
  const fileType = ['pdf', 'doc', 'xlw', 'zip'];
  let attachIds = [];
  for (const img of imgArr) {
    const ext = img.split('.').pop().toString();
    let type;
    if (imageType.includes(ext)) type = 'image';
    else if (fileType.includes(ext)) type = 'file';
    const attach = await db.create({ table: Attachments, key: { location: img, chat: chatId, type: type } });
    attachIds = [...attachIds, attach.id];
  }
  return attachIds;
};

/**
 * Posts a message to a chat the user is a member of. Realtime 'message' events go to all members.
 */
export const createMsg = ({ db, ws }) => async (req, res) => {
  try {
    const chat = await db.findOne({ table: Chat, key: { id: req.body.chat } });
    if (!chat || !chat.members.some((m) => m.toString() === req.user.id)) return fail(res, 403, 'Unauthorized');

    let attach = [];
    if (req.files?.icon) {
      const imgPath = await getimagePath(req.files.icon);
      attach = await createAttachment(db, imgPath, req.body.chat);
    }
    const links = detectURL(sanitizeMessage(req.body.message));
    const message = await db.create({ table: Message, key: { author: req.user.id, message: sanitizeMessage(req.body.message), attachments: attach, chat: chat.id, type: 'string', read_by: [req.user.id], populate: msgPopulate } });
    chat.lastMessage = message.id;
    const newChat = await db.save(chat);
    const msg = JSON.parse(JSON.stringify(message));
    newChat.members.forEach((u) => ws.to(u.toString()).emit('message', { ...msg, links: links }));
    return res.status(200).send('sent message');
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/**
 * Marks the chat's unread messages as read by the user and returns the latest page.
 */
export const updateRead = ({ db }) => async (req, res) => {
  try {
    const chat = await db.findOne({ table: Chat, key: { id: req.params.chatId } });
    if (!chat || !chat.members.some((m) => m.toString() === req.user.id)) return fail(res, 403, 'unauthorized request');
    const unSeenMsg = await db.find({ table: Message, key: { query: { ...req.query, chat: chat.id, read_by: { $nin: [req.user.id] } }, allowedQuery: allowedQuery, paginate: false } });
    await Promise.all(unSeenMsg.map((msg) => {
      msg.read_by = [...msg.read_by, req.user.id];
      return db.save(msg);
    }));
    const msgByPage = await db.find({ table: Message, key: { chat: chat.id, sort: 'desc', allowedQuery: allowedQuery, paginate: true, populate: msgPopulate } });
    return res.status(200).send(msgByPage);
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/**
 * Validates and returns a single emoji. Throws HttpError(400) otherwise.
 */
const parseEmoji = (value) => {
  const emoji = typeof value === 'string' ? value.trim() : '';
  if (!emoji || emoji.length > 16 || !EMOJI_PATTERN.test(emoji)) throw new HttpError(400, 'A valid emoji is required');
  return emoji;
};

/**
 * Loads a message and checks that the user is a member of its chat. Throws HttpError 404/403/409.
 */
const loadReactableMessage = async (db, messageId, userId) => {
  const msg = await db.findOne({ table: Message, key: { id: messageId } });
  if (!msg) throw new HttpError(404, 'Message not found');
  const chat = await db.findOne({ table: Chat, key: { id: msg.chat } });
  if (!chat || !chat.members.some((m) => m.toString() === userId)) throw new HttpError(403, 'Unauthorized');
  if (msg.deleted) throw new HttpError(409, 'Message was deleted');
  return { msg, chat };
};

/**
 * Adds or removes the user's reaction on a message (idempotent) and tells every chat member
 * with a 'messageReaction' event: { id, chat, reactions }.
 * @returns {Promise<{id: string, chat: string, reactions: Array}>} The payload that was broadcast.
 */
const changeReaction = async ({ db, ws, messageId, userId, emoji, action }) => {
  const { msg, chat } = await loadReactableMessage(db, messageId, userId);
  const identity = { message: msg._id, user: userId, emoji };
  if (action === 'remove') {
    const removed = await Reaction.findOneAndDelete(identity);
    if (removed) await Message.updateOne({ _id: msg._id }, { $pull: { reactions: removed._id } });
  } else {
    const mine = await Reaction.countDocuments({ message: msg._id, user: userId });
    const exists = await Reaction.exists(identity);
    if (!exists && mine >= MAX_REACTIONS_PER_USER) throw new HttpError(400, `You can add up to ${MAX_REACTIONS_PER_USER} reactions to a message`);
    let reaction;
    try {
      reaction = await Reaction.findOneAndUpdate(identity, { $setOnInsert: {} }, { upsert: true, returnDocument: 'after' });
    } catch (e) {
      if (e?.code !== 11000) throw e;
      reaction = await Reaction.findOne(identity);
    }
    await Message.updateOne({ _id: msg._id }, { $addToSet: { reactions: reaction._id } });
  }
  const fresh = await Message.findById(msg._id).populate(reactionPopulate);
  const payload = { id: msg.id, chat: chat.id, reactions: JSON.parse(JSON.stringify(fresh.reactions)) };
  chat.members.forEach((m) => ws.to(m.toString()).emit('messageReaction', payload));
  return payload;
};

/**
 * PUT /message/:id/reaction  { emoji }  adds the current user's reaction (idempotent).
 */
export const addReaction = ({ db, ws }) => async (req, res) => {
  try {
    const emoji = parseEmoji(req.body?.emoji);
    const payload = await changeReaction({ db, ws, messageId: req.params.id, userId: req.user.id, emoji, action: 'add' });
    return res.status(200).send(payload);
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/**
 * DELETE /message/:id/reaction?emoji=...  removes the current user's reaction (idempotent).
 * The emoji may also be sent as JSON body { emoji }.
 */
export const removeReaction = ({ db, ws }) => async (req, res) => {
  try {
    const emoji = parseEmoji(req.query?.emoji ?? req.body?.emoji);
    const payload = await changeReaction({ db, ws, messageId: req.params.id, userId: req.user.id, emoji, action: 'remove' });
    return res.status(200).send(payload);
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/**
 * Socket 'messageReaction': { id, emoji, action: 'add' | 'remove' | 'toggle' (default) }.
 * Broadcasts 'messageReaction' { id, chat, reactions } to all chat members; errors go to the caller as 'error'.
 */
export async function reaction({ data, session, ws, db }) {
  try {
    const emoji = parseEmoji(data?.emoji);
    let action = data?.action ?? 'toggle';
    if (!['add', 'remove', 'toggle'].includes(action)) throw new HttpError(400, 'Invalid action');
    if (action === 'toggle') action = (await Reaction.exists({ message: data?.id, user: session.user.id, emoji })) ? 'remove' : 'add';
    await changeReaction({ db, ws, messageId: data?.id, userId: session.user.id, emoji, action });
  }
  catch (e) {
    session.emit('error', { message: toHttpError(e).message });
  }
}

/**
 * Socket 'messageUpdate': soft-deletes the author's own message. The legacy
 * `{ id, reactor: true, reactObject: { emoji } }` form adds a reaction (use 'messageReaction' instead).
 */
export async function update({ data, session, ws, db }) {
  try {
    if (data?.reactor) return reaction({ data: { id: data.id, emoji: data.reactObject?.emoji, action: 'add' }, session, ws, db });
    const msg = await db.findOne({ table: Message, key: { id: data?.id, populate: msgPopulate } });
    if (!msg) return session.emit('error', { message: 'Message id not found' });
    const chat = await db.findOne({ table: Chat, key: { id: msg.chat?.id } });
    if (!chat || !chat.members.some((m) => m.toString() === session.user.id)) return session.emit('error', { message: 'Unauthorized' });
    if (msg.author?.id !== session.user.id) return session.emit('error', { message: 'Unauthorized' });
    msg.deleted = true;
    await db.save(msg);
    const links = detectURL(msg.message);
    const updatemsg = msg.toJSON();
    updatemsg.links = links;
    chat.members.forEach((m) => m.toString() !== session.user.id && ws.to(m.toString()).emit('messageUpdate', updatemsg));
    return undefined;
  }
  catch (e) {
    console.error('messageUpdate failed:', e);
    return undefined;
  }
}

/**
 * Returns the attachments and links of all non-deleted messages in a chat.
 */
export const getAttachAndLink = ({ db }) => async (req, res) => {
  try {
    const msgs = await db.find({
      table: Message,
      key: {
        query: { ...req.query, chat: req.params.chatId, },
        allowedQuery,
        paginate: false,
        populate: { path: 'attachments' },
      }
    });
    let attachments = [];
    let links = [];
    for (const m of msgs) {
      if (!m.deleted) {
        attachments = [...attachments, ...m.attachments];
        links = [...links, ...detectURL(m.message)];
      }
    }
    return res.status(200).send({ attachments, links });
  }
  catch (e) {
    return sendFailure(res, e);
  }
};
