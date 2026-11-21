import { createSlice } from '@reduxjs/toolkit';

const projectsSlice = createSlice({
  name: 'projects',
  initialState: {
    pagination: {},
    projects: [],
    pUsers: [],
    favourites: [],
    view: [],
    taskSelected: [],
    customField: {},
    currentDrawer: {},
    createTaskOpen: {
      placeholder: 'New Task', id: '0', field: '',
    },
  },
  reducers: {
    setProjects: (state, action) => {
      if (typeof action.payload === 'function') {state.projects = action.payload(state);}
      else {state.projects = action.payload;}
    },
    // Replace a project, or add it when the store does not know it yet
    setUpdateProject: (state, action) => {
      const index = state.projects.findIndex((p) => p.id === action.payload?.id);
      if (index === -1) {state.projects.push(action.payload);}
      else {state.projects[index] = action.payload;}
    },
    removeProject: (state, action) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
    },
    setAddProject: (state, action) => {
      state.projects = [...state.projects.filter((p) => p.id !== action.payload?.id), action.payload];
    },
    setFavourites: (state, action) => {
      if (typeof action.payload === 'function') {state.favourites = action.payload(state);}
      else {state.favourites = action.payload;}
    },
    mergeProjects: (state, action) => {
      state.projects = [...state.projects, action.payload];
    },
    addOrRemoveMembers: (state, action) => {
      const { projectId, member, method } = action.payload;
      state.projects.forEach((project) => {
        if (project.id !== projectId) {return;}
        const members = project.members ?? [];
        project.members = method === 'add'
          ? [member, ...members.filter((m) => m.id !== member.id)]
          : members.filter((m) => m.id !== member.id);
      });
    },
    setView: (state, action) => {
      if (typeof action.payload === 'function') {state.view = action.payload(state);}
      else {state.view = action.payload;}
    },
    setUpdateView: (state, { payload }) => {
      const index = state.view.findIndex((v) => v.id === payload?.id);
      if (index !== -1) {state.view[index] = payload;}
    },
    setSprint: (state, action) => {
      state.view = [...state.view, action.payload];
    },
    removeSprint: (state, action) => {
      state.view = state.view.filter((v) => v.id !== action.payload?.id);
    },
    // Remove task from view
    removeView: (state, action) => {
      const { viewId, task } = action.payload;
      state.view = state.view.map((p) => {
        if (p.id === viewId) {
          return { ...p, tasks: (p.tasks ?? []).filter((t) => t.id !== task.id) };
        }
        return p;
      });
    },
    addNewSprint: (state, action) => {
      const { group, id, data } = action.payload;
      state[group] = (state[group] ?? []).map((p) => {
        if (p.id === id) {
          p.sprints = [...(p.sprints ?? []), data];
        }
        return p;
      });
    },
    updateDrawer: (state, action) => {
      state.currentDrawer = action.payload;
    },
    setTaskSelection: (state, action) => {
      state.taskSelected = action.payload;
    },
    setCustomField: (state, action) => {
      state.customField = { ...state.customField, ...action.payload };
    },
    resetCustomField: (state) => {
      state.customField = {};
    },
    onCreateTaskOpen: (state, action) => {
      state.createTaskOpen = action.payload;
    },
    setPUser: (state, action) => {
      state.pUsers = action.payload;
    },
  },
});

export const {
  setProjects,
  setUpdateProject,
  setAddProject,
  addOrRemoveMembers,
  mergeProjects,
  setView,
  setUpdateView,
  setSprint,
  addNewSprint,
  removeProject,
  updateDrawer,
  setTaskSelection,
  removeView,
  setCustomField,
  resetCustomField,
  onCreateTaskOpen,
  setFavourites,
  setPUser,
  removeSprint,
} = projectsSlice.actions;
export default projectsSlice.reducer;
