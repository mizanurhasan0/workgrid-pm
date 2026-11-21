import { configureStore } from '@reduxjs/toolkit';
import callReducers from './Features/Call/callReducers';
import projectReducers from './Features/Projects/projectReducers';
import breadCrumbReducer from './Reducers/breadCrumbReducer';
import notifyReducer from './Reducers/notifyReducer';
import ChatReducer from './Features/Chat/ChatReducer';

export default configureStore({
  reducer: {
    call: callReducers,
    projectStore: projectReducers,
    breadCrumbStore: breadCrumbReducer,
    notifyStore: notifyReducer,
    chatsStore: ChatReducer,
  },
});
