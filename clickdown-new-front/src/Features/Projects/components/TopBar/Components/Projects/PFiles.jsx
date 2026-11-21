import React from 'react';
import { FileText } from 'lucide-react';

export default function PFiles({ fileName, onClick = (e) => { e.stopPropagation(); } }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={fileName}
      className="flex min-h-11 w-full items-center gap-2 rounded px-2 text-left text-sm capitalize text-text hover:bg-text/10 focus-visible:outline-2 focus-visible:outline-secondary md:min-h-9"
    >
      <FileText size={16} aria-hidden="true" className="shrink-0" />
      <span className="truncate">{fileName}</span>
    </button>
  );
}
