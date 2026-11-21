import React, {
  createContext,
  useContext,
} from 'react';
import useLocalForget from '../Hooks/useLocalForget';

const forgetContext = createContext();

export function ForgetProvider({ children }) {
  const value = useLocalForget();

  return (
    <forgetContext.Provider
      value={value}
    >
      {children}
    </forgetContext.Provider>
  );
}

export const useForgetCtx = () => useContext(forgetContext);
