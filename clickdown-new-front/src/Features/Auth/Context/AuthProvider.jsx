import React, {
  createContext,
  useContext,
} from 'react';
import useLocalAuth from '../Hooks/useLocalAuth';

const authContext = createContext();

export function AuthProvider({ children }) {
  const value = useLocalAuth();

  return (
    <authContext.Provider
      value={value}
    >
      {children}
    </authContext.Provider>
  );
}

export const useAuthCtx = () => useContext(authContext);
