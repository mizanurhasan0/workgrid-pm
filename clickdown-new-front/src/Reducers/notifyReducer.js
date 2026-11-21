import { createSlice } from '@reduxjs/toolkit';

const notifySlice = createSlice({
  name: 'notify',
  initialState: {
    notify: { logs: [], seen: false },
    view: {},
    usersList: [],
    nPagination: { userNextPage: null, logNextPage: null },
    register: {},
  },
  reducers: {
    setNotify: (state, action) => {
      state.notify = { ...state.notify, logs: action.payload };
    },
    addNotify: (state, action) => {
      const oldNotifyStringify = state.notify.logs.map(JSON.stringify);
      const oldNotifiSet = new Set(oldNotifyStringify);
      const newJson = Array.from(oldNotifiSet).map(JSON.parse);
      const oldNotifi = state.notify;
      state.notify = { ...oldNotifi, logs: [action.payload, ...newJson] };
    },
    addArrNotify: (state, action) => {
      const oldNotifyStringify = state.notify.logs.map(JSON.stringify);
      const oldNotifiSet = new Set(oldNotifyStringify);
      const newJson = Array.from(oldNotifiSet).map(JSON.parse);
      const oldNotifi = state.notify;
      state.notify = { ...oldNotifi, logs: [...newJson, ...action.payload] };
    },
    setSeen: (state, action) => {
      state.notify = { ...state.notify, seen: action.payload };
    },
    setView: (state, action) => {
      state.view = action.payload;
    },
    setUserList: (state, action) => {
      state.usersList = action.payload;
    },
    setPagination: (state, action) => {
      state.nPagination[action.payload.name] = action.payload.value;
    },
    setReg: (state, action) => {
      state.register = action.payload;
    },
  },
});

export const {
  setNotify, setSeen, addNotify, addArrNotify, setView, setUserList, setPagination, setReg,
} = notifySlice.actions;
export default notifySlice.reducer;
