import { fail, sendFailure } from '../../utils/httpError';
import OwnerAdmins from '../../utils/OwnerAdmin';
import idArrMerge from '../../utils/idArrMerge';
import Project from '../project/project.schema';
import Sprint from './sprint.schema';

const allowedQuery = new Set(['']);
const allowedUpdate = new Set(['status', 'tasksArr', 'startDate', 'endDate', 'title', 'sprintId', 'projectId']);

/**
 * This function is used for creating a new Sprint.
 * It's expect project id in the body.
 * After the sprint is created successfully then it inject that sprint into project.
 * Lastly it emit events for project members.
 * @param {Object} db It handles the db operations.
 */
export const create = ({ db, ws }) => async (req, res) => {
  try {
    const project = await db.findOne({ table: Project, key: { id: req.body.project } });
    if (!project) return fail(res, 400, 'Bad request');
    const sprint = await db.create({ table: Sprint, key: { tasks: req.body.tasks, endDate: req.body.endDate, startDate: req.body.startDate } });
    project.sprints = [...project.sprints, sprint.id];
    await db.save(project);
    res.status(201).send('Sprint created');
    const usrs = await OwnerAdmins({ db: db, ids: true, members: project.members });
    return usrs.forEach(m => ws.to(m.toString()).emit('newSprint', { data: sprint, project: project }));
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};

/**
 * This function is to get all sprints.
 * @param {Object} db It handles the db operations.
 */
export const get = ({ db }) => async (req, res) => {
  try {
    const sprints = await db.find({ table: Sprint, key: { query: req.query, allowedQuery } });
    return res.status(200).send(sprints);
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};

/**
 * Retrieves a single sprint based on the specified ID.
 *
 * @param {Object} obj - An object containing the database instance.
 * @param {Object} obj.db - The database instance.
 */
export const getOne = ({ db }) => async (req, res) => {
  try {
    const sprint = await db.findOne({ table: Sprint, key: { id: req.params.id, populate: { path: 'tasks' } } });
    return res.status(sprint ? 200 : 404).send(sprint || 'sprint not found');
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};

/**
 * This function is used for updating sprint.
 * It expect project id in the request body. If not found it will return 400 status code.
 * When sprint is updated successfully it emit event to project members.
 * @param {Object} db It handles the db operations.
 * @param {Object} ws It is used for emittting events.
 */
export const update = ({ db, ws }) => async (req, res) => {
  try {
    const projectId = req.body.project;
    delete req.body.project;
    const keys = Object.keys(req.body);
    const valid = keys.every(k => allowedUpdate.has(k));
    if (!valid || !projectId) return fail(res, 400, 'Bad request');
    const tables = { Sprint, Project };
    const [sprint, project] = await Promise.all(['Sprint', 'Project'].map(t => db.findOne({ table: tables[t], key: { id: t === 'Sprint' ? req.params.id : projectId } })));
    if (!sprint || !project) return fail(res, 400, 'Bad request');
    keys.forEach(k => {
      let isArray = k.endsWith('Arr');
      sprint[k.replace('Arr', '')] = isArray ? idArrMerge(sprint[k.replace('Arr', '')], req.body[k]) : req.body[k];
    });
    await db.save(sprint);
    res.status(200).send(sprint);
    const usrs = await OwnerAdmins({ db: db, ids: true, members: project.members });
    return usrs.forEach(m => ws.to(m.toString()).emit('sprintUpdate', { sprint, project: String(projectId) }));
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};

/**
 * This function is used for updating sprint.
 * It expect project id in the request body. If not found it will return 400 status code.
 * When sprint is updated successfully it emit event to project members.
 * @param {Object} db It handles the db operations.
 * @param {Object} ws It is used for emittting events.
 */
export const dateUpdate = ({ db, ws }) => async (req, res) => {
  try {
    const { sprintId, projectId } = req.body;
    const allKeys = Object.keys(req.body);
    const valid = allKeys.every((k) => allowedUpdate.has(k));
    if (!valid) return fail(res, 400, 'Bad Request');
    const keys = allKeys.filter((k) => !['sprintId', 'projectId'].includes(k));

    const tables = { Sprint, Project };
    const [sprint, project] = await Promise.all(['Sprint', 'Project'].map(t => db.findOne({ table: tables[t], key: { id: t === 'Sprint' ? sprintId : projectId } })));
    if (!sprint || !project) return fail(res, 400, 'Bad request');

    keys.forEach((k) => { sprint[k] = req.body[k]; });
    // sprint.startDate = from;
    // sprint.endDate = to;
    await db.save(sprint);
    res.status(200).send(sprint);
    const usrs = await OwnerAdmins({ db: db, ids: true, members: project.members });
    return usrs.forEach(m => ws.to(m.toString()).emit('sprintUpdate', { sprint, project: projectId }));
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};
/**
 * A function to remove a sprint from the database
 * @param {Object} params - An object containing the database and WebSocket instances
 * @param {Object} params.db - The database instance
 * @param {Object} params.ws - The WebSocket instance
 */
export const remove = ({ db, ws }) => async (req, res) => {
  try {
    const sprint = await db.findOne({ table: Sprint, key: { id: req.params.id } });
    if (!sprint) return fail(res, 400, 'Sprint not found');
    const project = await db.findOne({ table: Project, key: { id: req.body.project } });
    if (!project) return fail(res, 400, 'Project not found');
    project.sprints = project.sprints.filter(s => s.toString() !== req.params.id);
    await db.save(project);
    res.status(200).send(sprint);
    const usrs = await OwnerAdmins({ db: db, ids: true, members: project.members });
    return usrs.forEach(m => ws.to(m.toString()).emit('sprintRemoved', { sprint, project: req.body.project }));
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};