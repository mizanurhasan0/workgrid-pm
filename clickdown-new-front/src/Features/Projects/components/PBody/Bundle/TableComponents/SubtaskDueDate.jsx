import React, { useRef, useState } from 'react';
import Calendar from './Calander';
import { DateButton } from './DueDate';

// Date picker for a task that is not saved yet. The parent owns `dueDate`.
export default function SubtaskDueDate({ dueDate, setDueDate }) {
  const anchorRef = useRef();
  const [open, setOpen] = useState(false);

  return (
    <>
      <DateButton
        buttonRef={anchorRef}
        value={dueDate?.to || dueDate?.from}
        label="Set task dates"
        expanded={open}
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <Calendar
          dueDate={dueDate}
          setDueDate={setDueDate}
          anchorRef={anchorRef}
          onApply={({ startDate, endDate }) => setDueDate({ from: startDate, to: endDate })}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
