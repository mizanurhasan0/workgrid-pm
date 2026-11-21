import React, {
  createContext,
  useContext,
} from 'react';
import useCall from '../Hooks/useCall';

const callContext = createContext();

export function CallProvider({ children }) {
  const value = useCall();

  return (
    <callContext.Provider
      value={value}
    >
      {children}
    </callContext.Provider>
  );
}

export const useCallCtx = () => useContext(callContext);
