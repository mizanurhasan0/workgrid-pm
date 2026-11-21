import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Cancel } from '../../../../assets';
import Btn from '../../../../Components/Btn';
import { CreateForm, UploadImage } from './Handler';
import { resetState } from '../../ChatReducer';
import { useChatCtx } from '../../Context/ChatProvider';

const initialName = (chat) => (chat?.name && !chat.name.includes(',') ? chat.name : '');

// Opened from the chat list (see ChatItem), which also fills the selected members.
export default function CreateChatModal() {
  const dispatch = useDispatch();
  const { onCreateChat, onUpdateChat, closeModal } = useChatCtx();
  const { actionModal } = useSelector((state) => state.chatsStore);
  const editing = !!actionModal.chatData;
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: { name: initialName(actionModal.chatData) },
  });
  const [chatImage, setChatImage] = useState(() => actionModal.chatData?.icon ?? null);

  const close = () => {
    closeModal();
    dispatch(resetState({ name: 'selectedUsers' }));
  };

  // The dialog stays open when saving fails so nothing typed is lost.
  const onSubmit = async (data) => {
    const saved = editing
      ? await onUpdateChat({ ...data, id: actionModal.chatData.id })
      : await onCreateChat(data);
    if (saved) {close();}
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {close();}
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // `close` only dispatches, so a fresh closure per render is harmless.
  });

  return (
    <div className="fixed inset-0 z-modal flex items-end justify-center overflow-y-auto overscroll-contain bg-scrim p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-dialog-title"
        className="max-h-dvh w-full max-w-md overflow-y-auto rounded-t-2xl bg-raised p-4 text-text shadow-elevated sm:rounded-2xl sm:p-6"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h2 id="chat-dialog-title" className="text-lg font-semibold">{editing ? 'Update chat' : 'New chat'}</h2>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-text-muted hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring "
            >
              <Cancel className="h-5 w-5" />
            </button>
          </div>
          <UploadImage register={register} chatImage={chatImage} setChatImage={setChatImage} />
          <CreateForm register={register} />
          <div className="flex pb-[env(safe-area-inset-bottom)]">
            <Btn type="submit" disabled={isSubmitting} className="ml-auto mt-4 rounded-lg bg-brand-solid px-8 disabled:opacity-60">
              {editing ? 'Update' : 'Create'}
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}
