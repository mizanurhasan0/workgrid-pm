import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import BundleTable from './BundleTable';
import BundleTop from './BundleTop';
import { onCreateTaskOpen } from '../../../projectReducers';

export default function Bundle({ viewId }) {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);

  // Opens the new-task row at the bottom of this view's table
  const handleCreateTask = (field) => {
    setCollapsed(false);
    dispatch(onCreateTaskOpen({ placeholder: 'New Task', id: viewId, field }));
  };

  return (
    <div className="mb-2">
      <BundleTop
        viewId={viewId}
        handleCreateTask={handleCreateTask}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((c) => !c)}
      />
      <BundleTable
        viewId={viewId}
        collapsed={collapsed}
        onAddTask={handleCreateTask}
      />
    </div>
  );
}
