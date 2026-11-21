import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useProjectsCtx } from '../../../context/ProjectsProvider';

// Bulk status picker. Options come from the "Status" custom field.
export default function TopStatus({ onClose = () => { } }) {
  const taskSelected = useSelector((state) => state.projectStore.taskSelected);
  // null while loading; [] when the Status field does not exist
  const [options, setOptions] = useState(null);
  const { getCFValue, gpUpdateTask } = useProjectsCtx();

  useEffect(() => {
    let active = true;
    getCFValue('Status').then((found) => {
      if (!active) {return;}
      const field = found?.[0];
      if (!field || !Array.isArray(field.value)) {
        setOptions([]);
        return;
      }
      setOptions(field.value.map((o) => ({
        ...o, cf: field.id, value: o.fieldName, preColor: o.background, type: 'dropdown', name: 'status',
      })));
    });
    return () => { active = false; };
    // getCFValue is recreated on every render, so the lookup runs once per mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (option) => {
    gpUpdateTask({
      taskList: taskSelected.map(
        (t) => ({ ...t, customFields: { ...option, color: option.background } }),
      ),
    });
    onClose();
  };

  if (options === null) {
    return <p role="status" className="whitespace-nowrap rounded-md bg-surface-raised px-3 py-2 text-sm text-text">Loading statuses...</p>;
  }
  if (options.length === 0) {
    return <p role="status" className="whitespace-nowrap rounded-md bg-surface-raised px-3 py-2 text-sm text-text">Status field not found</p>;
  }
  return (
    <div className="max-h-80 min-w-48 overflow-y-auto rounded-md border border-border bg-surface-raised px-3 pb-3 shadow-lg">
      <div>
        <h2 className="whitespace-nowrap py-2 text-xs font-medium text-text-muted">Select status</h2>
      </div>
      {options.map((option, ind) => (
        <button
          type="button"
          key={`${option.value}-${ind}`}
          className="relative my-1 flex min-h-11 w-full items-center justify-start rounded-md py-1 text-sm font-medium text-text focus-visible:outline-2 focus-visible:outline-secondary md:min-h-9"
          onClick={() => choose(option)}
        >
          <div className="flex z-10 items-center px-2">
            <div style={{ backgroundColor: `${option.background}` }} className="mr-2 h-2 w-2 rounded-full" />
            <p>{option.fieldName}</p>
          </div>
          <div aria-hidden="true" className="absolute inset-0 rounded-md" style={{ background: `${option.background}`, opacity: 0.2 }} />
        </button>
      ))}
    </div>
  );
}
