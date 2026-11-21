import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { ChevronRight } from 'lucide-react';
import { useProjectsCtx } from '../../../../context/ProjectsProvider';
import PFolder from './PFolder';
import Image from '../../../../../../Components/Image';

// A project row inside the copy/move picker. Choosing a folder copies or moves the selection.
export default function PList({
  project: {
    id,
    sprints,
    name,
    icon,
  }, action,
}) {
  const {
    createNewSprint,
    gbCopyMove,
  } = useProjectsCtx();

  const { taskSelected, projects } = useSelector((state) => state.projectStore);
  const [expanded, setExpanded] = useState(false);

  const sprintFiles = (sprints ?? []).map((s, i) => ({
    name: s?.title || `Sprint ${i + 1}`,
    id: s.id,
  }));

  // Target type: sprints are addressed by their id, backlog and bugs by their collection name
  const handleFileClick = (e, { folderKey, fileId }) => {
    e.stopPropagation();
    let type;
    let newViewId;
    if (folderKey === 'sprint') {
      const idx = (projects.find((p) => p.id === id)?.sprints ?? [])
        .findIndex((sp) => sp.id === fileId);
      newViewId = `sprint-${idx}|${id}`;
      type = fileId;
    } else {
      newViewId = `${fileId}|${id}`;
      type = fileId === 'bugs' ? 'bugs' : 'tasks';
    }
    const listOfTasks = taskSelected.map((t) => ({
      ...t,
      type,
      action,
      project: id,
      newViewId,
    }));
    gbCopyMove({ listOfTasks, action });
  };

  const handlePlusClick = (e, pId, folderKey) => {
    e.stopPropagation();
    if (folderKey === 'sprint') {createNewSprint(pId);}
  };

  const folders = [
    {
      name: 'Backlog Management',
      folderKey: 'backlogManagement',
      files: [
        { name: 'backlog', id: 'backlog' },
        { name: 'bugs', id: 'bugs' },
      ],
    },
    {
      name: 'Sprint folder',
      folderKey: 'sprint',
      files: sprintFiles,
    },
  ];

  return (
    <div className="w-full px-2 py-1 sm:w-64">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((v) => !v)}
        className="flex min-h-11 w-full items-center gap-2 rounded px-2 text-left hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:min-h-10"
      >
        <Image className="h-6 w-6 shrink-0 rounded-md bg-teal-50" src={icon} alt="" size="sm" />
        <span title={name} className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
        <ChevronRight size={16} aria-hidden="true" className={`shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded && (
        <div className="pl-3">
          {
            folders.map((f) => (
              <PFolder
                key={f.folderKey}
                name={f.name}
                folderKey={f.folderKey}
                files={f.files}
                projectId={id}
                fileClick={handleFileClick}
                handlePlusClick={handlePlusClick}
              />
            ))
          }
        </div>
      )}
    </div>
  );
}
