import React, {
  createContext,
  useContext,
} from 'react';
import useUserData from '../Hooks/useUserData';

export const userCtx = createContext();
export default function UserContext({ children }) {
  const data = useUserData();
  return (
    <userCtx.Provider value={data}>
      {children}
    </userCtx.Provider>
  );
}
export const useUserCtx = () => useContext(userCtx);
