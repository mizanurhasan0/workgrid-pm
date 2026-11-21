import React, { createContext, useContext } from 'react';
import useProjects from '../hook/useProjects';
import useTasks from '../hook/useTasks';

const context = createContext(null);

export default function ProjectsProvider({ children }) {
  // Both hooks return fresh function objects on every render, so memoising the merged
  // value would never hit its cache; pass it straight through.
  const value = { ...useProjects(), ...useTasks() };

  return (
    <context.Provider value={value}>
      {children}
    </context.Provider>
  );
}

export const useProjectsCtx = () => useContext(context);
