import { useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { toast } from 'react-toastify';
import { useGlobalCtx } from '../../../Context/GlobalProvider';
import req from '../../../Utils/req';
import {
  setTaskSelection, setUpdateProject, setUpdateView,
} from '../projectReducers';
import AlertToster from '../../../Components/AlertToster';

const clone = (value) => JSON.parse(JSON.stringify(value));

const errorText = (e, fallback = 'Something went wrong') => (
  typeof e?.response?.data === 'string' ? e.response.data : fallback
);

/**
 * Walks the task tree and returns a copy of `arr` with `value` placed at `tree`.
 * @param {Array} arr - The tasks array (root level).
 * @param {number} idx - The current depth in the tree.
 * @param {Array} tree - The index path of the task.
 * @param {Object} value - The task object to be added or updated.
 * @returns {Array} - The updated tasks array.
 */
function prepareTasks(arr = [], idx = 0, tree = [0], value = {}) {
  if (idx === (tree.length - 1)) {
    if (idx === 0) {arr[tree[idx]] = value;}
    else {arr.child[tree[idx]] = value;}
    return arr;
  }
  const nextOne = idx === 0 ? arr[tree[idx]] : arr.child[tree[idx]];
  arr[tree[idx]] = prepareTasks(nextOne, idx + 1, tree, value);
  return arr;
}

function prepareTasksRemove(arr = [], idx = 0, tree = [0], tskId = 0) {
  if (idx === (tree.length - 1)) {
    if (idx === 0) {return arr.filter((t) => t.id !== tskId);}
    arr.child = arr.child.filter((t) => t.id !== tskId);
    return arr;
  }
  const nextOne = idx === 0 ? arr[tree[idx]] : arr.child[tree[idx]];
  arr[tree[idx]] = prepareTasksRemove(nextOne, idx + 1, tree, tskId);
  return arr;
}

// Socket payloads send the task type as `ctype`; the request payloads send it as `taskType`
const taskTypeOf = (storePayload = {}) => storePayload.ctype || storePayload.taskType;

export default function useTasks() {
  const { socket } = useGlobalCtx();
  const [taskLoading, setTaskLoading] = useState({ groupChange: false });
  const dispatch = useDispatch();
  const store = useStore();
  const taskSelected = useSelector((state) => state.projectStore.taskSelected);
  const getState = () => store.getState().projectStore;

  /**
   * Updates a single task with a PATCH request.
   * @param {Object} options - The options object.
   * @param {Object} options.storePayload - Tree, view and type info used to sync other clients.
   * @param {string} options.taskId - The id of the task to be updated.
   * @param {Object} options.payload - The fields to change.
   * @param {Function} options.load - Setter that toggles the caller's loading state.
   */
  const updateTask = ({
    storePayload,
    taskId,
    payload,
    load = () => { },
  }) => {
    dispatch(setTaskSelection([]));
    if (!taskId) {
      load(false);
      return;
    }
    load(true);
    req({ uri: `task/${taskId}`, method: 'PATCH', data: { ...payload, storePayload } })
      .catch((e) => toast.error(errorText(e)))
      .finally(() => load(false));
  };

  const gpUpdateTask = ({ taskList, payload }) => {
    if (!taskList?.length) {return;}
    setTaskLoading((prev) => ({ ...prev, groupChange: true }));
    dispatch(setTaskSelection([]));
    req({
      uri: 'task/gp/update', method: 'PATCH', data: { ...payload, taskList },
    }).then(({ status }) => {
      if (status === 200) {toast.success('Tasks have been updated');}
      else {toast.error('Something went wrong');}
    }).catch((e) => toast.error(errorText(e)))
      .finally(() => setTaskLoading((prev) => ({ ...prev, groupChange: false })));
  };

  // Copy or move the selected tasks to another project, sprint or backlog
  const gbCopyMove = (payload) => {
    const isMove = payload.action === 'move';
    const listOfTasks = (payload.listOfTasks ?? [])
      .filter((t) => t.temp !== true)
      .map((t) => (t.sub_childs?.length > 0 ? {
        ...t,
        sub_childs: t.sub_childs.map((c) => ({ ...c, project: t.project, type: t.type })),
      } : t));

    setTaskLoading((prev) => ({ ...prev, groupChange: true }));
    dispatch(setTaskSelection([]));
    req({
      uri: isMove ? 'task/gp/move' : 'task/gp/copy',
      method: 'POST',
      data: { ...payload, listOfTasks },
    }).then(({ status }) => {
      if (status === 201) {AlertToster(isMove ? 'Task has been moved' : 'Task copied', 'success');}
      else {AlertToster('Something went wrong', 'error');}
    }).catch((e) => toast.error(errorText(e)))
      .finally(() => setTaskLoading((prev) => ({ ...prev, groupChange: false })));
  };

  // Request a create subtask call to remote
  const createSubtask = (payload) => {
    req({ uri: 'task', method: 'POST', data: payload.task })
      .catch((e) => toast.error(errorText(e)));
  };

  // Request a create task call to remote
  const createTask = (payload) => {
    const task = Object.fromEntries(
      Object.entries(payload.task).filter(([, v]) => v !== undefined && v !== null),
    );
    setTaskLoading((prev) => ({ ...prev, groupChange: true }));
    req({ uri: 'task', method: 'POST', data: task })
      .catch((e) => toast.error(errorText(e)))
      .finally(() => setTaskLoading((prev) => ({ ...prev, groupChange: false })));
  };

  // Apply a task created or updated by someone else to the store
  function manageTaskAddUpdate({ task, storePayload = {} }) {
    const { viewId, tree, sprintId } = storePayload;
    const ctype = taskTypeOf(storePayload);
    const { projects, view } = getState();
    const projectId = task?.project?.id || task?.project;
    const found = projects.find((p) => p.id === projectId);
    if (!found || !ctype) {return;}

    const targetProject = clone(found);
    let updatedtasks;
    let sprints;
    if (ctype !== 'sprints') {
      updatedtasks = prepareTasks(targetProject[ctype] ?? [], 0, tree, task);
    } else {
      const sprint = targetProject.sprints?.find((s) => s.id === sprintId);
      if (!sprint) {return;}
      updatedtasks = prepareTasks(sprint.tasks ?? [], 0, tree, task);
      sprints = targetProject.sprints.map(
        (t) => (t.id === sprintId ? { ...t, tasks: updatedtasks } : t),
      );
    }
    dispatch(setUpdateProject({
      ...targetProject,
      [ctype]: ctype === 'sprints' ? sprints : updatedtasks,
    }));
    const targetView = view.find((v) => v.id === viewId);
    if (targetView) {dispatch(setUpdateView({ ...targetView, tasks: updatedtasks }));}
  }

  // Remove a task that was deleted or moved away by someone else
  function gbRemoveTask({ task, storePayload = {} }) {
    const {
      viewId, prevProject, sprintId, tree,
    } = storePayload;
    const ctype = taskTypeOf(storePayload);
    const projectId = prevProject || task?.project?.id || task?.project;
    const { projects, view } = getState();
    const found = projects.find((p) => p.id === projectId);
    if (!found || !ctype) {return;}

    const pro = clone(found);
    let updatedPro;
    let sprints;
    if (ctype !== 'sprints') {
      updatedPro = prepareTasksRemove(pro[ctype] ?? [], 0, tree, task.id);
    } else {
      const sprint = pro.sprints?.find((s) => s.id === sprintId);
      if (!sprint) {return;}
      updatedPro = prepareTasksRemove(sprint.tasks ?? [], 0, tree, task.id);
      sprints = pro.sprints.map((t) => (t.id === sprintId ? { ...t, tasks: updatedPro } : t));
    }
    dispatch(setUpdateProject({
      ...pro,
      [ctype]: ctype === 'sprints' ? sprints : updatedPro,
    }));
    const targetView = view.find((v) => v.id === viewId);
    if (targetView) {dispatch(setUpdateView({ ...targetView, tasks: updatedPro }));}
  }

  const gpDeleteTask = () => {
    const filterDeleteTask = taskSelected.filter((t) => t?.temp !== true);
    dispatch(setTaskSelection([]));
    if (filterDeleteTask.length === 0) {return;}
    setTaskLoading((prev) => ({ ...prev, groupChange: true }));
    req({ uri: 'task/remove/gp', method: 'DELETE', data: { taskList: filterDeleteTask } })
      .then(({ status }) => {
        if (status === 202) {AlertToster('Task has been deleted', 'success');}
        else {AlertToster('Something went wrong', 'error');}
      })
      .catch((e) => toast.error(errorText(e)))
      .finally(() => setTaskLoading((prev) => ({ ...prev, groupChange: false })));
  };

  useEffect(() => {
    if (!socket) {return undefined;}
    // Keep the named handlers so cleanup only removes this instance's listeners
    const onNewTask = (data) => manageTaskAddUpdate(data);
    const onTaskUpdate = (data) => manageTaskAddUpdate(data);
    const onRemoveTask = (data) => gbRemoveTask(data);
    socket.on('newTask', onNewTask);
    socket.on('taskUpdate', onTaskUpdate);
    socket.on('removeTask', onRemoveTask);
    return () => {
      socket.off('newTask', onNewTask);
      socket.off('taskUpdate', onTaskUpdate);
      socket.off('removeTask', onRemoveTask);
    };
    // Handlers read the store through getState, so only the socket identity matters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return {
    updateTask,
    gpUpdateTask,
    gbCopyMove,
    createSubtask,
    createTask,
    gpDeleteTask,
    setTaskLoading,
    taskLoading,
  };
}
