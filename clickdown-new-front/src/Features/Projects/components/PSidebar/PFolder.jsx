import React, { useState } from 'react';
import { ChevronRight, Folder, Plus } from 'lucide-react';
import PFiles from './PFiles';

export default function PFolder({
  name,
  files,
  fileClick,
  folderNameClick,
  folderKey,
  handlePlusClick,
  projectId,
  index,
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ml-6">
      <div className="mx-2 flex items-center rounded-md hover:bg-text/10">
        <button
          type="button"
          aria-label={`${open ? 'Collapse' : 'Expand'} ${name}`}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex h-11 w-8 shrink-0 items-center justify-center rounded-md text-text-muted focus-visible:outline-2 focus-visible:outline-secondary md:h-10"
        >
          <ChevronRight size={16} aria-hidden="true" className={`transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
        </button>
        <button
          type="button"
          title={name}
          className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-md text-left text-sm text-text focus-visible:outline-2 focus-visible:outline-secondary md:h-10"
          onClick={(e) => folderNameClick(e, projectId, folderKey, index)}
        >
          <Folder size={16} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{name}</span>
        </button>
        {folderKey === 'sprint' ? (
          <button
            type="button"
            aria-label="Add sprint"
            title="Add sprint"
            onClick={(e) => handlePlusClick(e, projectId, folderKey)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-text-muted hover:text-brand focus-visible:outline-2 focus-visible:outline-secondary md:h-10 md:w-10"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        ) : ''}
      </div>
      {open && (
        <div className="ml-6">
          {files.length === 0 && (
            <p className="px-3 py-2 text-xs text-text-muted">Nothing here yet</p>
          )}
          {files.map((f) => (
            <PFiles
              key={f.id}
              fileName={f.name}
              projectId={projectId}
              sprintId={folderKey === 'sprint' ? f.id : undefined}
              onClick={(e) => fileClick(e, { folderKey, fileId: f.id, name: f.name })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
