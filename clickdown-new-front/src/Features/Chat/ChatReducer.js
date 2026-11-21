import { createSlice } from '@reduxjs/toolkit';

const uniqueById = (list) => list.filter((item, i, arr) => arr.findIndex((x) => x.id === item.id) === i);

const chatsSlice = createSlice({
  name: 'chats',
  initialState: {
    pagination: { chatHasNext: true, msgHasNext: true },
    chatScroll: false,
    chats: [],
    selected: { msg: [], chatId: null },
    attach: { attachment: [], links: [] },
    previewData: {},
    actionModal: { show: false, chatData: null },
    selectedUsers: [],
  },
  reducers: {
    setPaginates: (state, action) => {
      state.pagination[action.payload.name] = action.payload.value;
    },
    setChats: (state, action) => {
      state.chats = action.payload;
    },
    setUpdateChat: (state, action) => {
      state.chats = state.chats.map((c) => (c.id === action.payload.id ? action.payload : c));
    },
    setChatScroll: (state) => {
      state.chatScroll = !state.chatScroll;
    },
    removeChat: (state, action) => {
      state.chats = state.chats.filter((c) => c.id !== action.payload);
    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    setLoadMessage: (state, action) => {
      state.selected.msg = [...action.payload, ...state.selected.msg];
    },
    setMessage: (state, action) => {
      state.selected.msg = [...state.selected.msg, action.payload];
      state.chatScroll = !state.chatScroll;
    },
    // Replaces the reactions of one message (payload: { id, chat, reactions }) in the open chat and the chat list.
    setMessageReactions: (state, action) => {
      const { id, chat, reactions } = action.payload;
      if (state.selected.chatId === chat) {
        const msg = state.selected.msg.find((m) => m.id === id);
        if (msg) {msg.reactions = reactions;}
      }
      const target = state.chats.find((c) => c.id === chat);
      if (target?.lastMessage?.id === id) {target.lastMessage.reactions = reactions;}
    },
    setActionModal: (state, action) => {
      state.actionModal = action.payload;
    },
    setSelectedUsers: (state, action) => {
      const incoming = Array.isArray(action.payload) ? action.payload : [action.payload];
      state.selectedUsers = uniqueById([...state.selectedUsers, ...incoming]);
    },
    removeSelectedUsers: (state, action) => {
      state.selectedUsers = state.selectedUsers.filter((u) => u.id !== action.payload);
    },
    setAttach: (state, action) => {
      state.attach = action.payload;
    },
    setPreviewData: (state, action) => {
      state.previewData = action.payload;
    },
    resetState: (state, action) => {
      state[action.payload.name] = [];
    },
  },
});

export const {
  setChatScroll,
  setPaginates,
  setChats,
  setUpdateChat,
  removeChat,
  setSelected,
  setLoadMessage,
  setMessage,
  setMessageReactions,
  setActionModal,
  setSelectedUsers,
  removeSelectedUsers,
  setAttach,
  resetState,
  setPreviewData,
} = chatsSlice.actions;
export default chatsSlice.reducer;
