import Attachments from './attach.schema';
import { imageUp } from '../../controllers/imageUp';
import Chat from '../chat/chat.schema';
import { fail, sendFailure } from '../../utils/httpError';

const allowedQuery = new Set(['location', 'type', 'chat']);

export const get = ({ db }) => async (req, res) => {
  try {
    const attachments = await db.find({ table: Attachments, key: { query: { ...req.query }, allowedQuery, paginate: false } });
    return res.status(200).send(attachments || []);
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/**
 * Stores uploaded files (form field "icon" or "file") and returns their stored paths.
 * Optional `chat` field: the caller must be a member of that chat.
 */
export const createAttach = ({ db }) => async (req, res) => {
  try {
    // When the upload is meant for a chat (`chat` form field) only that chat's members may upload.
    if (req.body?.chat) {
      const chat = await db.findOne({ table: Chat, key: { id: req.body.chat } });
      if (!chat || !chat.members.some((m) => m.toString() === req.user.id)) return fail(res, 403, 'Unauthorized');
    }
    const uploaded = req.files?.icon ?? req.files?.file;
    const list = uploaded ? (Array.isArray(uploaded) ? uploaded : [uploaded]) : [];
    if (list.length === 0) return fail(res, 400, 'No file uploaded');
    const names = [];
    for (const file of list) names.push(await imageUp(file.path));
    return res.status(200).send({ files: names });
  }
  catch (e) {
    return sendFailure(res, e);
  }
};
