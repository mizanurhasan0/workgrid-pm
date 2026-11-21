import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import ChatUserList from './Chats/Chats';
import useGetData from '../../../Hooks/useGetData';
import { setChats, setPaginates } from '../ChatReducer';
import Loading2 from '../../../Components/Loading2';
import AlertToster from '../../../Components/AlertToster';
import CreateChatModal from './CreateChat/CreateChatModal';
import ChatBody from './ChatBody/ChatBody';
import ChatDetails from './ChatDetails/ChatDetails';
import { EmptyMsg } from './ChatBody/Handler';
import useKeyboardHeight from '../Hooks/useVisualViewport';

export default function Wrapper() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { actionModal } = useSelector((state) => state.chatsStore);
  // The details sheet belongs to one chat: it is open while this holds the open chat's id.
  const [detailsFor, setDetailsFor] = useState(null);
  const keyboardHeight = useKeyboardHeight();
  const { loading, error } = useGetData('chat?page=1', (res) => {
    const docs = res?.docs ?? [];
    dispatch(setChats(docs));
    dispatch(setPaginates({ name: 'chatHasNext', value: res?.nextPage }));
    // Open the first chat when an unknown chat is in the URL, and the create page when
    // there is none. /chat/create is the list-only landing pane on phones.
    const known = docs.some((c) => c.id === id);
    if (docs.length === 0) {
      if (id !== 'create') {navigate('/chat/create', { replace: true });}
    } else if (id !== 'create' && !known) {
      navigate(`/chat/${docs[0].id}`, { replace: true });
    }
  });

  useEffect(() => {
    if (error) {AlertToster('Could not load chats.', 'error');}
  }, [error]);

  if (loading) {return <Loading2 />;}

  // On phones the chat list and the open chat take turns, and details open as a sheet.
  const hasOpenChat = id !== 'create';
  return (
    <>
      <div
        className="flex h-full min-h-0 w-full min-w-0 bg-app"
        style={keyboardHeight ? { height: keyboardHeight } : undefined}
      >
        <div className={`${hasOpenChat ? 'hidden md:flex' : 'flex'} h-full min-h-0 w-full min-w-0 shrink-0 md:w-72 lg:w-80 xl:w-96`}>
          <ChatUserList />
        </div>
        {hasOpenChat ? (
          <>
            <ChatBody onOpenDetails={() => setDetailsFor(id)} />
            <ChatDetails open={detailsFor === id} onClose={() => setDetailsFor(null)} />
          </>
        ) : (
          <div className="hidden min-w-0 flex-1 border-l border-border md:flex">
            <EmptyMsg title="Select a chat" hint="Pick a conversation from the list or start a new one." />
          </div>
        )}
      </div>
      {actionModal?.show ? <CreateChatModal /> : ''}
    </>
  );
}
