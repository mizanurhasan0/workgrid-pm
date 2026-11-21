import React from 'react';
import UserContext from './Context/UserContext';
import Wrapper from './Wrapper/Wrapper';

export default function Setting() {
  return (
    <UserContext>
      <Wrapper />
    </UserContext>
  );
}
