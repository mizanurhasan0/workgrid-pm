import React from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import AlertToster from '../../../../../Components/AlertToster';
import { useProjectsCtx } from '../../../context/ProjectsProvider';
import { isValidEstimate } from '../../PBody/Bundle/bundleHelpers';

// Bulk time estimate for the selected tasks
export default function TopEstimate({ onClose = () => { } }) {
  const { handleSubmit, register, reset } = useForm();
  const { gpUpdateTask } = useProjectsCtx();
  const taskSelected = useSelector((state) => state.projectStore.taskSelected);

  const onSubmit = (data) => {
    const value = (data.estimate ?? '').trim();
    if (!value) {return;}
    if (!isValidEstimate(value)) {
      AlertToster('Use h, d or m units, for example 1h30m', 'warning');
      return;
    }
    gpUpdateTask({
      taskList: taskSelected.map((t) => ({ ...t, estimate: value })),
    });
    reset();
    onClose();
  };

  return (
    <div className="timerContent z-50 rounded-md border border-border bg-surface-raised px-4 py-2 text-text shadow-2xl">
      <div className="flex items-center justify-center py-2">
        <div className="flex items-center gap-1 pt-2">
          <div className="flex items-center gap-1 text-sm font-semibold text-text">
            <p className="whitespace-nowrap">Time Estimate </p>
            <p className="flex h-6 w-6 cursor-help items-center justify-center rounded-full bg-text-muted text-center text-xs text-surface" title="Use h, d or m units. Try 1h, 1h30m or 2d.">?</p>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="pl-4 pt-3">
          <input
            spellCheck={false}
            {...register('estimate')}
            aria-label="Time estimate"
            type="text"
            className="timer inline-block"
            pattern="[0-9mdh]*"
            placeholder="Type in Time"
          />
        </form>
      </div>
      <hr />
      <p className="flex items-center justify-end pt-2 text-xs text-text-muted">Press Enter to save</p>
    </div>
  );
}
