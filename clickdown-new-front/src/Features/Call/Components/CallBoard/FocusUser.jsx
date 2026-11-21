import React from 'react';
import { useSelector } from 'react-redux';
import Video from '../Video';
import { useCallCtx } from '../../Context/CallProvider';
import Avatar from '../../../../Components/Avatar';
import checkEqual from '../../../../Utils/checkEqual';

const serverUrl = () => import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

export default function FocusUser() {
  const { getStream } = useCallCtx();
  const { focused, users } = useSelector((state) => ({
    focused: state.call.focused,
    users: state.call.users,
  }), checkEqual);
  const focusedUser = focused ? users[focused] : null;

  if (!focusedUser?.id) {return null;}

  const avatar = focusedUser.avatar || '';
  const poster = avatar.startsWith('https://') ? avatar : `${serverUrl()}/${avatar}`;

  return (
    <div id="focused-user" className="relative min-h-48 flex-1 overflow-hidden rounded-xl md:col-span-9 md:min-h-0 lg:col-span-10">
      {focusedUser.media?.video ? (
        <Video
          className="absolute inset-0 h-full w-full rounded-xl bg-raised object-contain"
          muted
          stream={getStream(focused) ?? null}
          poster={poster}
        />
      ) : (
        <div className="absolute inset-0 rounded-xl border border-border bg-raised">
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <Avatar alt="" className="h-28 w-28 rounded-full object-cover sm:h-40 sm:w-40 lg:h-56 lg:w-56" src={avatar} />
            <p className="text-base font-semibold capitalize text-text">{focusedUser.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
