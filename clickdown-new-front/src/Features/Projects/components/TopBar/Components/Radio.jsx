import React from 'react';
import { useSelector } from 'react-redux';

// Shows how many tasks are selected
export default function Radio() {
  const taskSelected = useSelector((state) => state.projectStore.taskSelected);
  const count = taskSelected?.length ?? 0;
  return (
    <p role="status" className="order-1 flex h-11 items-center px-2 text-sm font-medium whitespace-nowrap text-white">
      {count}
      {` ${count === 1 ? 'task' : 'tasks'} selected`}
    </p>
  );
}
