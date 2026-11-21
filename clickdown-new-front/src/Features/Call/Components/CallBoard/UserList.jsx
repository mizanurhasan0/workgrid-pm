import React from 'react';
import { useSelector } from 'react-redux';
import Avatar from '../../../../Components/Avatar';
import { useAuth } from '../../../../Context/AuthProvider';
import { useCallCtx } from '../../Context/CallProvider';
import Video from '../Video';
import checkEqual from '../../../../Utils/checkEqual';

export default function UserList() {
  const { setOnFocusUser, getStream } = useCallCtx();
  const { focused, users } = useSelector((state) => ({
    focused: state.call.focused,
    users: state.call.users,
  }), checkEqual);
  const { user: authUser } = useAuth();

  const showVideo = (user) => !!user.media?.video && authUser?.id !== user.id;

  // Tiles: one column on phones, two on tablets, auto-fit on desktop. With a focused user
  // they become a strip (phones) or a side column (md and up).
  const layout = focused
    ? 'flex gap-3 overflow-x-auto md:col-span-3 md:flex-col md:overflow-y-auto md:overflow-x-hidden lg:col-span-2'
    : 'grid h-full auto-rows-[minmax(10rem,1fr)] grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(16rem,1fr))]';

  return (
    <div className={layout}>
      {Object.values(users).map((user) => {
        const isFocused = focused === user.id;
        const live = !!getStream(user.id) && showVideo(user);
        return (
          <button
            type="button"
            key={user.id}
            aria-pressed={isFocused}
            aria-label={`${isFocused ? 'Unfocus' : 'Focus'} ${user.name}`}
            onClick={() => setOnFocusUser(user)}
            className={`relative flex min-h-32 shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-raised text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring ${focused ? 'h-32 w-44 md:h-auto md:w-full' : ''} ${isFocused ? 'ring-2 ring-focus-ring' : ''}`}
          >
            {live ? (
              <Video className="absolute inset-0 h-full w-full object-cover" stream={getStream(user.id)} muted={!user.media?.audio} />
            ) : (
              <span className="flex flex-1 items-center justify-center p-3 pb-0">
                <Avatar alt="" className="h-16 w-16 object-cover sm:h-20 sm:w-20" src={user.avatar} />
              </span>
            )}
            <span className="relative mt-auto bg-gradient-to-t from-black/75 to-transparent px-3 pb-2 pt-6 text-xs font-semibold capitalize text-white">
              <span className="block truncate">{user.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
