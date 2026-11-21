import React from 'react';
import { useSelector } from 'react-redux';

export default function TaskRowLeft({ id, viewId }) {
  const taskSelected = useSelector((state) => state.projectStore.taskSelected);
  const selected = taskSelected.some((t) => t?.task === id && t.viewId === viewId);
  return (
    <input
      type="checkbox"
      aria-label="Select task"
      checked={selected}
      className="h-4 w-4 cursor-pointer accent-secondary"
      name={id}
      onChange={() => { }}
    />
  );
}
