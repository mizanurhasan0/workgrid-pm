import { useSelector } from 'react-redux';
import React, { useRef, useState } from 'react';
import { ArrowDown } from '../../../../../../../assets';
import { useProjectsCtx } from '../../../../../context/ProjectsProvider';
import checkEqual from '../../../../../../../Utils/checkEqual';
import AlertToster from '../../../../../../../Components/AlertToster';
import Loading3 from '../../../../../../../Components/Loading3';
import { taskTypeFor } from '../../bundleHelpers';
import Popover, { MenuItem } from '../Popover';

const EMPTY_STATUS = { fieldName: 'Set status', background: '#94A3B8' };

const sameName = (a, b) => String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase();

// Status colours are user defined, so the chip is a 20% tint of the colour with a solid dot.
// Text stays neutral (dark on light, light on dark), which keeps AA contrast for any colour.
export function StatusChip({ option, children }) {
  return (
    <span className="relative inline-flex h-7 max-w-full items-center gap-1.5 overflow-hidden rounded-full px-2.5 text-xs font-medium text-text">
      <span aria-hidden="true" className="absolute inset-0" style={{ backgroundColor: option.background, opacity: 0.2 }} />
      <span aria-hidden="true" className="relative h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: option.background }} />
      <span className="relative truncate">{option.fieldName}</span>
      {children}
    </span>
  );
}

export default function StatusCell({
  taskInfo: {
    taskId, tree, viewId,
  }, cf,
}) {
  const { updateTask } = useProjectsCtx();
  const anchorRef = useRef();
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);

  const { bundleInfo } = useSelector((state) => state.projectStore
    .view.find((v) => v.id === viewId) || {}, checkEqual);

  const options = Array.isArray(cf?.value) ? cf.value : [];
  const current = (cf?.result && options.find((o) => sameName(o?.fieldName, cf.result)))
    || EMPTY_STATUS;

  const reqUpdateStatus = (option) => {
    if (!option) {return;}
    if (sameName(cf?.result, option.fieldName)) {
      AlertToster('Already selected', 'warning');
      return;
    }
    updateTask({
      load: setLoad,
      taskId,
      storePayload: {
        tree,
        viewId,
        taskType: taskTypeFor(bundleInfo),
        sprintId: bundleInfo?.sprintId,
        dataType: cf.type,
      },
      payload: {
        customFields: {
          cf: cf.id,
          name: cf.name,
          value: option.fieldName,
          color: option.background,
          preColor: current?.background,
        },
      },
    });
  };

  const handleOptionClick = (option) => {
    setOpen(false);
    reqUpdateStatus(option);
  };

  if (load) {return <div className="flex min-h-11 w-28 items-center justify-center"><Loading3 /></div>;}
  return (
    <div className="flex min-h-11 w-28 items-center">
      <button
        ref={anchorRef}
        type="button"
        aria-label={`${cf?.name ?? 'Status'}: ${current.fieldName}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex min-w-0 max-w-full cursor-pointer items-center"
      >
        <StatusChip option={current}>
          <ArrowDown className="relative h-3 w-3 shrink-0 opacity-70" />
        </StatusChip>
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} label={`Select ${cf?.name ?? 'status'}`} className="w-56 p-1">
        <div role="menu">
          <p className="px-3 py-2 text-xs font-medium text-text-muted">{cf?.name ?? 'Status'}</p>
          {options.map((option, i) => (
            <MenuItem key={`${option.fieldName}-${i}`} selected={sameName(option.fieldName, current.fieldName)} onClick={() => handleOptionClick(option)}>
              <StatusChip option={option} />
            </MenuItem>
          ))}
          {options.length === 0 && <p className="px-3 py-2 text-sm text-text-muted">No options yet</p>}
        </div>
      </Popover>
    </div>
  );
}
