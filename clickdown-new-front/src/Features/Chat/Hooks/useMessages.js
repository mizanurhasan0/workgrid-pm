import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import req from '../../../Utils/req';
import {
  setAttach,
  setChatScroll,
  setChats,
  setLoadMessage,
  setMessage,
  setMessageReactions,
  setPaginates,
  setSelected,
} from '../ChatReducer';
import { useGlobalCtx } from '../../../Context/GlobalProvider';
import AlertToster from '../../../Components/AlertToster';
import { useAuth } from '../../../Context/AuthProvider';
import LinkDetect from '../../../Utils/LinkDetect';
import rememberCallWindow from '../../Call/callWindows';

export default function useMessages() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { socket, callWindows } = useGlobalCtx();
  const { pagination } = useSelector((state) => state.chatsStore);
  const [msgLoading, setMsgLoading] = useState(false);
  // The chat currently open; responses for any other chat are ignored.
  const activeIdRef = useRef(id);
  const pageLoadingRef = useRef(false);

  const getMSGs = ({ page = 1, chatId = id } = {}) => {
    if (!chatId || chatId === 'create') {return Promise.resolve();}
    setMsgLoading(true);
    return req({ uri: `message/${chatId}?page=${page}` })
      .then(({ data }) => {
        if (activeIdRef.current !== chatId) {return;}
        const docs = [...(data?.docs ?? [])].reverse();
        dispatch(setPaginates({ name: 'msgHasNext', value: data?.nextPage }));
        if (page !== 1) {dispatch(setLoadMessage(docs));}
        else {
          dispatch(setSelected({ msg: docs, chatId }));
          dispatch(setChatScroll());
        }
      })
      .catch(() => {
        if (activeIdRef.current === chatId) {AlertToster('Could not load messages.', 'error');}
      })
      .finally(() => {
        if (activeIdRef.current === chatId) {setMsgLoading(false);}
      });
  };

  const onScrollLoadMSG = (e) => {
    const el = e.target;
    if (el.scrollTop === 0 && pagination.msgHasNext && !pageLoadingRef.current) {
      pageLoadingRef.current = true;
      getMSGs({ page: pagination.msgHasNext }).finally(() => {
        pageLoadingRef.current = false;
      });
    }
  };

  // Opens the call page in a popup. Returns false when the popup was blocked.
  const openCall = (chatId, mode) => {
    const existing = callWindows[chatId];
    if (existing && !existing.closed) {
      existing.focus();
      return false;
    }
    const win = window.open(`/call/${mode}/${chatId}`, '_blank', 'width=auto, height=auto');
    if (!win) {
      AlertToster('Allow pop-ups for this site to join the call.', 'warning');
      return false;
    }
    rememberCallWindow(callWindows, chatId, win);
    return true;
  };

  const call = ({ mode }) => {
    if (openCall(id, mode)) {socket.emit('call', { chatId: id, mode });}
  };

  const join = (chatId, data) => {
    openCall(chatId, data?.mode ?? 'audio');
  };

  // Marks a message as deleted in the open chat and updates the chat list and attachments.
  const applyDeletion = (update, state, chatId, mId) => {
    const { selected, chats, attach } = state().chatsStore;
    const chat = chats.find((c) => c.id === chatId);
    if (chat?.lastMessage?.id === mId) {
      update(setChats(chats.map((c) => (c.id === chatId
        ? { ...c, lastMessage: { ...c.lastMessage, deleted: true, message: '[Deleted]' } }
        : c))));
    }
    if (selected.chatId !== chatId) {return;}
    const target = selected.msg.find((m) => m.id === mId);
    if (!target) {return;}
    const links = LinkDetect(target.message ?? '');
    const attachIds = (target.attachments ?? []).map((a) => a.id);
    if (attachIds.length || links.length) {
      update(setAttach({
        attachment: attach.attachment.filter((a) => !attachIds.includes(a.id)),
        links: attach.links.filter((l) => !links.includes(l)),
      }));
    }
    update(setSelected({
      ...selected,
      msg: selected.msg.map((m) => (m.id === mId ? { ...m, deleted: true } : m)),
    }));
  };

  const onMsgDelete = ({ mId, chatId }) => {
    dispatch((update, state) => {
      const msg = state().chatsStore.selected.msg.find((m) => m.id === mId);
      if (msg && msg.author?.id !== user.id) {
        AlertToster('You can only delete your own messages.', 'error');
        return;
      }
      applyDeletion(update, state, chatId, mId);
    });
    socket.emit('messageUpdate', { id: mId, chatId });
  };

  const onSocketDeleteMsg = (data) => {
    const chatId = data.chat?.id ?? data.chat;
    dispatch((update, state) => applyDeletion(update, state, chatId, data.id));
  };

  // Adds (remove = false) or removes the signed-in user's emoji reaction. The server answers with the
  // message's full reaction list, which is also pushed to the other members as 'messageReaction'.
  const onReact = ({ mId, emoji, remove = false }) => req(remove
    ? { method: 'DELETE', uri: `message/${mId}/reaction?emoji=${encodeURIComponent(emoji)}` }
    : { method: 'PUT', uri: `message/${mId}/reaction`, data: { emoji } })
    .then(({ data }) => dispatch(setMessageReactions(data)))
    .catch((e) => AlertToster(e?.serverMessage || 'Could not update the reaction.', 'error'));

  const getAttachs = (chatId = id) => {
    if (!chatId || chatId === 'create') {return Promise.resolve();}
    return req({ uri: `message/attach/${chatId}` })
      .then(({ data }) => {
        if (activeIdRef.current !== chatId) {return;}
        dispatch(setAttach({
          attachment: [...(data?.attachments ?? [])].reverse(),
          links: [...(data?.links ?? [])].reverse(),
        }));
      })
      .catch(() => AlertToster('Could not load attachments.', 'error'));
  };

  // Handles a new message pushed over the socket.
  const getMessage = (data) => {
    const chatId = data.chat?.id ?? data.chat;
    dispatch((update, state) => {
      const { selected, attach, chats } = state().chatsStore;
      const attachments = data.attachments ?? [];
      const links = data.links ?? [];
      if (selected.chatId === chatId && !selected.msg.some((m) => m.id === data.id)) {
        if (attachments.length || links.length) {
          update(setAttach({
            attachment: [...attachments, ...attach.attachment],
            links: [...links, ...attach.links],
          }));
        }
        update(setMessage(data));
      }
      update(setChats(chats.map((c) => (c.id === chatId ? { ...c, lastMessage: data } : c))));
    });
  };

  const onSeenMsg = ({ cId }) => {
    req({ method: 'PATCH', uri: `message/${cId}` })
      .catch(() => AlertToster('Could not mark messages as read.', 'error'));
  };

  // Message events arrive for every chat, so the chat list stays current.
  useEffect(() => {
    const onMessage = (data) => getMessage(data);
    const onMessageUpdate = (data) => onSocketDeleteMsg(data);
    const onMessageReaction = (data) => dispatch(setMessageReactions(data));
    socket.on('message', onMessage);
    socket.on('messageUpdate', onMessageUpdate);
    socket.on('messageReaction', onMessageReaction);
    return () => {
      socket.off('message', onMessage);
      socket.off('messageUpdate', onMessageUpdate);
      socket.off('messageReaction', onMessageReaction);
    };
    // The handlers only use dispatch and the store, so they are registered once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Loads the open chat and joins its room; leaves the room when another chat opens.
  useEffect(() => {
    activeIdRef.current = id;
    dispatch(setSelected({ msg: [], chatId: null }));
    dispatch(setAttach({ attachment: [], links: [] }));
    if (!id || id === 'create') {return undefined;}
    getAttachs(id);
    // Loading flag is set here on purpose: the fetch for the open chat starts now.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getMSGs({ page: 1, chatId: id });
    socket.emit('entry', { method: 'join', chat: id });
    return () => {
      socket.emit('entry', { method: 'leave', chat: id });
    };
    // Runs once per opened chat; the helpers above only read the store and `activeIdRef`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return {
    // state
    msgLoading,
    // methods
    getMSGs,
    call,
    join,
    onMsgDelete,
    onReact,
    getAttachs,
    onScrollLoadMSG,
    onSeenMsg,
  };
}
