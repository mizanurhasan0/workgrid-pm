import React from 'react';
import { useSelector } from 'react-redux';
import { useProjectsCtx } from '../../../context/ProjectsProvider';
import Calendar from '../../PBody/Bundle/TableComponents/Calander';

// Bulk date range for the selected tasks
export default function TopCalenders({ setDueDate, dueDate, onClose }) {
  const taskSelected = useSelector((state) => state.projectStore.taskSelected);
  const { gpUpdateTask } = useProjectsCtx();

  const applyRange = ({ startDate, endDate }) => {
    gpUpdateTask({
      taskList: taskSelected.map((t) => ({ ...t, startDate, endDate })),
    });
  };

  return (
    <Calendar
      dueDate={dueDate}
      setDueDate={setDueDate}
      onApply={applyRange}
      onClose={onClose}
    />
  );
}
