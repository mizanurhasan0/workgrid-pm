import { useEffect, useState } from 'react';
import { useDispatch, useStore } from 'react-redux';
import { io } from 'socket.io-client';
import { playRingtone, stopRingtone } from '../Utils/ringtone';
import { addNotify } from '../Reducers/notifyReducer';
import { setPUser } from '../Features/Projects/projectReducers';

/** How long an incoming call stays on screen when nobody answers. */
const CALL_TIMEOUT_MS = 60000;

/** Window handles of calls opened by this client, keyed by chat id. */
const callWindows = {};

/**
 * Module-level socket singleton. It does not connect on import: useUser calls
 * socket.connect() after sign in / session restore and socket.disconnect() on sign out.
 */
const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:9998', {
  withCredentials: true,
  autoConnect: false,
});

/**
 * Global app state and socket listeners. Mounted once through GlobalProvider.
 * @returns {Object} context value shared by the whole app
 */
const useGlobal = () => {
  const dispatch = useDispatch();
  const store = useStore();
  const [settingsModal, setSettingsModal] = useState(false);
  const [callerOP, setCallerOP] = useState([]);

  useEffect(() => {
    if (callerOP.length > 0) {playRingtone();}
    else {stopRingtone();}
  }, [callerOP]);

  // Stop the ringtone when the provider unmounts.
  useEffect(() => () => stopRingtone(), []);

  useEffect(() => {
    const timers = new Set();

    const onNewUser = (data) => {
      const current = store.getState().projectStore?.pUsers ?? [];
      dispatch(setPUser([data, ...current.filter((u) => u.id !== data.id)]));
    };
    const onSentNotify = (data) => dispatch(addNotify(data));
    const onIncomingCall = (data) => {
      setCallerOP((prev) => [...prev.filter((c) => c.chatId !== data.chatId), data]);
      const timer = setTimeout(() => {
        timers.delete(timer);
        setCallerOP((prev) => prev.filter((c) => c.chatId !== data.chatId));
      }, CALL_TIMEOUT_MS);
      timers.add(timer);
    };
    const onCloseNotification = (data) => {
      setCallerOP((prev) => prev.filter((c) => c.chatId !== data.chatId));
    };

    socket.on('newUser', onNewUser);
    socket.on('sentNotify', onSentNotify);
    socket.on('incomingCall', onIncomingCall);
    socket.on('closeNotification', onCloseNotification);

    return () => {
      socket.off('newUser', onNewUser);
      socket.off('sentNotify', onSentNotify);
      socket.off('incomingCall', onIncomingCall);
      socket.off('closeNotification', onCloseNotification);
      timers.forEach((timer) => clearTimeout(timer));
      timers.clear();
    };
  }, [dispatch, store]);

  return {
    callerOP,
    setCallerOP,
    socket,
    settingsModal,
    setSettingsModal,
    callWindows,
  };
};

export default useGlobal;
