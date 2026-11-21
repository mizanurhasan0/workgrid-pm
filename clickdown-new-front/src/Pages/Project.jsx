import React, { memo } from 'react';
import Projects from '../Features/Projects/Projects';

function Project() {
  return (
    <div className="w-full">
      <Projects />
    </div>
  );
}

export default memo(Project);
