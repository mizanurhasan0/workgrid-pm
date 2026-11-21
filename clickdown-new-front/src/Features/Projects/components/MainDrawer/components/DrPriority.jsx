import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Flag } from '../../../../../assets';
import { useProjectsCtx } from '../../../context/ProjectsProvider';
import Loading3 from '../../../../../Components/Loading3';
import { buildStorePayload } from '../Handler';
import { priorityChipClass } from '../../PBody/Bundle/bundleHelpers';
import Popover, { MenuItem } from '../../PBody/Bundle/TableComponents/Popover';

// `name` is the value stored on tasks; `aliases` are legacy spellings still found on older tasks.
const priorityList = [
  {
    name: 'Normal', label: 'Normal', iconClass: 'stroke-[#64748B] fill-[#64748B]', bgColor: 'bg-slate-600',
  },
  {
    name: 'Immediate', aliases: ['Immidate'], label: 'Immediate', iconClass: 'stroke-[#6239ED] fill-[#6239ED]', bgColor: 'bg-violet-700',
  },
  {
    name: 'Tomorrow', aliases: ['Tomorow'], label: 'Tomorrow', iconClass: 'stroke-[#FE7317] fill-[#FE7317]', bgColor: 'bg-orange-700',
  },
  {
    name: 'Usual', label: 'Usual', iconClass: 'stroke-[#22C55E] fill-[#22C55E]', bgColor: 'bg-green-700',
  },
  {
    name: 'Urgent', label: 'Urgent', iconClass: 'stroke-[#DC2626] fill-[#DC2626]', bgColor: 'bg-red-600',
  },
];

function DrPriority({
  tree,
  viewId,
  taskId,
  priority,
  updateTask: saveTask,
}) {
  const [load, setLoad] = useState(false);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const ctx = useProjectsCtx();
  // The drawer passes its own save function so it can re-read the task afterwards.
  const updateTask = saveTask || ctx.updateTask;
  const bundleInfo = useSelector((state) => state.projectStore.view?.find((v) => v.id === viewId)?.bundleInfo);

  const current = priorityList.find((p) => p.name === priority || p.aliases?.includes(priority)) || null;
  const shown = current || priorityList[0];

  function handleOptionClick(option) {
    setOpen(false);
    if (option.name === current?.name) {return;}
    updateTask({
      load: setLoad,
      taskId,
      storePayload: buildStorePayload({ bundleInfo, viewId, tree }),
      payload: { priority: option.name },
    });
  }

  if (load) {return (<div className="flex h-11 w-32 items-center"><Loading3 /></div>);}
  return (
    <div>
      <button
        ref={anchorRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-9 min-w-32 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium ${priorityChipClass[shown.name]}`}
      >
        <Flag className="h-4 w-4 stroke-current" />
        <span className="truncate">{current?.label || priority || 'Set priority'}</span>
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} label="Select priority" className="w-48 p-1">
        <div role="menu">
          {priorityList.map((option) => (
            <MenuItem key={option.name} selected={option.name === current?.name} onClick={() => handleOptionClick(option)}>
              <span className={`h-3 w-3 rounded-full ${option.bgColor}`} />
              {option.label}
            </MenuItem>
          ))}
        </div>
      </Popover>
    </div>
  );
}

export default DrPriority;
