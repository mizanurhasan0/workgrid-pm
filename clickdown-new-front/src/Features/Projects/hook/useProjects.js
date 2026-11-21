import { useEffect, useRef } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGlobalCtx } from '../../../Context/GlobalProvider';
import useGetData from '../../../Hooks/useGetData';
import req from '../../../Utils/req';
import {
  addOrRemoveMembers,
  removeProject,
  removeSprint,
  setAddProject,
  setPUser,
  setProjects,
  setSprint,
  setUpdateProject,
  setUpdateView,
  setView,
  updateDrawer,
} from '../projectReducers';
import { useAuth } from '../../../Context/AuthProvider';
import AlertToster from '../../../Components/AlertToster';

const DAY_MS = 24 * 60 * 60 * 1000;
const customFields = ['dropdown', 'number', 'string', 'date'];

// Accepts an id or a populated object and returns the id as a string
const idOf = (value) => {
  const id = value && typeof value === 'object' ? value.id : value;
  return id === undefined || id === null ? undefined : id.toString();
};

// Rejection for failures that have already been shown to the user with a toast
const toasted = (message) => Object.assign(new Error(message), { toasted: true });

const errorText = (e, fallback = 'Something went wrong') => (
  typeof e?.response?.data === 'string' ? e.response.data : fallback
);

const sprintName = (sprint, start, end) => `${sprint?.title || 'Sprint'} (${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()})`;

const getView = {
  sprint: (sprints, projectId) => (sprints ?? []).map((s, i) => ({
    id: `sprint-${i}|${projectId}`,
    name: sprintName(s, s.startDate, s.endDate),
    bundleInfo: {
      type: 'sprint',
      sprintId: s.id,
      projectId,
    },
    tasks: s.tasks ?? [],
  })),
  backlogManagement: ({ tasks, bugs }, projectId) => ([
    ...tasks ? [{
      id: `backlog|${projectId}`,
      name: 'Backlog',
      bundleInfo: {
        type: 'backlog',
        projectId,
      },
      tasks,
    }] : [],
    ...bugs ? [{
      id: `bugs|${projectId}`,
      name: 'Bugs',
      bundleInfo: {
        type: 'bug',
        projectId,
      },
      tasks: bugs,
    }] : [],
  ]),
};

export default function useProjects() {
  const { user, setUser } = useAuth();
  const { projectId: paramId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const store = useStore();
  const gridRef = useRef();
  const drawerRef = useRef();
  const { socket } = useGlobalCtx();

  // Always read the latest slice without re-creating callbacks
  const getState = () => store.getState().projectStore;

  const { loading, error } = useGetData(`project?${new URLSearchParams({ visibility: 'show', paginate: 'false' })}`, (res) => {
    if (!Array.isArray(res)) {return;}
    dispatch(setProjects(res));
    if (res.length === 0) {
      navigate('/');
      return;
    }
    const found = res.find((p) => p.id === paramId);
    navigate(`/${found ? paramId : res[0].id}`);
  });

  useEffect(() => {
    if (error) {toast.error('Could not load projects');}
  }, [error]);

  const prepareViewForFolderClick = (id, folderKey) => {
    const project = getState().projects.find((p) => p.id === id);
    if (!project || !getView[folderKey]) {return;}
    const source = folderKey === 'sprint' ? project.sprints : project;
    dispatch(setView(getView[folderKey](source, id)));
  };

  const prepareViewForFileClick = (id, { folderKey, fileId }) => {
    const project = getState().projects.find((p) => p.id === id);
    if (!project) {return;}
    if (folderKey === 'backlogManagement') {
      const key = fileId === 'backlog' ? 'tasks' : 'bugs';
      dispatch(setView(getView.backlogManagement({ [key]: project[key] }, id)));
    } else if (folderKey === 'sprint') {
      const sprint = project.sprints?.find((s) => s.id === fileId);
      if (sprint) {dispatch(setView(getView.sprint([sprint], id)));}
    }
  };

  const createNewSprint = (id) => {
    if (paramId !== id) {
      AlertToster('First select your project', 'warning');
      return;
    }
    const project = getState().projects.find((p) => p.id === id);
    if (!project) {return;}
    const sprintLength = Number(project.sprintLength);
    if (!sprintLength) {
      AlertToster('Sprint length is not set for this project', 'warning');
      return;
    }
    const sprints = project.sprints ?? [];
    const lastSprint = sprints[sprints.length - 1];
    const start = lastSprint ? new Date(lastSprint.endDate) : new Date();
    const end = new Date(start.getTime() + sprintLength * DAY_MS);
    const fd = new FormData();
    fd.append('project', id);
    fd.append('startDate', start.toISOString());
    fd.append('endDate', end.toISOString());
    req({ method: 'POST', uri: 'sprint', data: fd })
      .then(() => toast.success('New sprint created'))
      .catch((e) => toast.error(errorText(e)));
  };

  const deleteSprint = (projectId, sprintId) => {
    if (!projectId || !sprintId) {
      toast.error('Selection error!');
      return;
    }
    req({ method: 'DELETE', uri: `sprint/${sprintId}`, data: { project: projectId } })
      .then(() => toast.success('Sprint deleted!'))
      .catch((e) => toast.error(errorText(e)));
  };

  // Sprint created by someone else
  const onSocketSprint = ({ data, project }) => {
    const { projects, view } = getState();
    const proj = projects.find((p) => p.id === idOf(project));
    if (!proj || !data) {return;}
    const sprints = [...(proj.sprints ?? []), data];
    dispatch(setUpdateProject({ ...proj, sprints }));

    if (view[0]?.bundleInfo?.projectId === proj.id) {
      dispatch(setSprint({
        id: `sprint-${sprints.length - 1}|${proj.id}`,
        name: sprintName(data, data.startDate, data.endDate),
        bundleInfo: {
          type: 'sprint',
          sprintId: data.id,
          projectId: proj.id,
        },
        tasks: [],
      }));
    }
  };

  const handleMemberAddRemove = ({
    method, member, projectId, creator,
  }) => {
    const id = idOf(member);
    if (!id || !projectId) {return;}
    if (method === 'remove' && (id === user?.id || id === idOf(creator))) {
      AlertToster('Credential user can not be deleted', 'warning');
      return;
    }
    const project = getState().projects.find((p) => p.id === projectId);
    const isMember = project?.members?.some((m) => m.id === id);
    if ((method === 'add' && isMember) || (method === 'remove' && !isMember)) {return;}

    dispatch(addOrRemoveMembers({ projectId, member, method }));
    req({
      method: 'PATCH',
      uri: `project/${projectId}`,
      data: { membersArr: { [method]: [id] } },
    }).catch(() => {
      AlertToster('Action failed!', 'error');
      dispatch(addOrRemoveMembers({
        projectId, member, method: method === 'add' ? 'remove' : 'add',
      }));
    });
  };

  const prepareViewForProject = (id) => {
    const project = getState().projects.find((p) => p.id === id);
    if (!project) {
      toast.warning('Select Project');
      return;
    }
    dispatch(setView([
      ...getView.backlogManagement(project, id),
      ...getView.sprint(project.sprints, id),
    ]));
  };

  // The drawer reads `currentDrawer` from the store, so opening or closing only updates it
  const onDrawerHandler = ({
    open = true, viewId, taskId, tree,
  }) => {
    dispatch(updateDrawer(open ? { viewId, taskId, tree } : {}));
  };

  // Resolves to the list of custom fields with the given name, or [] on failure
  const getCFValue = (cName) => req({ method: 'GET', uri: 'cf' })
    .then(({ data }) => (Array.isArray(data) ? data.filter((d) => d.name === cName) : []))
    .catch((e) => {
      console.log(e);
      toast.error('Could not load custom fields');
      return [];
    });

  // Add Custom Field and add project column
  const onCFAdd = ({ body }) => {
    const { projects, ...payload } = body;
    const { projectId, name } = payload;
    const project = (projects ?? getState().projects).find((p) => p.id === projectId);
    if (!project) {
      AlertToster('Project not found', 'error');
      return Promise.reject(toasted('Project not found'));
    }
    const duplicate = (project.customFields ?? []).some(
      (c) => c.cf?.name?.toLowerCase() === name?.toLowerCase(),
    );
    if (duplicate) {
      AlertToster('Duplicate field name', 'error');
      return Promise.reject(toasted('Duplicate field name'));
    }

    return req({ uri: 'cf', method: 'POST', data: payload }).then(({ data }) => {
      if (!data?.id) {return data;}
      const current = getState().projects.find((p) => p.id === projectId) ?? project;
      const nextFields = [...(current.customFields ?? []), { cf: data, show: true }];
      dispatch(setUpdateProject({ ...current, customFields: nextFields }));
      return req({
        uri: `project/${projectId}`,
        method: 'PATCH',
        data: { customFields: nextFields.map((c) => ({ cf: c.cf.id, show: c.show })) },
      }).catch((e) => {
        toast.error('Column added, but the project could not be updated');
        throw Object.assign(e, { toasted: true });
      });
    });
  };

  // Custom field updated
  const onUpdateCF = ({ body }) => {
    const {
      name, value, projectId, projects, cfId,
    } = body;
    const project = (projects ?? getState().projects).find((p) => p.id === projectId);
    const clash = project?.customFields?.find(
      (c) => c?.cf?.name?.toLowerCase() === name?.toLowerCase(),
    );
    if (clash && clash.cf.id !== cfId) {
      toast.warning('Found duplicate name!');
      return Promise.reject(toasted('Found duplicate name!'));
    }
    return req({
      uri: `cf/${cfId}`,
      method: 'PATCH',
      data: { name, value, projectId },
    });
  };

  // Update Sprint date
  const onSprintDateUp = (body) => {
    req({
      uri: 'sprint',
      method: 'PATCH',
      data: body,
    }).then((d) => toast.success(`${d?.data?.title || 'Sprint'} has been updated!`))
      .catch((e) => toast.error(errorText(e)));
  };

  // Sprint updated or removed by someone else. The backend sends { sprint, project } for
  // date changes and removal, but a bare sprint for a plain update, so both shapes are handled.
  const onSocketDtUp = (payload, removed) => {
    const sprint = payload?.sprint ?? payload;
    if (!sprint?.id) {return;}
    const { projects, view } = getState();
    const projectId = idOf(payload?.project)
      ?? projects.find((p) => p.sprints?.some((s) => s.id === sprint.id))?.id;
    const project = projects.find((p) => p.id === projectId);
    if (!project) {return;}

    const sprints = removed
      ? (project.sprints ?? []).filter((s) => s.id !== sprint.id)
      : (project.sprints ?? []).map((s) => (s.id === sprint.id ? {
        ...s,
        startDate: sprint.startDate ?? s.startDate,
        endDate: sprint.endDate ?? s.endDate,
        title: sprint.title ?? s.title,
      } : s));
    dispatch(setUpdateProject({ ...project, sprints }));

    const viewItem = view.find((v) => v.bundleInfo?.sprintId === sprint.id);
    if (!viewItem) {return;}
    if (removed) {
      dispatch(removeSprint(viewItem));
      return;
    }
    const merged = sprints.find((s) => s.id === sprint.id);
    if (merged) {
      dispatch(setUpdateView({
        ...viewItem,
        name: sprintName(merged, merged.startDate, merged.endDate),
      }));
    }
  };

  // Custom field modified
  const onSocketCf = ({ cf, projectId }) => {
    const project = getState().projects.find((p) => p.id === projectId);
    if (!project || !cf) {return;}
    dispatch(setUpdateProject({
      ...project,
      customFields: (project.customFields ?? []).map(
        (c) => (c.cf?.id === cf.id ? { ...c, cf } : c),
      ),
    }));
  };

  // Update project (favourites, customFields, membership) and return the request
  const updateProject = ({ id, payload }) => req({ uri: `project/${id}`, method: 'PATCH', data: payload });

  // Update project name
  const updateShortProject = ({ id, payload }) => req({ uri: `project/short/${id}`, method: 'PATCH', data: payload })
    .then(() => toast.success('Project name updated!'))
    .catch((e) => toast.error(errorText(e)));

  const onSKShortPgUpt = (data) => {
    const project = getState().projects.find((p) => p.id === data?.id);
    if (project) {dispatch(setUpdateProject({ ...project, name: data.name }));}
  };

  // Delete project
  const deleteProject = (project) => {
    if (idOf(project.owner) !== user?.id && user?.role?.name !== 'owner') {
      AlertToster('Unauthorized', 'warning');
      return;
    }
    const previous = getState().projects.find((p) => p.id === project.id) ?? project;
    if (getState().view[0]?.bundleInfo?.projectId === project.id) {
      dispatch(setView([]));
      navigate('/');
    }
    dispatch(removeProject(project.id));
    req({ method: 'DELETE', uri: `project/${project.id}` })
      .then((res) => toast.success(`${res?.data?.name || 'Project'} project deleted!`))
      .catch((e) => {
        toast.error(errorText(e));
        dispatch(setAddProject(previous));
      });
  };

  // Project removed by someone else
  const onDeleteProject = (data) => {
    if (!data?.id) {return;}
    if (getState().view[0]?.bundleInfo?.projectId === data.id) {dispatch(setView([]));}
    dispatch(removeProject(data.id));
  };

  // Role of a user changed
  const onUserRoleUpdate = (data) => {
    const { view, pUsers } = getState();
    dispatch(setPUser(pUsers.map((u) => (
      u.id === data.id ? { ...u, role: data.role?.id ?? data.role } : u
    ))));
    req({ uri: 'project?visibility=show&paginate=false' })
      .then(({ data: fresh }) => {
        dispatch(setProjects(fresh));
        if (user?.id !== data.id) {return;}
        setUser((u) => ({ ...u, role: data.role }));
        const currentProjectId = view[0]?.bundleInfo?.projectId;
        if (!currentProjectId) {return;}
        const current = fresh.find((p) => p.id === currentProjectId);
        if (!current?.members?.some((m) => m.id === user.id)) {
          dispatch(setView([]));
          navigate('/');
        }
      })
      .catch(() => toast.error('Could not refresh projects'));
  };

  useEffect(() => {
    if (!socket) {return undefined;}
    const handlers = {
      newProject: (project) => {
        dispatch(setAddProject(project));
        if (idOf(project.owner) === user?.id) {navigate(`/${project.id}`);}
      },
      projectUpdate: (project) => dispatch(setUpdateProject(project)),
      cfUpdate: onSocketCf,
      newSprint: onSocketSprint,
      sprintUpdate: (data) => onSocketDtUp(data, false),
      sprintRemoved: (data) => onSocketDtUp(data, true),
      projectRemoved: onDeleteProject,
      projectShortUpdate: onSKShortPgUpt,
      updateUser: onUserRoleUpdate,
    };
    Object.entries(handlers).forEach(([event, handler]) => socket.on(event, handler));
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => socket.off(event, handler));
    };
    // Handlers read the store through getState, so only identity-changing inputs are deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user?.id]);

  return {
    gridRef,
    drawerRef,
    loading,
    error,
    customFields,
    handleMemberAddRemove,
    prepareViewForProject,
    prepareViewForFolderClick,
    prepareViewForFileClick,
    createNewSprint,
    deleteProject,
    onDrawerHandler,
    getCFValue,
    onCFAdd,
    updateProject,
    onUpdateCF,
    onSprintDateUp,
    deleteSprint,
    updateShortProject,
  };
}
