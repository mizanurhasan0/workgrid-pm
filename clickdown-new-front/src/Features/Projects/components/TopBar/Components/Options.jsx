import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import {
  DuplicateIcon, Flag,
  MoveTaskIcon, TopAddUser, TopCalender, TopDelete, TopLoading, TopTimeSchedule,
} from '../../../../../assets';
import Members from './Members';
import ProjectsTree from './ProjectsTree';
import TopCalenders from './TopCalenders';
import TopEstimate from './TopEstimate';
import TopPriority from './TopPriority';
import TopStatus from './TopStatus';
import { useProjectsCtx } from '../../../context/ProjectsProvider';
import ActionModal from '../../../../../Components/Modal/ActionModal';

const MENUS = ['member', 'status', 'duplicate', 'move', 'priority', 'timeShedule', 'calender'];
const closedMenus = Object.fromEntries(MENUS.map((m) => [m, false]));

// Text shown above an action icon on hover or focus. Hidden while its menu is open.
function Tip({ text, open, className }) {
  return (
    <div role="tooltip" className={`${open ? 'hidden' : 'hidden md:group-hover:block md:group-focus-within:block'} pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap ${className}`}>
      <span className="rounded-md bg-surface-raised border border-border px-2 py-1 text-xs font-medium text-text shadow">{text}</span>
    </div>
  );
}

const btn = 'flex h-11 w-11 items-center justify-center rounded-md hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white';
// Menus open under the bar on desktop and span the width on phones
const popup = 'absolute top-full mt-1 max-sm:fixed max-sm:inset-x-2 max-sm:top-24 max-sm:w-auto';

export default function Options() {
  const containerRef = useRef();
  const { gpDeleteTask } = useProjectsCtx();
  const taskSelected = useSelector((state) => state.projectStore.taskSelected) ?? [];
  const [showDelete, setShowDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(closedMenus);
  const [dueDate, setDueDate] = useState({ from: null, to: null });
  const hasSelection = taskSelected.length > 0;

  // Close any open menu once the selection is cleared (render-time state adjustment)
  if (!hasSelection && Object.values(showMenu).some(Boolean)) {setShowMenu(closedMenus);}

  // Only one menu is open at a time
  const toggleMenu = (key) => setShowMenu((menu) => ({ ...closedMenus, [key]: !menu[key] }));
  const closeMenus = () => setShowMenu(closedMenus);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (!containerRef.current?.contains(e.target)) {setShowMenu(closedMenus);}
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const onDeleteTasks = () => {
    setShowDelete(false);
    gpDeleteTask();
  };

  return (
    <div className="order-3 flex w-full items-center justify-between sm:order-2 sm:w-auto sm:justify-center sm:gap-4 md:gap-8" ref={containerRef}>
      <div className="group relative">
        <button type="button" aria-label="Set assignees" aria-expanded={showMenu.member} aria-haspopup="true" onClick={() => toggleMenu('member')} className={btn}>
          <TopAddUser className="cursor-pointer" />
        </button>
        <Tip text="Set assignees" open={showMenu.member} />
        {showMenu.member ? <Members /> : ''}
      </div>
      <div className="group relative">
        <button type="button" aria-label="Set status" aria-expanded={showMenu.status} aria-haspopup="true" onClick={() => toggleMenu('status')} className={btn}>
          <TopLoading className="cursor-pointer" />
        </button>
        <Tip text="Set status" open={showMenu.status} />
        {showMenu.status ? (
          <div className={`${popup} left-0`}>
            <TopStatus onClose={closeMenus} />
          </div>
        ) : ''}
      </div>
      <div className="group relative">
        <button type="button" aria-label="Duplicate tasks" aria-expanded={showMenu.duplicate} aria-haspopup="true" onClick={() => toggleMenu('duplicate')} className={btn}>
          <DuplicateIcon className="cursor-pointer" />
        </button>
        <Tip text="Duplicate tasks" open={showMenu.duplicate} />
        {(showMenu.duplicate && hasSelection) ? <ProjectsTree /> : ''}
      </div>
      <div className="group relative">
        <button type="button" aria-label="Move tasks" aria-expanded={showMenu.move} aria-haspopup="true" onClick={() => toggleMenu('move')} className={btn}>
          <MoveTaskIcon className="cursor-pointer" />
        </button>
        <Tip text="Move tasks" open={showMenu.move} />
        {(showMenu.move && hasSelection) ? <ProjectsTree action="move" /> : ''}
      </div>
      <div className="group relative">
        <button type="button" aria-label="Set priority" aria-expanded={showMenu.priority} aria-haspopup="true" onClick={() => toggleMenu('priority')} className={btn}>
          <Flag className="cursor-pointer stroke-info" />
        </button>
        <Tip text="Set priority" open={showMenu.priority} />
        {(showMenu.priority && hasSelection) ? (
          <div className={`${popup} right-0 shadow-2xl`}>
            <TopPriority />
          </div>
        ) : ''}
      </div>
      <div className="group relative">
        <button type="button" aria-label="Set time estimate" aria-expanded={showMenu.timeShedule} aria-haspopup="true" onClick={() => toggleMenu('timeShedule')} className={btn}>
          <TopTimeSchedule className="cursor-pointer" />
        </button>
        <Tip text="Set time estimate" open={showMenu.timeShedule} />
        {showMenu.timeShedule ? (
          <div className={`${popup} right-0`}>
            <TopEstimate onClose={closeMenus} />
          </div>
        ) : ''}
      </div>
      <div className="group relative">
        <button type="button" aria-label="Set dates" aria-expanded={showMenu.calender} aria-haspopup="true" onClick={() => toggleMenu('calender')} className={btn}>
          <TopCalender className="cursor-pointer" />
        </button>
        <Tip text="Set date" open={showMenu.calender} />
        {(showMenu.calender && hasSelection) ? (
          <div className={`${popup} right-0 shadow-2xl`}>
            <TopCalenders dueDate={dueDate} setDueDate={setDueDate} onClose={closeMenus} />
          </div>
        ) : ''}
      </div>
      <div className="group relative">
        <button type="button" aria-label="Delete tasks" onClick={() => setShowDelete(true)} className={btn}>
          <TopDelete className="cursor-pointer" />
        </button>
        <Tip text="Delete tasks" open={false} />
      </div>
      {showDelete && createPortal(
        <ActionModal
          show
          onClose={() => setShowDelete(false)}
          onClick={onDeleteTasks}
        />,
        document.body,
      )}
    </div>
  );
}
