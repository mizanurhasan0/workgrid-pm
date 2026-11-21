import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AlertToster from '../../../../../../Components/AlertToster';
import checkEqual from '../../../../../../Utils/checkEqual';
import { ArrowDown } from '../../../../../../assets';
import { useProjectsCtx } from '../../../../context/ProjectsProvider';
import {
  dayKey, fullDateText, noonOf, taskTypeFor, toDay,
} from '../bundleHelpers';
import Popover from './Popover';

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Date range picker used for task dates, custom date fields and sprint dates.
 * `cf` saves the range into a custom field, `sprint` saves it onto the sprint,
 * and `onApply` hands the range to the caller instead (used for bulk updates).
 * A single picked day is saved as a one day range. Days are saved at local noon, see `noonOf`.
 */
function Calendar({
  dueDate,
  setDueDate,
  tree,
  viewId,
  taskId,
  cf,
  sprint = false,
  onApply,
  endDate = null,
  anchorRef,
  load = () => { },
  onClose = () => { },
}) {
  const from = toDay(dueDate?.from);
  const to = toDay(dueDate?.to);
  const [shown, setShown] = useState(() => from || toDay(endDate) || new Date());
  const { updateTask, onSprintDateUp } = useProjectsCtx();
  const { bundleInfo } = useSelector((state) => state.projectStore
    .view.find((v) => v.id === viewId) || {}, checkEqual);

  const year = shown.getFullYear();
  const month = shown.getMonth();
  const firstDayWeekDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalWeek = Math.ceil((firstDayWeekDay + daysInMonth) / 7);
  // First cell is the Sunday on or before the 1st of the month
  const cells = Array.from(
    { length: totalWeek * 7 },
    (_, i) => new Date(year, month, 1 - firstDayWeekDay + i),
  );

  const fromKey = dayKey(from);
  const toKey = dayKey(to);
  const isEdge = (day) => dayKey(day) === fromKey || dayKey(day) === toKey;
  const isInRange = (day) => fromKey !== null && toKey !== null
    && dayKey(day) > fromKey && dayKey(day) < toKey;
  const totalDays = from && to ? Math.round((to - from) / 86400000) + 1 : (from ? 1 : 0);
  const todayKey = dayKey(new Date());

  // First click starts a range, the second ends it (swapped when earlier), a third starts over
  const handleDateClick = (day) => {
    if (!from || (from && to)) {setDueDate({ from: day, to: null });}
    else if (day < from) {setDueDate({ from: day, to: from });}
    else {setDueDate({ from, to: day });}
  };

  const clearRange = () => setDueDate({ from: null, to: null });

  function setSate() {
    if (!from) {
      AlertToster('Pick a date first', 'warning');
      return;
    }
    const range = { startDate: noonOf(from), endDate: noonOf(to || from) };
    if (onApply) {
      onApply(range);
    } else if (sprint) {
      onSprintDateUp({
        sprintId: bundleInfo?.sprintId,
        projectId: bundleInfo?.projectId,
        ...range,
      });
    } else {
      updateTask({
        load,
        taskId,
        storePayload: {
          tree,
          viewId,
          taskType: taskTypeFor(bundleInfo) ?? 'tasks',
          sprintId: bundleInfo?.sprintId,
          ...(cf && { dataType: cf.type }),
        },
        payload: cf
          ? { customFields: { cf: cf.id, value: range, name: cf.name } }
          : range,
      });
    }
    onClose();
  }

  return (
    <Popover open onClose={onClose} anchorRef={anchorRef} modal label="Choose dates">
      <div
        onContextMenu={(e) => { e.preventDefault(); clearRange(); }}
        className="flex w-[min(26rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] flex-col overflow-y-auto overflow-hidden rounded-lg sm:w-auto sm:flex-row"
      >
        <div className="p-3 sm:p-4">
          <div className="flex items-center justify-between pb-2">
            <button type="button" aria-label="Previous month" onClick={() => setShown(new Date(year, month - 1, 1))} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md hover:bg-text/8">
              <ArrowDown className="rotate-90 stroke-brand" />
            </button>
            <p aria-live="polite" className="text-sm font-semibold">{`${monthNames[month]} ${year}`}</p>
            <button type="button" aria-label="Next month" onClick={() => setShown(new Date(year, month + 1, 1))} className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-md hover:bg-text/8">
              <ArrowDown className="rotate-[270deg] stroke-brand" />
            </button>
          </div>
          <table className="mx-auto border-collapse">
            <thead>
              <tr>
                {weekdays.map((each) => (
                  <th className="h-8 w-11 text-center text-xs font-medium text-text-muted sm:w-9" key={each}>
                    {each}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalWeek }, (_, week) => (
                <tr key={`week-${cells[week * 7].getTime()}`}>
                  {cells.slice(week * 7, week * 7 + 7).map((day) => {
                    const selected = isEdge(day);
                    const inMonth = day.getMonth() === month;
                    const today = dayKey(day) === todayKey;
                    return (
                      <td key={day.getTime()} className={`p-0 text-center ${isInRange(day) ? 'bg-[color-mix(in_srgb,var(--brand-solid)_22%,var(--surface-raised))]' : ''}`}>
                        <button
                          type="button"
                          aria-label={fullDateText(day)}
                          aria-pressed={selected}
                          onClick={() => handleDateClick(day)}
                          className={`h-11 w-11 cursor-pointer rounded-lg text-sm tabular-nums sm:h-9 sm:w-9 ${selected ? 'bg-brand-solid font-semibold text-on-brand' : `${inMonth ? 'text-text' : 'text-text-muted/70'} hover:bg-text/8`} ${today && !selected ? 'ring-1 ring-secondary' : ''}`}
                        >
                          {day.getDate()}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-2 border-t border-border bg-surface-alt p-3 sm:w-44 sm:border-t-0 sm:border-l sm:p-4">
          <p className="text-sm font-semibold text-brand">
            {totalDays > 1 ? `Total ${totalDays} days` : 'Due date'}
          </p>
          <p className="rounded-md border border-border px-3 py-2 text-sm text-text-muted tabular-nums">
            {from ? fullDateText(from) : 'Start date'}
          </p>
          <p className="rounded-md border border-border px-3 py-2 text-sm text-text-muted tabular-nums">
            {to ? fullDateText(to) : (from ? fullDateText(from) : 'End date')}
          </p>
          <div className="mt-auto flex gap-2 sm:flex-col">
            <button type="button" onClick={clearRange} className="min-h-11 flex-1 cursor-pointer rounded-md border border-border text-sm font-medium text-text-muted hover:bg-text/8">
              Clear
            </button>
            <button type="button" onClick={setSate} className="min-h-11 flex-1 cursor-pointer rounded-md bg-brand-solid text-sm font-medium text-on-brand hover:bg-brand-solid-hover">
              Set date
            </button>
            <button type="button" onClick={onClose} className="min-h-11 flex-1 cursor-pointer rounded-md text-sm font-medium text-text-muted hover:bg-text/8 sm:hidden">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Popover>
  );
}
export default Calendar;
