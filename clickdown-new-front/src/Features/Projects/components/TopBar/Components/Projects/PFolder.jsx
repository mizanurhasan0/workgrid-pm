import React, { useState } from 'react';
import { ChevronRight, Folder, Plus } from 'lucide-react';
import PFiles from './PFiles';

export default function PFolder({
  name,
  files,
  fileClick,
  folderKey,
  handlePlusClick,
  projectId,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="flex items-center">
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded px-2 text-left text-sm text-text hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:min-h-9"
        >
          <ChevronRight size={16} aria-hidden="true" className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-90' : ''}`} />
          <Folder size={16} aria-hidden="true" className="shrink-0" />
          <span className="truncate">{name}</span>
        </button>
        {folderKey === 'sprint' ? (
          <button
            type="button"
            aria-label="Add sprint"
            title="Add sprint"
            onClick={(e) => handlePlusClick(e, projectId, folderKey)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded text-text-muted hover:text-brand focus-visible:outline-2 focus-visible:outline-secondary md:h-9 md:w-9"
          >
            <Plus size={16} aria-hidden="true" />
          </button>
        ) : ''}
      </div>
      {open && (
        <div className="pl-6">
          {files.length === 0 && <p className="px-2 py-2 text-xs text-text-muted">Nothing here yet</p>}
          {files.map((f) => (
            <PFiles
              key={f.id}
              fileName={f.name}
              onClick={(e) => fileClick(e, { folderKey, fileId: f.id, name: f.name })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
