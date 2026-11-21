import React, { useRef, useState } from 'react';
import Calendar from '../../../TableComponents/Calander';
import { DateButton } from '../../../TableComponents/DueDate';
import Loading3 from '../../../../../../../../Components/Loading3';
import { fullDateText, shortDateText, toDay } from '../../../bundleHelpers';

// Used for custom date fields (`cf` set) and for the sprint header (`sprint` set)
export default function CFDueDate({
  taskInfo: {
    tree,
    viewId,
    taskId,
    endDate = null,
    startDate = null,
  },
  sprint = false,
  cf,
}) {
  const [dueDate, setDueDate] = useState({
    from: startDate,
    to: endDate,
  });
  const anchorRef = useRef();
  const [open, setOpen] = useState(false);
  const [load, setLoad] = useState(false);

  // Follow the saved dates when they change from elsewhere
  const [seenDates, setSeenDates] = useState({ startDate, endDate });
  if (seenDates.startDate !== startDate || seenDates.endDate !== endDate) {
    setSeenDates({ startDate, endDate });
    setDueDate({ from: startDate, to: endDate });
  }

  const saved = cf?.result?.endDate || dueDate.to || dueDate.from;
  const label = sprint ? 'Set sprint dates' : `Set ${cf?.name ?? 'date'}`;

  if (load) {return <div className="flex min-h-11 items-center"><Loading3 /></div>;}
  return (
    <>
      {sprint ? (
        <button
          ref={anchorRef}
          type="button"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-9 cursor-pointer items-center rounded-md px-2 text-xs text-text-muted tabular-nums hover:bg-text/8"
        >
          {startDate && endDate
            ? `${fullDateText(startDate)} - ${fullDateText(endDate)}`
            : (shortDateText(saved) || 'Set dates')}
        </button>
      ) : (
        <DateButton
          buttonRef={anchorRef}
          value={saved}
          label={label}
          expanded={open}
          onClick={() => setOpen((o) => !o)}
        />
      )}
      {open && (
        <Calendar
          tree={tree}
          viewId={viewId}
          taskId={taskId}
          setDueDate={setDueDate}
          dueDate={dueDate}
          endDate={toDay(saved)}
          cf={cf}
          sprint={sprint}
          anchorRef={anchorRef}
          load={setLoad}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
