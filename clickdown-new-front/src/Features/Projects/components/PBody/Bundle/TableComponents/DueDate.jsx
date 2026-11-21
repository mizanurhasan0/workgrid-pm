import React, { useRef, useState } from 'react';
import Calendar from './Calander';
import { CalendarIcon } from '../../../../../../assets';
import Loading3 from '../../../../../../Components/Loading3';
import { shortDateText, toDay } from '../bundleHelpers';

// Kept for the other date cells: the short date text, or the calendar icon when empty
export function formatShortDate(value) {
  const text = shortDateText(value);
  return text || <CalendarIcon />;
}

export function DateButton({
  value, label, onClick, expanded, buttonRef,
}) {
  const text = shortDateText(value);
  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={text ? `${label}: ${text}` : label}
      aria-haspopup="dialog"
      aria-expanded={expanded}
      onClick={onClick}
      className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md px-1 text-sm font-normal text-text tabular-nums whitespace-nowrap hover:bg-text/8"
    >
      {text || <CalendarIcon className="stroke-subText " />}
    </button>
  );
}

export default function DueDate({
  tree,
  viewId,
  taskId,
  endDate,
}) {
  const [dueDate, setDueDate] = useState({ from: null, to: null });
  const anchorRef = useRef(null);
  const [load, setLoad] = useState(false);
  const [open, setOpen] = useState(false);

  const openCalendar = () => {
    // Start from the saved day so the picker shows what the cell shows
    setDueDate({ from: null, to: null });
    setOpen((o) => !o);
  };

  if (load) {return <div className="flex min-h-11 items-center"><Loading3 /></div>;}
  return (
    <>
      <DateButton buttonRef={anchorRef} value={endDate} label="Set due date" expanded={open} onClick={openCalendar} />
      {open && (
        <Calendar
          tree={tree}
          viewId={viewId}
          taskId={taskId}
          setDueDate={setDueDate}
          dueDate={dueDate}
          endDate={toDay(endDate)}
          anchorRef={anchorRef}
          load={setLoad}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
