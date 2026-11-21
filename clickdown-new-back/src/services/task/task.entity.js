import { fail, sendFailure } from '../../utils/httpError';
import Task from './task.schema';
import Project from '../project/project.schema';
import Sprint from '../sprint/sprint.schema';
import idArrMerge from '../../utils/idArrMerge';
// import Comment from '../comment/comment.schema';
import notifySchema from '../notifications/notify.schema';
import { archivedIds, withStates } from '../notifications/notify.entity';
import WebPush from '../../utils/WebPush';
import OwnerAdmins from '../../utils/OwnerAdmin';
import { normalizeBodyPriority } from '../../utils/priority';

const tables = { Task, Project, Sprint };
const allowedQuery = new Set(['members,visibility', 'page', 'id']);
const createAllowed = new Set(['name', 'description', 'type', 'startDate', 'endDate', 'assignee', 'estimate', 'points', 'priority', 'sprint', 'project', 'customFields', 'logs']);

const allowedLogs = ['name', 'description', 'type', 'endDate', 'assignee', 'estimate', 'points', 'priority', 'sprint', 'project', 'customFields', 'assigneeArr', 'id', 'comment'];

function recursivePopulate(path, levels) {
  if (levels <= 0) return [];
  return {
    path,
    strictPopulate: false,
    select: 'name email username avatar customFields assignee endDate startDate estimate priority type pause elapsedtime startTime message comment user members typeField logs cf curValue preValue action createdAt',
    populate: recursivePopulate(path, levels - 1),
  };
}
const taskPopulate = {
  path: 'assignee child estimate priority type',
  strictPopulate: false,
  populate: {
    path: 'assignee child user customFields',
    select: 'name email username avatar customFields assignee endDate estimate startDate priority type pause elapsedtime startTime message comment user members typeField logs cf curValue preValue action createdAt',
    strictPopulate: false,
    populate: [recursivePopulate('assignee child user customFields', 10)],
  },
  select: 'project name email username avatar customFields assignee endDate estimate startDate priority type pause elapsedtime startTime message comment user members typeField cf curValue preValue action createdAt'
};
const logPopulated = {
  path: 'user task members',
  select: 'name avatar assignee elapsedtime logs customFields priority estimate project cf',
  strictPopulate: false,
  populate: {
    path: 'customFields.cf project logs',
    select: 'name icon owner cf value customFields curValue preValue createdAt members typeField user action comment',
    strictPopulate: false,
    populate: {
      path: 'user members',
      select: 'name avatar',
      strictPopulate: false,
    }
  }
};

const setNotification = async ({ db, ws, dataType, body = {}, task, newNotifObj, userId, action = 'update' }) => {
  try {
    const bodyFilter = Object.keys(body).filter((k) => allowedLogs.includes(k));
    const { members } = task?.project || [];
    if (['create', 'remove', 'moved', 'copy'].includes(action)) {
      newNotifObj.curValue = { type: action, value: task.name, name: task.project.name, preProject: task?.preProject };
      newNotifObj.typeField = action;
    } else {
      bodyFilter.forEach((k) => {
        if (['assigneeArr', 'assignee'].includes(k)) {
          k === 'assignee' ? newNotifObj.curValue = { type: 'add', value: body[k] } : newNotifObj.curValue = { type: Object.keys(body[k])[0], value: Object.values(body[k])[0][0] };
          newNotifObj.typeField = 'assignee';
        }
        if (k === 'customFields') {
          const findCf = task.customFields.find((f) => f.cf.toString() === body[k].cf);
          if (findCf) newNotifObj.preValue = { type: dataType, value: findCf.value, cf: findCf.cf.toString(), name: body[k].name, color: body[k].preColor };
          const curValue = { type: dataType, value: body[k].value, cf: body[k]?.cf, name: body[k].name, color: body[k].color };
          newNotifObj.curValue = curValue;
          newNotifObj.typeField = k;
        }
        if (['name', 'endDate', 'estimate', 'priority'].includes(k)) {
          newNotifObj.curValue = { type: dataType, value: body[k], name: k };
          newNotifObj.preValue = task[k] && { type: dataType, value: task[k], name: k };
          newNotifObj.typeField = 'default';
        }
        if (['comment'].includes(k)) {
          newNotifObj.comment = body[k];
          newNotifObj.typeField = 'comment';
        }
        if (['description'].includes(k)) {
          newNotifObj.curValue = { type: dataType, value: body[k], name: k };
          newNotifObj.typeField = 'description';
        }
      });
    }
    newNotifObj.user = userId;
    newNotifObj.task = task.id;
    newNotifObj.action = action;
    newNotifObj.members = members;
    const log = await db.save(newNotifObj);
    const populateLog = await db.populate(log, logPopulated);
    const usrs = await OwnerAdmins({ db: db, ids: true, members: members });
    return usrs.forEach((m) => ws.to(m.toString()).emit('sentNotify', populateLog));
  } catch (error) {
    console.log(error);
    return ('Log cann\'t created');
  }
};

// const logObjCreate = async ({ id, user, task, projectName, action }) => {
//   return { id, members: task.project.members, task, action: action, typeField: action, updatedAt: new Date().toISOString(), createdAt: new Date().toISOString(), user, curValue: { type: action, value: task.name, name: projectName } };
// };
/**
 * This function is for creating a task.
 * It will fetch the project and sprint from req body.
 * Then it will use sprint to push the task inside that sprint and it will use project to send events to all memebers.
 * @param {Object} db It will be used for db operations.
 * @param {Object} ws It will be used for ws operations.
 */
export const create = ({ db, ws }) => async (req, res) => {
  try {
    // const subscription = JSON.parse(req.body.subscription);
    delete req.body.subscription;
    const { parentTask = null, storePayload = {} } = req.body;
    let ctype = storePayload.taskType;
    delete req.body.parentTask;
    delete req.body.storePayload;
    normalizeBodyPriority(req.body);
    const keys = Object.keys(req.body);
    const valid = keys.every(k => createAllowed.has(k));
    if (!valid) return fail(res, 400, 'Bad request');
    const hasSprint = !!req.body.sprint;
    const [project, sprint] = await Promise.all(['Project', 'Sprint']
      .map(t => db.findOne({ table: tables[t], key: { id: req.body[t.toLowerCase()] } })));

    if (!project || (hasSprint && (!sprint || !project.sprints.includes(sprint?.id)))) return fail(res, 400, 'Bad request');
    const newNotifObj = new notifySchema();
    req.body.logs = [newNotifObj._id.toString()];
    if (!req?.body?.customFields?.cf?.id) return fail(res, 400, 'Project status not found!');
    req.body.customFields = [{ cf: req?.body?.customFields?.cf?.id, value: 'Todo' }];
    let task = await db.create({ table: Task, key: { ...req.body, populate: taskPopulate } });
    const jsonTask = JSON.parse(JSON.stringify(task));
    setNotification({ db, ws, body: req.body, dataType: storePayload.dataType, task: { ...jsonTask, project: project }, newNotifObj, userId: req.user.id, action: 'create' });
    if (parentTask) {
      const parent = await db.findOne({ table: Task, key: { id: parentTask } });
      if (parent) {
        parent.child = [...parent.child, task.id];
        await db.save(parent);
      }
    }
    else if (hasSprint) {
      ctype = 'sprints';
      sprint.tasks = [...sprint.tasks, task.id];
      await db.save(sprint);
    } else {
      if (task.type === 'bugs') {
        ctype = 'bugs';
        project.bugs = [...project.bugs, task.id];
      }
      else project.tasks = [...project.tasks, task.id];
      await db.save(project);
    }
    // const logData = await logObjCreate({ id: newNotifObj._id, user: req.user, task, action: 'create', projectName: project.name });
    const cTask = JSON.parse(JSON.stringify(task));
    // cTask.logs = [logData];
    res.status(201).send(task);
    const usrs = await OwnerAdmins({ db: db, ids: true, members: project.members });
    return usrs.forEach(m => ws.to(m).emit('newTask', { task: cTask, storePayload: { ...storePayload, ctype, sprintId: req.body.sprint, create: true } }));
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};

/**
 * This function is to get all tasks.
 * @param {Object} db It handles the db operations.
 */
export const get = ({ db }) => async (req, res) => {
  try {
    const tasks = await db.find({ table: Task, key: { query: req.query, allowedQuery, populate: taskPopulate } });
    return res.status(200).send(tasks);
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};

/**
 * Retrieves a single task based on the specified ID.
 *
 * @param {Object} obj - An object containing the database instance.
 * @param {Object} obj.db - The database instance.
 */
export const getOne = ({ db }) => async (req, res) => {
  try {
    const task = await db.findOne({ table: Task, key: { id: req.params.id, populate: taskPopulate } });
    return res.status(task ? 200 : 404).send(task || 'task not found');
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};
/**
 * Retrieves a single task based on the specified ID.
 *
 * @param {Object} obj - An object containing the database instance.
 * @param {Object} obj.db - The database instance.
 */
// const taskPopulate = {
//   path: 'assignee child estimate priority type logs',
//   strictPopulate: false,
//   populate: {
//     path: 'assignee child user members customFields logs',
//     select: 'name email username avatar customFields assignee endDate estimate startDate priority type pause elapsedtime startTime message comment user members typeField logs cf curValue preValue action createdAt',
//     strictPopulate: false,
//     populate: [recursivePopulate('assignee child user members customFields logs', 8)],
//   },
//   select: 'project name email username avatar customFields assignee endDate estimate startDate priority type pause elapsedtime startTime message comment user members typeField logs cf curValue preValue action createdAt'
// };
const sngTskPopulate = {
  path: 'assignee customFields logs',
  strictPopulate: false,
  select: 'name email username avatar customFields assignee endDate estimate startDate priority type pause elapsedtime startTime message comment user typeField logs cf curValue preValue action createdAt members',
  populate: {
    path: 'members user',
    select: 'name email avatar members',
    strictPopulate: false,
  }
};
export const getCustomOne = ({ db }) => async (req, res) => {
  try {
    if (!req.params.id) return fail(res, 400, 'Id Not found');
    const task = await db.findOne({ table: Task, key: { id: req.params.id, populate: sngTskPopulate } });
    return res.status(200).send(task);
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};
/**
 * This function is an API endpoint for updating a task in a database and notifying project members of the update using WebSockets.
 *
 * @param {Object} db - An object representing the database.
 * @param {Object} ws - An object representing the WebSocket server.
 * @returns {Function} - An asynchronous function that takes in two parameters, req and res.
 */
export const update = ({ db, ws, webpush }) => async (req, res) => {
  try {
    const { storePayload = {} } = req.body;
    normalizeBodyPriority(req.body);
    const keys = Object.keys(req.body);
    const bodyKeys = Object.keys(req.body).filter((k) => allowedLogs.includes(k));
    delete req.body.storePayload;

    const task = await db.findOne({
      table: Task, key: {
        id: req.params.id,
        populate: {
          path: 'project members',
          strictPopulate: false,
          populate: {
            path: 'members',
            select: 'push icon email',
            strictPopulate: false,
          }
        }
      }
    });
    if (!task || !task.project || !storePayload) return fail(res, 400, 'Payload not correct.');
    if (bodyKeys.length > 0) {
      const newNotifObj = new notifySchema();
      task.logs = [...task.logs, newNotifObj._id];
      const cTask = JSON.parse(JSON.stringify(task));
      // This function help to create log and notification data
      setNotification({ db, ws, body: req.body, dataType: storePayload.dataType, task: { ...cTask, project: { ...cTask.project, members: cTask.project.members.map((m) => m.id) } }, newNotifObj, userId: req.user.id });
    }
    if (req.body?.customFields) {
      let customFields = req.body.customFields;
      req.body.customName = customFields.name;
      const indexField = task.customFields.findIndex((f) => f.cf.toString() === customFields.cf);
      if (indexField === -1) req.body.customFields = [...task.customFields, customFields];
      else {
        task.customFields[indexField] = customFields;
        req.body.customFields = task.customFields;
      }
    }
    keys.forEach(k => {
      let isArray = k.endsWith('Arr');
      task[k.replace('Arr', '')] = isArray ? idArrMerge(task[k.replace('Arr', '')], req.body[k]) : req.body[k];
    });
    await db.save(task);

    const populatedtask = await db.populate(task, taskPopulate);
    const usrs = await OwnerAdmins({ ids: true, members: task.project.members });

    usrs.forEach((id) => ws.to(id).emit('taskUpdate', { task: populatedtask, storePayload: { ...storePayload, ctype: storePayload.ctype || storePayload.taskType } }));
    const membs = req.body.assigneeArr;
    if (membs?.add && membs.add[0] && membs.add[0] !== req.user.id) {
      WebPush({ pushObj: webpush, membs: task.project?.members, mId: membs.add[0], title: `${task.name} task`, body: 'you are add this task!', icon: `${process.env.SERVER_API}/${task.project.icon}` });
    } else if (membs?.remove && membs.remove[0] && membs.remove[0] !== req.user.id) {
      WebPush({ pushObj: webpush, membs: task.project?.members, mId: membs.remove[0], title: `${task.name} task`, body: 'you are removed this task!', icon: `${process.env.SERVER_API}/${task.project.icon}` });
    }
    return res.status(200).send('task Updated!');
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};
export const gpUpdate = ({ db, ws, webpush }) => async (req, res) => {
  try {
    const { taskList } = req.body;
    for (let t of taskList) {
      normalizeBodyPriority(t);
      const task = await db.findOne({ table: Task, key: { id: t.task, populate: { path: 'project', populate: { path: 'members', select: 'push icon email' } } } });
      const prev_project = await db.findOne({ table: Project, key: { id: t.prev_project } });
      if (!task) return fail(res, 400, 'Payload not correct.');
      let storePayload = { tree: t.tree, viewId: t.viewId, sprintId: t?.prev_sprints, ctype: t.prev_type };
      const bodyKeys = Object.keys(t).filter((k) => allowedLogs.includes(k));

      if (t?.assignee) {
        const d = prev_project?.members?.find((p) => p.toString() === t.assignee);
        if (!d) return fail(res, 401, 'Memeber not found this project!');
      }
      if (bodyKeys.length > 0) {
        const newNotifObj = new notifySchema();
        task.logs = [...task.logs, newNotifObj._id];
        const cTask = JSON.parse(JSON.stringify(task));
        // This function help to create log and notification data
        setNotification({
          db, ws, body: t, dataType: storePayload.dataType, task: { ...cTask, project: { ...cTask.project, members: cTask.project.members.map((m) => m.id) } }, newNotifObj, userId: req.user.id,
        });
      }
      if (t?.customFields) {
        let customFields = t.customFields;
        const indexField = task.customFields.findIndex((f) => f.cf.toString() === customFields.cf);
        if (indexField === -1) t.customFields = [...task.customFields, customFields];
        else {
          task.customFields[indexField] = customFields;
          t.customFields = task.customFields;
        }
      }
      Object.keys(t).forEach(k => {
        if (k === 'assignee') task[k] = task.assignee.includes(t[k]) ? task.assignee : [...task.assignee, t[k]];
        else task[k] = t[k];
      });
      await db.save(task);
      const populatedtask = await db.populate(task, taskPopulate);
      const usrs = await OwnerAdmins({ ids: true, members: task.project?.members });
      usrs.forEach(id => ws.to(id).emit('taskUpdate', { task: populatedtask, storePayload }));
      if (t.assignee && t.assignee !== req.user.id) WebPush({ pushObj: webpush, membs: task.project?.members, mId: t.assignee, title: `${task.name} task`, body: 'you are add this task', icon: `${process.env.SERVER_API}/${task.project.icon}` });
    }
    return res.status(200).send('group update');
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};

const ChildUpdateProjectId = async (db, subChids) => {
  for (let item of subChids) {
    const task = await db.findOne({ table: Task, key: { id: item.task } });
    if (task) {
      task.project = item.project;
      if (item.prev_project !== item.project) task.assignee = [];
      await db.save(task);
    }
  }
};
export const gpMoveTask = ({ db, ws }) => async (req, res) => {
  try {
    let tbl = [];
    const { listOfTasks } = req.body;
    for (let item of listOfTasks) {
      tbl = item.prev_project === item.project ? ['Project', 'Task'] : ['Project', 'Task', 'prev_project'];
      const [project, task, prev_project] = await Promise.all(tbl
        .map(t => db.findOne({ table: t === 'prev_project' ? tables['Project'] : tables[t], key: { id: item[t.toLowerCase()] } })));
      //Assignee Checking
      if (!task || !project) return fail(res, 400, 'Payload not correct.');
      if (item.sub_childs?.length > 0) await ChildUpdateProjectId(db, item.sub_childs);
      const jsTask = JSON.parse(JSON.stringify(task));

      const storePayload = { ctype: item.prev_type, sprintId: item?.prev_sprints, prevProject: item.prev_project, prevType: item.prev_type };
      // previous task action
      if (item.prev_type === 'sprints') {
        if (item.tree.length > 1) await db.remove({ table: Task, key: { id: item.task } });
        else {
          const prev_sprint = await db.findOne({ table: Sprint, key: { id: item.prev_sprints } });
          if (prev_sprint) {
            prev_sprint.tasks = prev_sprint.tasks.filter((t) => t.toString() !== item.task);
            await db.save(prev_sprint);
          }
        }
      }
      if (item.prev_project === item.project) {
        project[item.prev_type] = project[item.prev_type].filter((t) => t.toString() !== item.task);
        await db.save(project);
      } else {
        prev_project[item.prev_type] = prev_project[item.prev_type].filter((t) => t.toString() !== item.task);
        await db.save(prev_project);
      }
      // End Previous Task Action
      const prevTaskPopulate = await db.populate(task, taskPopulate);
      const rmUsrs = await OwnerAdmins({ db: db, ids: true, members: (item.prev_project === item.project ? project : prev_project)?.members });
      rmUsrs.forEach(m => ws.to(m).emit('removeTask', { task: prevTaskPopulate, storePayload: { ...storePayload, viewId: item.viewId, tree: item.tree } }));

      Object.keys(jsTask).forEach((k) => {
        if ([undefined, null, ''].includes(jsTask[k]) || ['id', '__v', 'createdAt', 'updatedAt'].includes(k)) delete jsTask[k];
      });
      // Creating Task start
      jsTask.project = item.project;
      if (item.prev_project !== item.project) jsTask.assignee = [];
      // Log creating
      const newNotifObj = new notifySchema();
      jsTask.logs = [...jsTask.logs, newNotifObj._id];
      // This function help to create log and notification data
      setNotification({
        db, ws, dataType: storePayload.dataType, task: { ...jsTask, preProject: prev_project?.name, project: project }, newNotifObj, userId: req.user.id, action: 'moved'
      });
      const nTask = await db.create({ table: Task, key: { ...jsTask, populate: taskPopulate } });
      const populatedtask = JSON.parse(JSON.stringify(await db.populate(nTask, taskPopulate)));
      if (['bugs', 'tasks'].includes(item.type)) {
        project[item.type] = [...project[item.type], nTask.id];
        item.tree = [project[item.type].length - 1];
        await db.save(project);
      }
      else {
        const sprint = await db.findOne({ table: Sprint, key: { id: item.type } });
        sprint.tasks = [...sprint.tasks, nTask.id];
        item.tree = [sprint.tasks.length - 1];
        await db.save(sprint);
      }
      const usrs = await OwnerAdmins({ db: db, ids: true, members: project.members });
      // end Creating task
      usrs.forEach(m => ws.to(m.toString()).emit('newTask', { task: populatedtask, storePayload: { ...storePayload, tree: item.tree, viewId: item.newViewId, ctype: ['bugs', 'tasks'].includes(item.type) ? item.type : 'sprints', sprintId: item.type, create: true } }));

    }
    return res.status(201).send('moved');
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};

export const timeUpdate = async ({ data, session, ws, db }) => {
  try {
    const storePayload = data.storePayload || {};
    const task = await db.findOne({ table: Task, key: { id: data.taskId, populate: { path: 'project' } } });
    if (!task || !task.project || Object.keys(storePayload).length === 0) return session.emit('error', { message: 'playload not correct!' });
    if (!task.project.members.some((m) => m.toString() === session.user.id)) return session.emit('error', { message: 'Unauthorized' });
    task.elapsedtime = data.elapsedtime;
    await db.save(task);
    const populatedtask = await db.populate(task, taskPopulate);

    const usrs = await OwnerAdmins({ db: db, ids: true, members: task.project?.members });
    return usrs.forEach((id) => ws.to(id).emit('taskUpdate', { task: populatedtask, storePayload: { ...storePayload, ctype: storePayload.ctype || storePayload.taskType } }));
  } catch (error) {
    console.log(error);
  }
};
// Group Copy Recursive function
const SubCopy = async ({ db, ws, userId, populatedTask, project, ckProject }) => {
  const newObj = populatedTask.toJSON();
  const sourceId = newObj.id;
  ['id', '_id', '__v', 'createdAt', 'updatedAt', 'logs'].forEach((k) => delete newObj[k]);
  Object.keys(newObj).forEach((k) => (newObj[k] === undefined || newObj[k] === null || newObj[k] === '') && delete newObj[k]);
  const newNotifObj = new notifySchema();
  await setNotification({ db, ws, task: { ...newObj, id: sourceId, project: project }, newNotifObj, userId, action: 'copy' });
  newObj.project = project.id;
  if (!ckProject) newObj.assignee = [];
  else newObj.assignee = (newObj.assignee || []).map((m) => m?.id ?? m);

  // Copy the children first so the copy references its own children, not the originals
  const childIds = [];
  for (const tsk of (populatedTask.child || []).filter((c) => c && c.toJSON)) {
    const copiedChild = await SubCopy({ db, ws, userId, populatedTask: tsk, project, ckProject });
    childIds.push(copiedChild._id);
  }
  newObj.child = childIds;
  newObj.logs = [newNotifObj._id];
  const objInstance = new Task(newObj);
  await db.save(objInstance);
  return objInstance;
};

export const gpCopyTask = ({ db, ws }) => async (req, res) => {
  try {
    const { listOfTasks } = req.body;
    for (let item of listOfTasks) {
      const [project, task] = await Promise.all(['Project', 'Task']
        .map(t => db.findOne({ table: t === 'prev_project' ? tables['Project'] : tables[t], key: { id: item[t.toLowerCase()] } })));

      // Sub task Creating
      const pTasks = await db.populate(task, taskPopulate);
      const allTasks = await SubCopy({ db, ws, userId: req.user.id, populatedTask: pTasks, project: project, ckProject: item.prev_project === item.project });
      // End Sub task
      if (['bugs', 'tasks'].includes(item.type)) {
        project[item.type] = [...project[item.type], allTasks.id];
        item.tree = [project[item.type].length - 1];
        await db.save(project);
      }
      else {
        const sprint = await db.findOne({ table: Sprint, key: { id: item.type } });
        sprint.tasks = [...sprint.tasks, allTasks.id];
        item.tree = [sprint.tasks.length - 1];
        await db.save(sprint);
      }
      await db.populate(allTasks, taskPopulate);
      const storePayload = { ctype: item.prev_type, sprintId: item?.prev_sprints, prevProject: item.prev_project, prevType: item.prev_type };

      const usrs = await OwnerAdmins({ db: db, ids: true, members: project.members });
      usrs.forEach(m => ws.to(m.toString()).emit('newTask', { task: allTasks, storePayload: { ...storePayload, tree: item.tree, viewId: item.newViewId, ctype: ['bugs', 'tasks'].includes(item.type) ? item.type : 'sprints', sprintId: item.type, create: true } }));
    }
    return res.status(201).send('Updated tasks');
  } catch (error) {
    console.log(error);
    return fail(res, 400, 'Something went wrong!');
  }
};
// Group Copy Recursive function
// const SubCopy = ({ db, ws, userId, populatedTask, project, ckProject }) => {
//   const newObj = populatedTask.toJSON();
//   Object.keys(newObj).forEach((k) => (newObj[k] === undefined || newObj[k] === null || newObj[k] === '' || [k] == 'id' || [k] == 'createdAt', [k] == 'updatedAt', [k] == 'logs') && delete newObj[k]);
//   const newNotifObj = new notifySchema();
//   setNotification({ db, ws, task: { ...newObj, project: project }, newNotifObj, userId, action: 'copy' });
//   newObj.project = project.id;
//   if (!ckProject) newObj.assignee = [];
//   else newObj.assignee = newObj.assignee.length !== 0 ? newObj.assignee.map((m) => m.id) : [];

//   newObj.child = newObj.child.map((c) => c.id);

//   newObj.logs = [newNotifObj._id];
//   const objInstance = new Task(newObj);
//   db.save(objInstance);
//   if (populatedTask.child && populatedTask.child.length > 0) {
//     objInstance.child = populatedTask.child.map((tsk) => SubCopy({ db, ws, userId, populatedTask: tsk, project, ckProject: ckProject }));
//   }
//   return objInstance;
// };

// export const gpCopyTask = ({ db, ws }) => async (req, res) => {
//   try {
//     const { listOfTasks } = req.body;
//     for (let item of listOfTasks) {
//       const [project, task, prev_project] = await Promise.all(['Project', 'Task', 'prev_project']
//         .map(t => db.findOne({ table: t === 'prev_project' ? tables['Project'] : tables[t], key: { id: item[t.toLowerCase()] } })));
//       console.log({ item, prev_project });
//       // Sub task Creating
//       const pTasks = await db.populate(task, taskPopulate);
//       let allTasks;
//       if (item.prev_project !== item.project) {
//         allTasks = await SubCopy({ db, ws, userId: req.user.id, populatedTask: pTasks, project: project, ckProject: item.prev_project === item.project });
//       }
//       // End Sub task
//       if (['bugs', 'tasks'].includes(item.type)) {
//         if (item.prev_project !== item.project) project[item.type] = [...project[item.type], allTasks.id];
//         else {
//           const idx = project[item.type].findIndex((t) => t.toString() === item.task);
//           if (idx !== -1) return fail(res, 400, 'Already copied!');
//           project[item.type] = [...project[item.type], item.task];
//         }

//         item.tree = [project[item.type].length - 1];
//         await db.save(project);
//       }
//       else {
//         const sprint = await db.findOne({ table: Sprint, key: { id: item.type } });
//         const idx = sprint.tasks.findIndex((t) => t.toString() === item.task);
//         if (idx !== -1) return fail(res, 400, 'Doublicate task not copied!');
//         if (item.prev_project !== item.project) sprint.tasks = [...sprint.tasks, allTasks.id];
//         else sprint.tasks = [...sprint.tasks, item.task];

//         item.tree = [sprint.tasks.length - 1];
//         await db.save(sprint);
//       }
//       if (item.prev_project !== item.project) await db.populate(allTasks, taskPopulate);
//       else await db.populate(task, taskPopulate);

//       const storePayload = { ctype: item.prev_type, sprintId: item?.prev_sprints, prevProject: item.prev_project, prevType: item.prev_type };

//       const usrs = await OwnerAdmins({ db: db, ids: true, members: project.members });
//       usrs.forEach(m => ws.to(m.toString()).emit('newTask', { task: item.prev_project !== item.project ? allTasks : task, storePayload: { ...storePayload, tree: item.tree, viewId: item.newViewId, ctype: ['bugs', 'tasks'].includes(item.type) ? item.type : 'sprints', sprintId: item.type, create: true } }));
//     }
//     return res.status(201).send('Tasks Copied!');
//   } catch (error) {
//     console.log(error);
//     return fail(res, 400, 'Something went wrong!');
//   }
// };
const removeChildTasks = async (db, req, subTasks) => {
  const subTsks = await db.find({
    table: Task, key: {
      query: { id: { $in: subTasks.map((t) => t.task) } },
      allowedQuery,
      paginate: false
    }
  });
  await Promise.all(subTsks.map((t) => {
    t.remove = true;
    return db.save(t);
  }));
};
export const gpRemove = ({ db, ws }) => async (req, res) => {
  try {
    const { taskList } = req.body;
    for (let item of taskList) {
      const prev_project = await db.findOne({ table: Project, key: { id: item.prev_project, paginate: false } });
      let tsk = await db.findOne({
        table: Task,
        key: {
          id: item.task,
          paginate: false,
          strictPopulate: false,
          populate: { path: 'project' }
        }
      });
      if (!tsk) continue;
      const chunkArr = [];
      if (item.parentId) {
        let parentTask = await db.findOne({ table: Task, key: { id: item.parentId } });
        parentTask.child = parentTask.child.filter((c) => c.toString() !== item.task);
        chunkArr.push(parentTask);
      } else {
        if (item.prev_type === 'sprints') {
          const db_sprint = await db.findOne({ table: Sprint, key: { id: item.prev_sprints } });
          db_sprint.tasks = db_sprint.tasks.filter((t) => t.toString() !== item.task);
          chunkArr.push(db_sprint);
        } else {
          prev_project[item.prev_type] = prev_project[item.prev_type].filter((i) => i?.toString() !== item.task);//remove form project
          chunkArr.push(prev_project);
        }
      }
      const newNotifObj = new notifySchema();
      tsk.logs = [...tsk.logs, newNotifObj._id];
      // // This function help to create log and notification data
      setNotification({ db, ws, body: { id: item.task }, dataType: 'remove', task: tsk, newNotifObj, userId: req.user.id, action: 'remove' });
      tsk.remove = true;
      chunkArr.push(tsk);
      const t = await Promise.all(chunkArr.map((ech) => db.save(ech)));
      const populatedtask = JSON.parse(JSON.stringify(await db.populate(t[t.length - 1], taskPopulate)));
      const storePayload = { viewId: item.viewId, prevType: item.prev_type, sprintId: item?.prev_sprints, prevProject: item.prev_project, tree: item.tree, ctype: item.prev_type };

      const usrs = await OwnerAdmins({ db: db, ids: true, members: prev_project.members });

      usrs.forEach(m => ws.to(m).emit('removeTask', { task: populatedtask, storePayload }));
      if (item.sub_childs?.length > 0) await removeChildTasks(db, req, item.sub_childs);
    }
    res.status(202).send('Deleted');
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};
/**
 * A function to remove a task from the database.
 * It also remove task from sprint.
 * Then it removes all the comments related to the task.
 * @param {Object} params - An object containing the database and WebSocket instances
 * @param {Object} params.db - The database instance
 * @param {Object} params.ws - The WebSocket instance
 */

export const allUpdateLogs = ({ db }) => async (req, res) => {
  try {
    if (req.params.userId !== req.user.id) return fail(res, 403, 'You can only read your own notifications.');
    // ?archived=true lists only archived notifications, ?archived=false only the others; omitted lists all.
    const { archived, ...query } = req.query;
    const key = { members: { $in: [req.params.userId] }, sort: 'desc', populate: logPopulated, visibility: 'show', query, allowedQuery };
    if (archived === 'true') key._id = { $in: await archivedIds(req.user._id) };
    else if (archived === 'false') key._id = { $nin: await archivedIds(req.user._id) };
    else if (archived !== undefined) return fail(res, 400, '"archived" must be true or false');
    const notify = await db.find({ table: notifySchema, key });
    // Every notification carries the current user's `read` and `archived` flags.
    if (Array.isArray(notify?.docs)) return res.status(200).send({ ...notify, docs: await withStates(req.user._id, notify.docs) });
    return res.status(200).send(await withStates(req.user._id, notify || []));
  }
  catch (e) {
    console.log(e);
    return sendFailure(res, e);
  }
};
