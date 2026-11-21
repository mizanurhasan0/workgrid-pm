import { fail, sendFailure } from '../../utils/httpError';
import Project from './project.schema';
import idArrMerge from '../../utils/idArrMerge';

// External Service Schema
import Chat from '../chat/chat.schema';
import CustomField from '../customfield/customfield.schema';
import OwnerAdmins from '../../utils/OwnerAdmin';
const allowedQuery = new Set(['members', 'visibility', 'paginate']);
const allowedUpdate = new Set(['membersArr', 'customFields', 'favorit', 'group', 'name']);

function recursivePopulate(path, levels) {
  if (levels <= 0) return [];
  return {
    path,
    strictPopulate: false,
    select: 'name email username avatar customFields assignee endDate startDate title estimate priority type pause elapsedtime startTime createdAt',
    populate: recursivePopulate(path, levels - 1),
  };
}
const populate = {
  path: 'sprints tasks bugs members customFields.cf',
  populate: {
    path: 'tasks assignee child customFields',
    select: 'name email username avatar customFields assignee endDate startDate title estimate priority type elapsedtime pause startTime createdAt',
    strictPopulate: false,
    populate: [
      recursivePopulate('child assignee', 10),
    ],
  },
  // tasks project    customFields
  select: 'customFields members status assignee endDate startDate title tasks username name email avatar estimate elapsedtime pause startTime priority type value description type',
};
const chatPopulated = {
  path: 'creator members lastMessage',
  select: 'name avatar company author message reactions chat type created attachments read_by',
  strictPopulate: false,
};

/**
 * Creates a new project and chat associated with it.
 * Adds the creator as a member of the project and notifies all members of the project about the new chat.
 *
 * @param {Object} obj - An object containing the database and WebSocket instances.
 * @param {Object} obj.db - The database instance.
 * @param {Object} obj.ws - The WebSocket instance.
 */
export const create = ({ db, ws, imageUp, webpush }) => async (req, res) => {
  try {
    req.body = req.body?.data ? JSON.parse(req.body.data) : req.body;
    if (req?.files?.icon?.path) req.body.icon = await imageUp(req.files.icon.path);
    // !req.body.members.includes(req.user.id) && (req.body.members = [...req.body.members, req.user.id]);
    // Set default custom fields from database if not present in payload
    if (!req.body?.customFields) {
      let defaultCustomFields = await db.find({ table: CustomField, key: { allowedQuery: new Set(['default']), query: { default: true }, paginate: false } });
      req.body.customFields = defaultCustomFields.map(field => ({
        show: true,
        cf: field.id,
      }));
    }

    const project = await db.create({
      table: Project, key: {
        ...req.body, owner: req.user.id,
        members: [...new Set([...(req.body.members || []), req.user.id])],
        populate: {
          path: 'sprints members customFields.cf',
          select: 'status endDate startDate tasks username name email avatar value description default type push',
        }
      }
    });

    const chat = await db.create({
      table: Chat, key: {
        ...req.body, icon: project.icon, creator: req.user.id, members: [...new Set([...(req.body.members || []), req.user.id])], populate: chatPopulated
      }
    });
    project.chat = chat.id;
    await db.save(project);

    res.status(201).send(project);

    try {
      const usrs = await OwnerAdmins({ members: project.members });
      const payload = JSON.stringify({ title: `${project.name} project`, body: 'A new project has been created!', icon: `${process.env.SERVER_API}/${project.icon}` });
      usrs.forEach(m => {
        ws.to(m.id).emit('createChat', chat);
        ws.to(m.id).emit('newProject', project);
        if (m.id !== req.user.id && m.push && Object.keys(m.push).length !== 0) {
          webpush.sendNotification(m.push, payload).catch(() => console.log({ error: 'web push error' }));
        }
      });
    } catch (e) {
      console.error('Project create notification failed:', e);
    }
    return undefined;
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/**
 * Retrieves projects based on the specified query parameters.
 * @param {Object} obj - An object containing the database instance.
 * @param {Object} obj.db - The database instance.
 */
export const get = ({ db }) => async (req, res) => {
  try {
    const projects = await db.find({
      table: Project, key: {
        query: req?.user?.role === null || (req?.user?.role?.name === 'member') ? { ...req.query, members: { $in: req.user.id } } : { ...req.query },
        allowedQuery,
        populate,
        paginate: req.query.paginate === 'true',
      }
    });

    return res.status(200).send(projects);
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};


/**
 * Retrieves projects based on which user is currently assigned to the projects.
 * @param {Object} obj - An object containing the database instance.
 * @param {Object} obj.db - The database instance.
 */
export const getSpecific = ({ db }) => async (req, res) => {
  try {
    const projects = await db.find({ table: Project, key: { query: { ...req.query, visibility: 'show' }, allowedQuery, populate } });
    return res.status(200).send(projects);
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};

/**
 * Retrieves a single project based on the specified ID.
 *
 * @param {Object} obj - An object containing the database instance.
 * @param {Object} obj.db - The database instance.
 */
export const getOne = ({ db }) => async (req, res) => {
  try {
    const project = await db.findOne({
      table: Project, key: {
        id: req.params.id, members: { $in: [req.user.id] }, populate: {
          path: 'sprints members customFields.cf',
          select: 'status endDate startDate tasks username name email avatar',
        }
      }
    });
    return res.status(project ? 200 : 404).send(project || 'Project not found');
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};
const isPrivileged = (user) => ['owner', 'admin'].includes(user?.role?.name);

/**
 * Returns a project with tasks/bugs/sprints filtered by a custom-field value.
 * Query: cf (custom field id), value, taskType ('tasks' | 'bugs' | 'sprints'), sprintId (for sprints).
 */
export const getStatus = ({ db }) => async (req, res) => {
  try {
    const { cf, value, taskType, sprintId } = req.query;
    if (!value || !taskType) return fail(res, 400, 'value and taskType are required');
    const filter = { id: req.params.id, ...(!isPrivileged(req.user) && { members: { $in: [req.user.id] } }) };
    const project = await db.findOne({ table: Project, key: filter });
    if (!project) return fail(res, 404, 'Project not found');
    const genProject = await db.populate(project, populate);
    if (value.toLowerCase() === 'all tasks') return res.status(200).send(genProject);

    const matches = (t) => String(t?.customFields?.find((c) => c?.cf?.toString() === cf)?.value ?? '').toLowerCase() === value.toLowerCase();
    if (['bugs', 'tasks'].includes(taskType)) {
      genProject[taskType] = genProject[taskType].filter(matches);
    } else {
      genProject[taskType] = genProject[taskType].map((sp) => {
        if (sp.id.toString() === sprintId) sp.tasks = sp.tasks.filter(matches);
        return sp;
      });
    }
    return res.status(200).send(genProject);
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/**
 * Updates a project and its chat. Members added/removed are notified over the socket.
 */
export const update = ({ db, ws }) => async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const valid = keys.every(k => allowedUpdate.has(k));
    if (!valid) return fail(res, 400, 'Bad Request');
    const project = await db.findOne({ table: Project, key: { id: req.params.id } });
    if (!project) return fail(res, 404, 'project or chat not found');
    const chat = await db.findOne({ table: Chat, key: { id: project.chat } });
    if (!chat) return fail(res, 404, 'project or chat not found');
    const sendEvForChat = keys.some(k => ['members', 'name'].includes(k));
    keys.forEach(k => {
      let isArray = k.endsWith('Arr');
      project[k.replace('Arr', '')] = isArray ? idArrMerge(project[k.replace('Arr', '')], req.body[k]) : req.body[k];
      chat[k.replace('Arr', '')] = isArray ? idArrMerge(chat[k.replace('Arr', '')], req.body[k]) : req.body[k];
    });
    await Promise.all([db.save(project), db.save(chat)]);
    const populatedProject = await db.populate(project, populate);

    if (req.body?.membersArr && Object.keys(req.body?.membersArr)[0] === 'add') {
      const populatedChat = await db.populate(chat, chatPopulated);
      ws.to(req.body.membersArr.add[0]).emit('newChat', populatedChat);
      ws.to(req.body.membersArr.add[0]).emit('newProject', populatedProject);
    } else if (req.body?.membersArr && Object.keys(req.body?.membersArr)[0] === 'remove') {
      ws.to(req.body.membersArr.remove[0]).emit('deleteChat', chat);
      ws.to(req.body.membersArr.remove[0]).emit('projectRemoved', project);
    }
    const usrs = await OwnerAdmins({ ids: true, members: project.members });
    if (sendEvForChat) chat.members.forEach(m => ws.to(m.toString()).emit('chatUpdate', chat));
    !keys.includes('favorit') && usrs.forEach(id => id !== req.user.id && ws.to(id).emit('projectUpdate', populatedProject));
    return res.status(200).send(populatedProject);
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/**
 * Updates a project without re-populating it (lightweight variant of update).
 */
export const shortUpdate = ({ db, ws }) => async (req, res) => {
  try {
    const keys = Object.keys(req.body);
    const valid = keys.every(k => allowedUpdate.has(k));
    if (!valid) return fail(res, 400, 'Bad Request');
    const project = await db.findOne({ table: Project, key: { id: req.params.id } });
    if (!project) return fail(res, 404, 'project or chat not found');
    const chat = await db.findOne({ table: Chat, key: { id: project.chat } });
    if (!chat) return fail(res, 404, 'project or chat not found');
    const sendEvForChat = keys.some(k => ['members', 'name'].includes(k));
    keys.forEach(k => {
      let isArray = k.endsWith('Arr');
      project[k.replace('Arr', '')] = isArray ? idArrMerge(project[k.replace('Arr', '')], req.body[k]) : req.body[k];
      chat[k.replace('Arr', '')] = isArray ? idArrMerge(chat[k.replace('Arr', '')], req.body[k]) : req.body[k];
    });
    await Promise.all([db.save(project), db.save(chat)]);
    const usrs = await OwnerAdmins({ ids: true, members: project.members });

    usrs.forEach(id => ws.to(id).emit('projectShortUpdate', project));
    if (sendEvForChat) chat.members.forEach(m => ws.to(m.toString()).emit('chatUpdate', chat));
    return res.status(200).send(project);
  }
  catch (e) {
    return sendFailure(res, e);
  }
};

/**
 * Soft-deletes a project (visibility 'hide') and its chat. Only the owner or an 'owner' role may do it.
 */
export const remove = ({ db, ws }) => async (req, res) => {
  try {
    const project = await db.findOne({ table: Project, key: { id: req.params.id } });
    if (!project) return fail(res, 404, 'Project not found');
    if (project.owner.toString() !== req.user.id && req.user.role?.name !== 'owner') return fail(res, 401, 'Unauthorized');
    const chat = await db.findOne({ table: Chat, key: { id: project.chat } });
    project.visibility = 'hide';
    await db.save(project);
    if (chat) {
      chat.remove = true;
      await db.save(chat);
    }
    res.status(200).send(project);

    const usrs = await OwnerAdmins({ ids: true, members: chat?.members || project.members });
    chat?.members?.forEach((m) => ws.to(m.toString()).emit('deleteChat', chat));
    usrs.forEach(id => ws.to(id).emit('projectRemoved', project));
  }
  catch (e) {
    return sendFailure(res, e);
  }
};
