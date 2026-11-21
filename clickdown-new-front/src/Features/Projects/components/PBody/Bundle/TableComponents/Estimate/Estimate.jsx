import React, { useRef, useState } from 'react';
import { HourIcon, Timer } from '../../../../../../../assets';
import { useProjectsCtx } from '../../../../../context/ProjectsProvider';
import Loading3 from '../../../../../../../Components/Loading3';
import AlertToster from '../../../../../../../Components/AlertToster';
import { parseEstimate, taskTypeFor } from '../../bundleHelpers';
import Popover from '../Popover';
import { useSelector } from 'react-redux';
import checkEqual from '../../../../../../../Utils/checkEqual';

export default function Estimate({
  tree,
  viewId,
  taskId,
  estimatedTime,
}) {
  const { updateTask } = useProjectsCtx();
  const anchorRef = useRef(null);
  const [load, setLoad] = useState(false);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const { bundleInfo } = useSelector((state) => state.projectStore
    .view.find((v) => v.id === viewId) || {}, checkEqual);
  const estimate = estimatedTime || '';

  const openEditor = () => {
    setDraft(estimate);
    setOpen((o) => !o);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const value = parseEstimate(draft);
    if (!value) {
      AlertToster('Use d, h and m units, for example 1d, 2h30m or 45m', 'warning');
      return;
    }
    setOpen(false);
    if (value === estimate) {return;}
    updateTask({
      load: setLoad,
      taskId,
      storePayload: {
        tree,
        viewId,
        taskType: taskTypeFor(bundleInfo),
        sprintId: bundleInfo?.sprintId,
        dataType: 'input',
      },
      payload: {
        estimate: value,
      },
    });
  };

  if (load) {return <div className="flex min-h-11 items-center"><Loading3 /></div>;}
  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        aria-label={estimate ? `Time estimate: ${estimate}` : 'Set time estimate'}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openEditor}
        className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-1 rounded-md px-1 text-sm text-text tabular-nums hover:bg-text/8"
      >
        {estimate ? (
          <>
            <HourIcon className="h-4 w-4 shrink-0 stroke-subText " />
            <span>{estimate}</span>
          </>
        ) : <Timer className="stroke-subText " />}
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} label="Time estimate" className="w-72 p-3">
        <form onSubmit={onSubmit} className="space-y-2">
          <label htmlFor={`estimate-${taskId}`} className="block text-sm font-medium">Time estimate</label>
          <input
            id={`estimate-${taskId}`}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            inputMode="text"
            placeholder="1d 2h 30m"
            className="h-11 w-full rounded-md border border-border bg-transparent px-3 text-sm tabular-nums outline-hidden focus:border-secondary"
          />
          <p className="text-xs text-text-muted">Use d, h and m, like 1d, 2h30m or 45m. Press Enter to save.</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="min-h-11 cursor-pointer rounded-md px-3 text-sm text-text-muted hover:bg-text/8">Cancel</button>
            <button type="submit" className="min-h-11 cursor-pointer rounded-md bg-brand-solid px-4 text-sm font-medium text-on-brand hover:bg-brand-solid-hover">Save</button>
          </div>
        </form>
      </Popover>
    </>
  );
}
