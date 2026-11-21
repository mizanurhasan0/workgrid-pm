import { fail, sendFailure } from '../../utils/httpError';
import Chat from './chat.schema';
import Project from '../project/project.schema';
import User from '../user/user.schema';
import { imageUp, removeUpload } from '../../controllers/imageUp';
import fs from 'fs';
import path from 'path';
import makeCombined from '@dreygur/messenger-group-avatar';

const createAllowed = new Set(['name', 'icon', 'members', 'pinnedChats', 'action', 'actionMembers']);
const allowedQuery = new Set(['members', 'visibility', 'paginate', 'page', 'remove']);
const populated = {
  path: 'creator members lastMessage',
  select: 'name avatar company author message reactions chat type created updatedAt attachments read_by',
  strictPopulate: false,
};

const getIconAndName = async ({ req, db, leave = false, imgLink = null }) => {
  let userList;
  const members = req.body.members || [];
  if (!req.body.name || !req.files?.icon) {
    userList = await db.find({ table: User, key: { query: { id: [...members, !leave ? req.user.id : null].filter(Boolean) }, allowedQuery: new Set(['id']), paginate: false } });
  }
  if (!req.body.name && (userList.length > 2)) {
    let groupName = [];
    userList.forEach((u) => (u.id !== req.user.id) && groupName.push(u.name));
    req.body.name = groupName.toString();
  }
  if (req.files?.icon) {
    req.body.icon = await imageUp(req.files.icon.path);
    imgLink && await removeUpload(imgLink);
  }
  if (!req.files?.icon && (userList.length > 2) && imgLink === null) {
    let imagePath = [];
    for (let i in userList) {
      if (!fs.existsSync(process.cwd() + '/' + userList[i].avatar)) userList[i].avatar = process.env.DEFAULT_IMAGE;
      imagePath.push(userList[i].avatar);
    }
    const combinedImage = await makeCombined(...imagePath);
    let imgName = (combinedImage.split('/'))[combinedImage.split('/').length - 1];
    fs.renameSync(combinedImage, path.resolve('images', imgName));
    req.body.icon = 'images/' + imgName;
  }
};
export const create = ({ db, ws }) => async (req, res) => {
  try {
    req.body = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return fail(res, 400, 'Bad request');
    await getIconAndName({ req, db });
    const chat = await db.create({ table: Chat, key: { ...req.body, creator: req.user.id, members: [...new Set([...(req.body.members || []), req.user.id])], populate: { path: 'creator members' } } });
    chat.members.forEach((m) => ws.to(m.id).emit('createChat', chat));
    return res.status(200).send(chat);
  }
  catch (e) {
    console.log(e);
    sendFailure(res, e);
  }
};
export const updateChat = ({ ws, db }) => async (req, res) => {
  try {
    req.body = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body;
    const { actionMembers = [], action } = req.body;
    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return fail(res, 405, 'not allowed');
    const project = await db.findOne({ table: Project, key: { chat: req.params.id } });
    if (!project) {
      const chat = await db.findOne({ table: Chat, key: { id: req.params.id } });
      if (!chat) return fail(res, 404, 'Chat not found');
      // Icon Handler
      await getIconAndName({ req, db, imgLink: chat.icon });

      Object.keys(req.body).forEach(k => (chat[k] = req.body[k]));
      await db.save(chat);
      const updateChat = await db.findOne({ table: Chat, key: { id: req?.params?.id, populate: populated } });
      // filter remove user id
      actionMembers.forEach((m) => action === 'remove' ? ws.to(String(m)).emit('deleteChat', updateChat) : ws.to(String(m)).emit('createChat', updateChat));
      (req.body.members || []).forEach((m) => ws.to(String(m)).emit('chatUpdate', updateChat));
      return res.status(200).send(updateChat);
    }
    return res.status(200).send({ error: 'Its connected with project!' });
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};
// export const leave = ({ ws, db }) => async (req, res) => {
//   try {
//     req.body.icon = '';
//     if (!req.params.id) return fail(res, 400, 'bad request');
//     const chat = await db.findOne({ table: Chat, key: { id: req.params.id } });
//     if (!chat) return fail(res, 404, 'Chat not found');
//     await getIconAndName({ req, db, leave: true });

//     const activeUser = chat.members.filter((m) => req.body.members.includes(m.toString()));

//     Object.keys(req.body).forEach(k => (chat[k] = req.body[k]));
//     await db.save(chat);
//     const leaveChat = await db.findOne({ table: Chat, key: { id: req?.params?.id, populate: { path: 'creator members' } } });
//     activeUser.forEach((m) => ws.to(m.toString()).emit('chatUpdate', leaveChat));
//     ws.to(req.user.id).emit('deleteChat', leaveChat);
//     return res.status(200).send(leaveChat);
//   }
//   catch (e) {
//     console.log(e);
//     return sendFailure(res, e);
//   }
// };
export const get = ({ db }) => async (req, res) => {
  try {
    const chats = await db.find({
      table: Chat, key: {
        query: { ...req.query, members: { $in: [req?.user?.id] }, remove: false },
        allowedQuery,
        populate: populated,
        paginate: 'true',
      }
    });
    return res.status(200).send(chats);
  }
  catch (e) {
    console.log(e);
    sendFailure(res, e);
  }
};

export const getOne = ({ db, ws }) => async (req, res) => {
  try {
    const chat = await db.findOne({ table: Chat, key: { id: req?.params?.id, populate: { path: 'creator members' } } });
    if (chat) chat.call.onair = ws.sockets.adapter.rooms.has(chat?.id + 'Call');
    return res.status(chat ? 200 : 404).send(chat || 'Not found');
  }
  catch (e) {
    console.log(e);
    sendFailure(res, e);
  }
};

export const remove = ({ db, ws }) => async (req, res) => {
  try {
    if (!req.params?.id) return fail(res, 404, 'Param id not found');
    const project = await db.findOne({ table: Project, key: { chat: req.params.id } });
    if (!project) {
      const deleteChat = await db.findOne({ table: Chat, key: { id: req.params.id } });
      if (!deleteChat) return fail(res, 404, 'Chat not found');
      if (!deleteChat.members.some((m) => m.toString() === req.user.id)) return fail(res, 401, 'Unauthorized');
      deleteChat.remove = true;
      await db.save(deleteChat);
      deleteChat.members.forEach((m) => m.toString() !== req.user.id && ws.to(m.toString()).emit('deleteChat', deleteChat));
      return res.status(200).send('chat Deleted');
    } else return res.status(200).send({ error: 'Its connected with project!' });

  }
  catch (err) {
    console.log(err);
    return sendFailure(res, err);
  }
};

export const entry = async ({ data, session, ws, db }) => {
  try {
    if (!data.method || (data.method && !['join', 'leave'].includes(data.method))) return session.emit('error', { message: 'bad method' });
    let chat;
    try {
      chat = await db.findOne({ table: Chat, key: { id: data.chat, populate: { path: 'creator members' } } });
    } catch (e) { console.log('Entry', e); }
    const ctMembers = [];
    chat && chat.members.forEach((m) => ctMembers.push(m._id.toString()));
    if (!chat || !ctMembers.includes(session.user.id)) return session.emit('error', { message: 'Unauthorized' });
    const room = chat?.id + (data.call ? 'Call' : '');
    const event = `${data.method}${data.call ? 'Call' : 'Chat'}`;
    session[data.method](room);
    ws.to(room).emit(event, session.user);

    session.on('disconnect', async () => {
      try {
        const check = await db.findOne({ table: Chat, key: { id: chat.id } });
        if (check) {
          ws.to(room).emit(`leave${data.call ? 'Call' : 'Chat'}`, session.user);
          if (!ws.sockets.adapter.rooms.has(chat.id + 'Call') || ws.sockets.adapter.rooms.get(chat.id + 'Call')?.size < 2) {
            chat.call = {
              onair: false,
              mode: null,
            };
            await db.save(chat);
            chat.members.forEach(m => {
              if (m.toString() !== session.user.id) {
                ws.to(m.toString()).emit('endCall', { user: session.user, chatId: chat.id });
                ws.to(m.toString()).emit('closeNotification', { user: session.user, chatId: chat.id });
              }
            });
            ws.to(chat.id).emit('chatUpdate', chat);
          }
        }
      }
      catch (e) { console.log(e); }
    });

  }
  catch (e) {
    console.log(e);
  }
};

export const call = async ({ data: { chatId, mode }, session, ws, db }) => {
  try {
    if (!chatId) return session.emit('error', { message: 'No chat id found' });
    if (ws.sockets.adapter.rooms.has(chatId + 'Call')) return session.emit('error', { message: 'Already called' });
    const chat = await db.findOne({ table: Chat, key: { id: chatId } });
    if (!chat || !chat.members.map(m => m.toString()).includes(session.user.id)) return session.emit('error', { message: 'bad payload' });
    chat.call = {
      onair: true,
      mode,
    };
    await db.save(chat);
    ws.to(chat.id).emit('chatUpdate', chat);
    chat.members.forEach(m => {
      if (m.toString() !== session.user.id) {
        ws.to(m.toString()).emit('incomingCall', { user: session.user, chatId: chat.id, mode });
      }
    });
  }
  catch (e) {
    console.log(e);
  }
};

export const callMediaUpdate = async ({ data: { chatId, media }, session, ws }) => {
  try {
    if (!chatId) return session.emit('error', { message: 'No chat id found' });
    ws.to(chatId + 'Call').emit('callMediaUpdate', { userId: session.user.id, media });
  }
  catch (e) {
    console.log(e);
  }
};
export const PinChat = ({ db }) => async (req, res) => {
  try {
    const { action } = req.body;
    if (!action) return fail(res, 400, 'action is required');
    const user = await db.findOne({ table: User, key: { id: req.user.id } });
    if (!user) return fail(res, 404, 'user not found');

    if (action.toLowerCase() === 'pin') {
      user.pinnedChats = [...new Set([req.params.id, ...user.pinnedChats.map((c) => c.toString())])];
    } else {
      user.pinnedChats = user.pinnedChats.filter((c) => c.toString() !== req.params.id);
    }
    await db.save(user);
    const chat = await db.findOne({ table: Chat, key: { id: req.params.id, populate: { path: 'creator members' } } });
    return res.status(200).send({ chat, action });
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};