import React, { createContext, useContext } from 'react';
import useUser from '../Hooks/useUser';

const auth = createContext();

export function AuthProvider({ children }) {
  return (
    <auth.Provider value={useUser()}>
      {children}
    </auth.Provider>
  );
}

export const useAuth = () => useContext(auth);
