import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X } from 'lucide-react';
import Options from './Components/Options';
import Radio from './Components/Radio';
import { setTaskSelection } from '../../projectReducers';

// Bar shown above the page while tasks are selected
export default function TopBar() {
  const taskSelected = useSelector((state) => state.projectStore.taskSelected);
  const dispatch = useDispatch();
  const visible = (taskSelected?.length ?? 0) > 0;
  return (
    <div
      inert={!visible}
      role="toolbar"
      aria-label="Actions for selected tasks"
      className={`${visible ? 'translate-y-0' : 'invisible -translate-y-full'} transition-[transform,visibility] fixed inset-x-0 top-0 z-30 flex md:left-16 flex-wrap items-center justify-between bg-subInfo px-1 text-white shadow-lg dark:border-b dark:border-border dark:bg-surface-raised duration-300 sm:flex-nowrap sm:px-4 md:px-6`}
    >
      <Radio />
      <button
        type="button"
        aria-label="Clear selection"
        onClick={() => dispatch(setTaskSelection([]))}
        className="order-2 flex h-11 w-11 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white sm:order-3"
      >
        <X size={20} aria-hidden="true" />
      </button>
      <Options />
    </div>
  );
}
