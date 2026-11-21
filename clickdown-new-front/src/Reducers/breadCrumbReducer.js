import { createSlice } from '@reduxjs/toolkit';

const breadSlice = createSlice({
  name: 'bread',
  initialState: {
    project: {},
    folder: {},
    file: {},
    dir: {},
  },
  reducers: {
    setProjectCrumb: (state, action) => {
      const { name, idx } = action.payload;
      if (name) {
        state.project = { idx, name };
        state.folder = '';
        state.file = {};
      } else {state.project = {};}
    },
    setFolderCrumb: (state, action) => {
      const { project, folder } = action.payload;
      if (project && folder) {
        state.project = project;
        state.folder = folder;
        state.file = {};
      } else {state.folder = '';}
    },
    setFileCrumb: (state, action) => {
      const { project, folder, file } = action.payload;
      if (project && folder && file) {
        state.project = project;
        state.folder = folder;
        state.file = file;
      } else {state.file = {};}
    },
  },
});

export const { setProjectCrumb, setFolderCrumb, setFileCrumb } = breadSlice.actions;
export default breadSlice.reducer;
