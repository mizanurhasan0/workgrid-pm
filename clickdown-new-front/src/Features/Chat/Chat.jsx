import React from 'react';
import Wrapper from './Components/Wrapper';
import { ChatProvider } from './Context/ChatProvider';

export default function Chat() {
  return (
    <ChatProvider>
      <Wrapper />
    </ChatProvider>
  );
}
