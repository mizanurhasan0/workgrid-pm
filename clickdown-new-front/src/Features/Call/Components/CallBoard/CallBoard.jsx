import React from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import FocusUser from './FocusUser';
import UserList from './UserList';

export default function CallBoard() {
  const focused = useSelector((state) => state.call.focused, shallowEqual);
  return (
    <div className={`flex h-full min-h-0 flex-col gap-3 ${focused ? 'md:grid md:grid-cols-12 md:gap-4' : ''}`}>
      <FocusUser />
      <UserList />
    </div>
  );
}
