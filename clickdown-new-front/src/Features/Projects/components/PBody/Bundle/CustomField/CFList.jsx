import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import checkEqual from '../../../../../../Utils/checkEqual';
import Popover from '../TableComponents/Popover';
import CFNewCol from './CFNewCol';
import CFShowHide from './CFShowHide';

const tabClass = (active) => `min-h-11 flex-1 cursor-pointer whitespace-nowrap border-b-2 px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-secondary ${active ? 'border-secondary text-brand' : 'border-transparent text-text-muted hover:text-text dark:hover:text-info'}`;

/**
 * Column menu for a view: show/hide existing columns, or add a new one.
 * Rendered in a portal (Popover) so the sprint table never clips it.
 * `onCreate` / `onEdit` open the column form owned by the parent.
 */
export default function CFList({
  open, onClose, anchorRef, onCreate, onEdit,
}) {
  const [tab, setTab] = useState('showHide');
  // Always start on the first tab when the menu is reopened
  if (!open && tab !== 'showHide') {setTab('showHide');}
  const { projectId } = useParams();
  const customFields = useSelector(
    (state) => state.projectStore.projects.find((p) => p.id === projectId)?.customFields,
    checkEqual,
  );

  return (
    <Popover open={open} onClose={onClose} anchorRef={anchorRef} align="end" label="Manage columns" className="w-72 py-1">
      <div role="tablist" aria-label="Column actions" className="flex gap-1 border-b border-border px-2">
        <button type="button" role="tab" aria-selected={tab === 'showHide'} className={tabClass(tab === 'showHide')} onClick={() => setTab('showHide')}>Show/Hide</button>
        <button type="button" role="tab" aria-selected={tab === 'newCol'} className={tabClass(tab === 'newCol')} onClick={() => setTab('newCol')}>Add Column</button>
      </div>
      {customFields ? (
        <div className="max-h-[60dvh] overflow-y-auto">
          {tab === 'showHide'
            ? <CFShowHide customFields={customFields} onEdit={onEdit} />
            : <CFNewCol onCreate={onCreate} />}
        </div>
      ) : null}
    </Popover>
  );
}
