import { fail, sendFailure } from '../../utils/httpError';
import Customfield from './customfield.schema';
import Project from '../project/project.schema';
import Task from '../task/task.schema';
import taskSchema from '../task/task.schema';
const tables = {
  Task,
  Project
};

/**
 * CRUD operations for custom fields.
 */


export const create = ({ db, ws }) => async (req, res) => {
  try {
    const cf = await db.create({ table: Customfield, key: { ...req.body } });
    ws.sockets.emit('newCf', cf);
    return res.status(200).send(cf);
  }
  catch (e) {
    console.log(e);
    sendFailure(res, e);
  }
};

export const get = ({ db }) => async (req, res) => {
  try {
    const cfs = await db.find({ table: Customfield, key: { query: req.query, allowedQuery: new Set(['page', 'id']), paginate: false } });
    res.status(200).send(cfs);
  }
  catch (e) {
    console.log(e);
    sendFailure(res, e);
  }
};

export const getOne = ({ db }) => async (req, res) => {
  try {
    const cf = await db.findOne({ table: Customfield, key: { id: req.params.id } });
    return res.status(cf ? 200 : 404).send(cf || 'Not found');
  }
  catch (e) {
    console.log(e);
    sendFailure(res, e);
  }
};

export const update = ({ db, ws }) => async (req, res) => {
  try {
    const cf = await db.findOne({ table: Customfield, key: { id: req.params.id } });
    if (!cf) return fail(res, 404, 'Not found');
    Object.keys(req.body).forEach(k => cf[k] = req.body[k]);
    await db.save(cf);
    ws.sockets.emit('cfUpdate', { cf, projectId: req.body.projectId });
    return res.status(200).send(cf);
  }
  catch (e) {
    console.log(e);
    sendFailure(res, e);
  }
};

/**
 * Remove custom fields also get tasks and projects based on the custom fields and remove the custom field from them too.
 */
export const remove = ({ ws, db }) => async (req, res) => {
  try {
    const cf = await db.remove({ table: Customfield, key: { id: req.params.id } });
    if (!cf) return fail(res, 404, 'Not found');
    const projectAndTasks = await Promise.all(['Project', 'Task'].map(t => db.find({ table: tables[t], key: { 'customFields.cf': { $in: [req.params.id] }, paginate: false } })));
    const promises = [];
    projectAndTasks.map((pt, i) => pt.map(d => {
      d.customFields = d.customFields.filter(t => t.cf.toString() !== req.params.id);
      ws.sockets.emit(`${i === 0 ? 'project' : 'task'}Update`, d);
      promises.push(db.save(d));
    }));
    await Promise.all(promises);
    return res.status(200).send(cf);
  }
  catch (e) {
    console.log(e);
    sendFailure(res, e);
  }
};
/**
 * Remove custom fields also get tasks and projects based on the custom fields and remove the custom field from them too.
 */
export const removeCF = ({ db }) => async (req, res) => {
  try {
    const proms = [];
    const tasks = await db.find({ table: taskSchema, key: { 'customFields.cf': { $in: [req.params.id] }, paginate: false } });
    tasks.map((tsk) => {
      tsk.customFields = tsk.customFields.filter((t) => t.cf.toString() !== req.params.id);
      proms.push(db.save(tsk));
    });
    await Promise.all(proms);
    return res.status(200).send('Custom field task value updated!');
  }
  catch (e) {
    console.log(e);
    sendFailure(res, e);
  }
};