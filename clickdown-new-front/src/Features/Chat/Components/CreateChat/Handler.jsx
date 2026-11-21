import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowDown,
  Cancel,
  Selected,
  Upload,
  defaultImg,
} from '../../../../assets';
import { useAuth } from '../../../../Context/AuthProvider';
import Image from '../../../../Components/Image';
import AlertToster from '../../../../Components/AlertToster';
import { removeSelectedUsers, setSelectedUsers } from '../../ChatReducer';

const imageSrc = (chatImage) => {
  if (chatImage instanceof Blob) {return null;}
  if (!chatImage) {return defaultImg;}
  if (String(chatImage).startsWith('https://')) {return chatImage;}
  return `${import.meta.env.VITE_SERVER_URL}/${chatImage}`;
};

function UploadImage({
  register,
  chatImage,
  setChatImage,
}) {
  // A picked file is shown through an object URL, which is released when it changes.
  const src = useMemo(
    () => (chatImage instanceof Blob ? URL.createObjectURL(chatImage) : imageSrc(chatImage)),
    [chatImage],
  );
  useEffect(() => () => {
    if (src?.startsWith('blob:')) {URL.revokeObjectURL(src);}
  }, [src]);

  return (
    <div className="flex items-center gap-4 pt-4">
      <img src={src} alt="Chat icon" className="h-16 w-16 shrink-0 rounded-full bg-border object-cover" />
      <div className="space-y-2 text-text-muted">
        <label htmlFor="chatImgUpload" className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 text-text has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-focus-ring">
          <Upload className="h-5 w-5" />
          <span className="text-sm font-semibold">Upload photo</span>
          <input
            type="file"
            id="chatImgUpload"
            accept="image/*"
            className="sr-only"
            {...register('icon', { onChange: (e) => setChatImage(e.target.files?.[0] ?? null) })}
          />
        </label>
        <p className="text-xs">A photo helps your teammates recognize this chat.</p>
      </div>
    </div>
  );
}

function CreateForm({ register }) {
  const dispatch = useDispatch();
  const pUsers = useSelector((state) => state.projectStore?.pUsers) ?? [];
  const { selectedUsers, actionModal } = useSelector((state) => state.chatsStore);
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const boxRef = useRef(null);

  const checked = (usr) => selectedUsers.some((u) => u.id === usr.id);
  const candidates = pUsers.filter((u) => u.id !== user?.id
    && u.name?.toLowerCase().includes(query.trim().toLowerCase()));

  // The member list closes on an outside click.
  useEffect(() => {
    if (!open) {return undefined;}
    const onPointer = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {setOpen(false);}
    };
    document.addEventListener('mousedown', onPointer);
    return () => document.removeEventListener('mousedown', onPointer);
  }, [open]);

  const removeUser = (usr) => {
    if (actionModal.chatData?.creator?.id === usr.id) {
      AlertToster('The chat creator cannot be removed.', 'warning');
      return;
    }
    if (actionModal.chatData && selectedUsers.length === 1) {
      AlertToster('A chat needs at least one other member.', 'warning');
      return;
    }
    dispatch(removeSelectedUsers(usr.id));
  };

  const toggleUser = (usr) => {
    if (checked(usr)) {removeUser(usr);}
    else {dispatch(setSelectedUsers(usr));}
  };

  return (
    <>
      <p id="members-label" className="pt-4 pb-1 text-sm font-medium text-text">Members</p>
      <div className="relative" ref={boxRef}>
        <div className="w-full cursor-pointer" onClick={() => setOpen(true)}>
          <div className="flex min-h-12 w-full flex-wrap items-center gap-2 rounded-lg border border-border bg-card py-2 pl-3 pr-12">
            {selectedUsers.length === 0 && <span className="text-sm text-text-muted">Select members</span>}
            {selectedUsers.map((usr) => (
              <div key={usr.id} className="flex items-center space-x-2 pr-1 max-w-full">
                <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full">
                  <Image src={usr.avatar} alt="" className="h-full w-full object-cover" />
                </div>
                <span className="truncate text-xs font-medium capitalize text-text">{usr.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${usr.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUser(usr);
                  }}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-focus-ring "
                >
                  <Cancel className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label={open ? 'Hide people' : 'Show people'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="absolute right-1 top-0.5 flex h-11 w-11 items-center justify-center rounded-lg text-text-muted focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          <ArrowDown className={`h-5 w-5 transition-transform duration-200 ${open ? '-rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute z-dropdown mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-border bg-raised p-3 text-sm shadow-elevated">
            <label htmlFor="member-search" className="sr-only">Search people</label>
            <input
              id="member-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people"
              maxLength={100}
              className="mb-2 h-11 w-full rounded-md border border-border bg-transparent px-3 text-base text-text"
            />
            <span className="block text-xs text-text-muted">Select one or more people</span>
            <ul className="mt-1">
              {candidates.map((usr) => (
                <li key={usr.id}>
                  <button
                    type="button"
                    aria-pressed={checked(usr)}
                    onClick={() => toggleUser(usr)}
                    className="flex min-h-11 w-full cursor-pointer items-center justify-between rounded-md px-1 text-left hover:bg-text/5 focus-visible:outline-2 focus-visible:outline-focus-ring"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
                        <Image src={usr.avatar} alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="truncate text-text">{usr.name}</span>
                    </span>
                    <Selected className={`${checked(usr) ? 'visible' : 'invisible'} ml-2 h-5 w-5 shrink-0 text-brand`} />
                  </button>
                </li>
              ))}
              {candidates.length === 0 && <li className="py-1 text-text-muted">No people found.</li>}
            </ul>
          </div>
        )}
      </div>
      <label htmlFor="chat-name" className="block pb-1 pt-4 text-sm font-medium text-text">Chat name</label>
      <input
        id="chat-name"
        type="text"
        maxLength={60}
        {...register('name')}
        placeholder="Development"
        className="h-12 w-full rounded-lg border border-border bg-transparent px-3 text-base text-text outline-none focus-visible:border-brand focus-visible:ring-1 focus-visible:ring-focus-ring"
      />
    </>
  );
}

export { UploadImage, CreateForm };
