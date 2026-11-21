import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../Context/AuthProvider';
import req from '../../../Utils/req';
import {
  removeChat, setActionModal, setChats, setPaginates, setUpdateChat,
} from '../ChatReducer';
import { useGlobalCtx } from '../../../Context/GlobalProvider';
import AlertToster from '../../../Components/AlertToster';

// Path of the chat next to `index`, or the create page when no other chat is left.
const neighbourPath = (chats, index) => {
  const next = chats[index + 1] ?? chats[index - 1];
  return next ? `/chat/${next.id}` : '/chat/create';
};

// Merges pages without duplicates; the later copy of a chat wins.
const mergeChats = (oldChats, newChats) => {
  const map = new Map();
  [...oldChats, ...newChats].forEach((c) => map.set(c.id, c));
  return Array.from(map.values());
};

export default function useChats() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: activeId } = useParams();
  const { socket } = useGlobalCtx();
  const { user, setUser } = useAuth();
  const { selectedUsers, actionModal, pagination } = useSelector((state) => state.chatsStore);
  const chatLoadingRef = useRef(false);
  // Socket handlers are registered once, so they read the latest values from here.
  const latest = useRef({});
  useEffect(() => {
    latest.current = { user, activeId, navigate };
  });

  const getChats = (page = 1) => {
    if (chatLoadingRef.current) {return;}
    chatLoadingRef.current = true;
    req({ uri: `chat?page=${page || 1}` })
      .then(({ data }) => {
        dispatch((update, getState) => {
          update(setChats(mergeChats(getState().chatsStore.chats, data?.docs ?? [])));
        });
        dispatch(setPaginates({ name: 'chatHasNext', value: data?.nextPage }));
      })
      .catch(() => AlertToster('Could not load chats.', 'error'))
      .finally(() => { chatLoadingRef.current = false; });
  };

  /**
   * @param {Object} activeCt selected chat
   * @returns {string} image of the chat, or of the other member in a direct chat
   */
  const getAvatar = (activeCt) => {
    if (!activeCt?.icon) {
      return activeCt?.members?.length === 1
        ? activeCt.members[0]?.avatar
        : activeCt?.members?.find((m) => m.id !== user?.id)?.avatar;
    }
    return activeCt.icon;
  };

  const getNameTruncate = (activeCt, num = 2) => {
    if (activeCt?.name) {
      const names = activeCt.name.split(',');
      if (names.length > 1) {return names.slice(0, num).toString().concat(names.length - num > 0 ? `,+${names.length - num}` : '');}
      return activeCt.name;
    }
    return activeCt?.members?.length === 1
      ? activeCt.members[0]?.name
      : activeCt?.members?.find((m) => m.id !== user?.id)?.name;
  };

  const unpinChat = (chatId) => {
    setUser((u) => ({ ...u, pinnedChats: (u.pinnedChats ?? []).filter((c) => c !== chatId) }));
    return req({ method: 'PATCH', uri: `chat/pin/${chatId}`, data: { action: 'Unpin' } })
      .catch(() => AlertToster('Could not update pinned chats.', 'error'));
  };

  // Removes a chat from the list, and moves to a neighbour when it was the open chat.
  const removeChatLocally = (chatId) => {
    dispatch((update, getState) => {
      const { chats } = getState().chatsStore;
      const { activeId: current, navigate: go } = latest.current;
      if (current === chatId) {go(neighbourPath(chats, chats.findIndex((c) => c.id === chatId)));}
      update(removeChat(chatId));
    });
  };

  const onLeave = ({
    cId, selectUsrs = [], name = '', pinChat,
  }) => {
    const fd = new FormData();
    const cName = (name || '').split(',');
    fd.append('data', JSON.stringify({
      name: cName.length > 1 ? null : name,
      members: selectUsrs.map((u) => u.id),
      action: 'remove',
      actionMembers: [user.id],
    }));
    req({ method: 'PATCH', uri: `chat/${cId}`, data: fd })
      .then(({ data }) => {
        if (data?.error) {
          AlertToster(data.error, 'warning');
          return;
        }
        if (pinChat) {unpinChat(cId);}
        removeChatLocally(cId);
      })
      .catch(() => AlertToster('Could not leave the chat.', 'error'));
  };

  const deleteChat = (cId) => {
    if (!cId) {return;}
    const wasPinned = user?.pinnedChats?.includes(cId);
    req({ method: 'DELETE', uri: `chat/${cId}` })
      .then(({ data }) => {
        if (data?.error) {
          AlertToster(data.error, 'warning');
          return;
        }
        if (wasPinned) {unpinChat(cId);}
        removeChatLocally(cId);
      })
      .catch(() => AlertToster('Could not delete the chat.', 'error'));
  };

  const onPinChat = (chatId, action) => {
    setUser((u) => ({
      ...u,
      pinnedChats: action === 'Pin'
        ? [chatId, ...(u.pinnedChats ?? [])]
        : (u.pinnedChats ?? []).filter((p) => p !== chatId),
    }));
    req({ method: 'PATCH', uri: `chat/pin/${chatId}`, data: { action } })
      .catch(() => AlertToster(`Could not ${action.toLowerCase()} the chat.`, 'error'));
  };

  const onScrollChats = (e) => {
    const el = e.target;
    if (el.scrollHeight - (el.scrollTop + el.clientHeight) < 48 && pagination.chatHasNext) {
      getChats(pagination.chatHasNext);
    }
  };

  // Resolves true when the chat was created, so the modal knows whether to close.
  const onCreateChat = (fData) => {
    const members = selectedUsers.map((u) => u.id);
    if (members.length === 0) {
      AlertToster('Select at least one member.', 'warning');
      return Promise.resolve(false);
    }
    const fd = new FormData();
    if (fData.icon?.[0]) {fd.append('icon', fData.icon[0]);}
    fd.append('data', JSON.stringify({ name: fData.name?.trim() ?? '', members }));
    return req({ method: 'POST', uri: 'chat', data: fd })
      .then(({ data }) => {
        if (data?.error) {
          AlertToster(data.error, 'warning');
          return false;
        }
        latest.current.navigate(`/chat/${data.id}`);
        AlertToster('Chat created!', 'success');
        return true;
      })
      .catch(() => {
        AlertToster('Could not create the chat.', 'error');
        return false;
      });
  };

  const checkMemberAddOrRemove = (chatData) => {
    const memberIds = (chatData?.members ?? []).map((m) => m.id);
    const selMbid = [...selectedUsers, { id: user.id }].map((m) => m.id);
    if (memberIds.length > selMbid.length) {
      return { action: 'remove', actionMembers: memberIds.filter((m) => !selMbid.includes(m)) };
    }
    if (memberIds.length < selMbid.length) {
      return { action: 'created', actionMembers: selMbid.filter((m) => !memberIds.includes(m)) };
    }
    return { action: 'update', actionMembers: [] };
  };

  const onUpdateChat = (fData) => {
    const { name, id: chatId } = fData;
    const { action, actionMembers } = checkMemberAddOrRemove(actionModal.chatData);
    const fd = new FormData();
    if (fData.icon?.[0]) {fd.append('icon', fData.icon[0]);}
    fd.append('data', JSON.stringify({
      name: name?.trim() ?? '',
      members: [...selectedUsers.map((s) => s.id), user.id],
      action,
      actionMembers,
    }));
    return req({ method: 'PATCH', uri: `chat/${chatId}`, data: fd })
      .then(({ data }) => {
        if (data?.error) {
          AlertToster(data.error, 'warning');
          return false;
        }
        latest.current.navigate(`/chat/${data.id}`);
        AlertToster('Chat updated!', 'success');
        return true;
      })
      .catch(() => {
        AlertToster('Could not update the chat.', 'error');
        return false;
      });
  };

  useEffect(() => {
    const onDelete = (dChat) => {
      removeChatLocally(dChat.id);
      if (latest.current.user?.pinnedChats?.includes(dChat.id)) {unpinChat(dChat.id);}
    };
    const onCreate = (chat) => {
      dispatch((update, getState) => {
        const rest = getState().chatsStore.chats.filter((c) => c.id !== chat.id);
        update(setChats([chat, ...rest]));
      });
    };
    const onUpdate = (chat) => dispatch(setUpdateChat(chat));

    socket.on('deleteChat', onDelete);
    socket.on('createChat', onCreate);
    socket.on('chatUpdate', onUpdate);
    return () => {
      socket.off('deleteChat', onDelete);
      socket.off('createChat', onCreate);
      socket.off('chatUpdate', onUpdate);
    };
    // Handlers read live values through `latest`, so they are registered once per socket.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  return {
    getAvatar,
    deleteChat,
    getNameTruncate,
    onLeave,
    onPinChat,
    onScrollChats,
    onCreateChat,
    onUpdateChat,
    getChats,
    closeModal: () => dispatch(setActionModal({ show: false, chatData: null })),
  };
}
