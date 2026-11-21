import React, { createContext, useContext } from 'react';
import useEditor from '../Hooks/useMarkDown';
import useChats from '../Hooks/useChats';
import useMessages from '../Hooks/useMessages';

const chatContext = createContext(null);

export function ChatProvider({ children }) {
  const value = {
    ...useChats(),
    ...useMessages(),
    ...useEditor(),
  };
  return (
    <chatContext.Provider value={value}>
      {children}
    </chatContext.Provider>
  );
}

export const useChatCtx = () => useContext(chatContext);
