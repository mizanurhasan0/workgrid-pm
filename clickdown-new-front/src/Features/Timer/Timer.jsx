import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { PauseIcon, Play } from '../../assets';
import { useProjectsCtx } from '../Projects/context/ProjectsProvider';
import checkEqual from '../../Utils/checkEqual';
import Loading3 from '../../Components/Loading3';

const pad = (n) => String(n).padStart(2, '0');

export default function Timer({ insideTable = false, task }) {
  const { bundleInfo } = useSelector((state) => state.projectStore
    .view.find((v) => v.id === task?.viewId) || {}, checkEqual);
  const { updateTask } = useProjectsCtx();
  const [now, setNow] = useState(() => Date.now());
  const [load, setLoad] = useState(false);

  // The task's `pause` flag is true while the clock runs (the name predates the flag's meaning).
  const running = Boolean(task?.pause);
  const startedAt = Number(task?.startTime) || 0;

  // Re-render once a second while running so the display keeps counting.
  useEffect(() => {
    if (!running) {return undefined;}
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [running, startedAt]);

  const runningSeconds = running && startedAt ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0;
  const total = Number(task?.elapsedtime || 0) + runningSeconds;
  const hour = Math.floor(total / 3600);
  const min = Math.floor((total % 3600) / 60);
  const sec = total % 60;

  const startAndStop = () => {
    const stamp = Date.now();
    const type = bundleInfo?.type === 'backlog' ? 'tasks' : 'bugs';
    const elapsed = Number(task?.elapsedtime || 0)
      + (running && startedAt ? Math.max(0, Math.floor((stamp - startedAt) / 1000)) : 0);
    updateTask({
      load: setLoad,
      taskId: task.id,
      storePayload: {
        tree: task.tree,
        viewId: task.viewId,
        ctype: type,
        taskType: bundleInfo?.type === 'sprint' ? 'sprints' : type,
        sprintId: bundleInfo?.sprintId,
      },
      payload: {
        pause: !running,
        startTime: running ? 0 : stamp,
        elapsedtime: running ? elapsed : task.elapsedtime,
      },
    });
  };

  if (load) {return <div className="flex justify-center w-full"><Loading3 /></div>;}
  return (
    <section>
      <div className={`${insideTable ? '' : 'bg-secondary px-3 py-2'} rounded-[0.375rem]`}>
        {insideTable ? '' : <p className="font-normal text-[0.688em] text-white">Timer</p>}
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={startAndStop}
            aria-label={running ? 'Pause timer' : 'Start timer'}
            className="cursor-pointer leading-none"
          >
            {running ? <PauseIcon /> : <Play />}
          </button>
          <p className={insideTable ? 'text-slate-500' : 'text-white'}>
            {`${hour}:${pad(min)}:${pad(sec)}`}
          </p>
        </div>
      </div>
    </section>
  );
}
