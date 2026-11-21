import React from 'react';
import ProjectsProvider from './context/ProjectsProvider';
import ProjectsWrapper from './components/ProjectsWrapper';

export default function Projects() {
  return (
    <ProjectsProvider>
      <ProjectsWrapper />
    </ProjectsProvider>
  );
}
