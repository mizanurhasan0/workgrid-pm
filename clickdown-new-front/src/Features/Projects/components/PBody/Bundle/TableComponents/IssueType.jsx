import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Bugs, IssueOthers } from '../../../../../../assets';
import { useProjectsCtx } from '../../../../context/ProjectsProvider';
import checkEqual from '../../../../../../Utils/checkEqual';
import Loading3 from '../../../../../../Components/Loading3';
import { taskTypeFor } from '../bundleHelpers';
import Popover, { MenuItem } from './Popover';

// `value` is the issue type stored on the task (note the trailing space of one stored value)
const values = [
  { value: 'None', class: 'fill-slate-300 bg-slate-200 dark:bg-slate-600 dark:fill-slate-300' },
  { value: 'Bug', class: 'fill-white bg-red-600' },
  { value: 'Epic', class: 'fill-white bg-purple-600' },
  { value: 'Task', class: 'fill-white bg-sky-600' },
  { value: 'Sub task', class: 'fill-white bg-pink-500' },
  { value: 'Improvement ', class: 'fill-white bg-orange-600' },
  { value: 'New feature', class: 'fill-white bg-green-600' },
];

const findType = (type) => values.find((v) => v.value === type) || values[0];

function TypeIcon({ option }) {
  const Icon = option.value === 'Bug' ? Bugs : IssueOthers;
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center">
      <Icon className={`${option.class} h-full w-full rounded-md p-1 dark:brightness-90`} />
    </span>
  );
}

function IssueType({
  viewId,
  taskId,
  type,
  tree,
}) {
  const anchorRef = useRef();
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { updateTask } = useProjectsCtx();
  const { bundleInfo } = useSelector((state) => state.projectStore
    .view.find((v) => v.id === viewId) || {}, checkEqual);
  const selectedOption = findType(type);

  const options = values.filter(
    (v) => v.value.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const close = () => { setOpen(false); setSearchQuery(''); };

  function handleOptionClick(option) {
    close();
    if (option.value === selectedOption.value) {return;}
    updateTask({
      load: setLoad,
      taskId,
      storePayload: {
        viewId,
        tree,
        taskType: taskTypeFor(bundleInfo),
        sprintId: bundleInfo?.sprintId,
        dataType: 'dropdown',
      },
      payload: {
        type: option.value,
      },
    });
  }

  if (load) {return <div className="flex min-h-11 w-8 items-center justify-center"><Loading3 /></div>;}
  return (
    <div className="flex min-h-11 items-center">
      <button
        ref={anchorRef}
        type="button"
        aria-label={`Issue type: ${selectedOption.value.trim()}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={selectedOption.value.trim()}
        onClick={() => (open ? close() : setOpen(true))}
        className="flex min-h-9 min-w-8 cursor-pointer items-center justify-center rounded-md hover:bg-text/8"
      >
        <TypeIcon option={selectedOption} />
      </button>
      <Popover open={open} onClose={close} anchorRef={anchorRef} label="Select issue type" className="w-56 p-1">
        <input
          onChange={(e) => setSearchQuery(e.target.value)}
          value={searchQuery}
          aria-label="Search issue types"
          className="mb-1 h-10 w-full rounded-md border border-border bg-transparent px-3 text-sm outline-hidden focus:border-secondary"
          type="search"
          name="search"
          placeholder="Search types"
        />
        <div role="menu">
          {options.map((option) => (
            <MenuItem key={option.value} selected={option.value === selectedOption.value} onClick={() => handleOptionClick(option)}>
              <TypeIcon option={option} />
              {option.value.trim()}
            </MenuItem>
          ))}
          {options.length === 0 && (
            <p className="px-3 py-2 text-sm text-text-muted">No matching types</p>
          )}
        </div>
      </Popover>
    </div>
  );
}

export default IssueType;
