import { createSlice } from '@reduxjs/toolkit';

const callSlice = createSlice({
  name: 'call',
  initialState: {
    users: {},
    loading: true,
    focused: null,
  },
  reducers: {
    addUsers: (state, action) => {
      state.users = {
        ...state.users,
        ...action.payload,
      };
    },
    removeUser: (state, action) => {
      delete state.users[action.payload];
    },
    setMedia: (state, action) => {
      const { user, value } = action.payload;
      const current = state.users[user] || {};
      state.users[user] = {
        ...current,
        media: {
          audio: false,
          video: false,
          screen: false,
          ...current.media,
          ...value,
        },
      };
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setFocused: (state, action) => {
      state.focused = action.payload;
    },
  },
});

export const {
  addUsers,
  removeUser,
  setMedia,
  setLoading,
  setFocused,
} = callSlice.actions;
export default callSlice.reducer;
