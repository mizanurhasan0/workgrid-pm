import React from 'react';
import { useDispatch } from 'react-redux';
import { setCustomField, resetCustomField } from '../../../../projectReducers';
import { useProjectsCtx } from '../../../../context/ProjectsProvider';

export default function CFNewCol({ onCreate }) {
  const { customFields } = useProjectsCtx();
  const dispatch = useDispatch();

  // Pick the field type, then let the parent open the create form
  function handleCreate(f) {
    dispatch(resetCustomField());
    if (f === 'dropdown') {dispatch(setCustomField({ type: f, dropdown: [{ name: 'option0', color: '#000000' }] }));}
    else {dispatch(setCustomField({ type: f }));}
    onCreate?.(f);
  }

  return (
    <div>
      <h4 className="bg-surface-alt py-2 text-center text-xs font-semibold uppercase text-text-muted">Create new Fields</h4>
      <ul className="flex flex-col gap-1 px-2 py-1">
        {customFields.map((f) => (
          <li key={f}>
            <button
              type="button"
              onClick={() => handleCreate(f)}
              className="flex min-h-11 w-full cursor-pointer items-center rounded px-2 text-left text-sm capitalize hover:bg-text/8 focus-visible:bg-text/8 focus-visible:outline-2 focus-visible:outline-secondary"
            >
              {f}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
