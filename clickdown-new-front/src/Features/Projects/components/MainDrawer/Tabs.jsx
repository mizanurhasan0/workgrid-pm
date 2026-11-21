import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  Calender, Custom, Edit, Flag2, Send, Time, UserGroup2, TaskDetails,
} from '../../../../assets';
import { DrawerBlog, buildStorePayload } from './Handler';
import Assignee from '../PBody/Bundle/TableComponents/Assignee';
import Timer from '../../../Timer/Timer';
import DrPriority from './components/DrPriority';
import LogDateFormate from '../../../../Utils/LogDateFormate';
import { fullDateText } from '../PBody/Bundle/bundleHelpers';
import ListCustomFields from '../CustomFiels/ListCustomFields';
import LogCard from './components/LogCard';
import Loading3 from '../../../../Components/Loading3';
import QuillEditor from './components/QuillEditor';

const idOf = (value) => String(value?.id ?? value);

// Inline rename: shows the name as text, switches to an input on click.
function TaskName({ name, load = false, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) {inputRef.current?.focus();}
  }, [editing]);

  if (load) {return <div className="flex items-center justify-center w-full"><Loading3 /></div>;}

  const startEdit = () => {
    setDraft(name || '');
    setEditing(true);
  };
  const commit = () => {
    setEditing(false);
    const next = draft.trim();
    if (next && next !== name) {onSave(next);}
  };
  const cancel = () => {
    setDraft(name || '');
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        aria-label="Task name"
        value={draft}
        maxLength={255}
        spellCheck={false}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {e.currentTarget.blur();}
          if (e.key === 'Escape') {cancel();}
        }}
        className="min-w-0 flex-1 text-xl font-semibold sm:text-2xl bg-transparent border-b border-secondary outline-hidden"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEdit}
      className="group flex min-w-0 items-center gap-2 text-left text-xl font-semibold sm:text-2xl cursor-text"
    >
      <span className="break-words">{name || 'Untitled task'}</span>
      <Edit className="w-[0.833rem] h-[0.833rem] shrink-0 invisible group-hover:visible group-focus-visible:visible" />
    </button>
  );
}

function DetailsPanel({
  task, viewId, taskId, tree, bundleInfo, projectCF = [],
  updateTask, load = false, setLoad, desc, setDesc, onDirtyChange,
}) {
  const {
    id, name, assignee, customFields, endDate, startDate, priority, elapsedtime, startTime, pause,
    description,
  } = task;
  const taskFields = Array.isArray(customFields) ? customFields : [];
  const taskInfo = {
    tree, viewId, taskId, projectId: bundleInfo?.projectId, bundleInfo,
  };
  const storePayload = buildStorePayload({ bundleInfo, viewId, tree });

  return (
    <div className="px-4 pt-6 pb-8 sm:px-8">
      <div className="flex items-center gap-3 font-semibold text-text">
        <img src={TaskDetails} alt="" className="w-8 h-8 rounded-md shrink-0" />
        <TaskName
          name={name}
          load={load}
          onSave={(next) => updateTask({
            load: setLoad, taskId, storePayload, payload: { name: next },
          })}
        />
      </div>
      <div className="border-b border-border py-5">
        <DrawerBlog Icon={Calender} label="Task ID">{id}</DrawerBlog>
        {assignee ? (
          <DrawerBlog Icon={UserGroup2} label="Assignee">
            <Assignee
              assignee={assignee}
              taskId={taskId}
              tree={tree}
              viewId={viewId}
            />
          </DrawerBlog>
        ) : null}
        {projectCF.map((pcf) => {
          const renderField = ListCustomFields[pcf?.cf?.type];
          if (!renderField) {return null;}
          const match = taskFields.find((c) => idOf(c?.cf) === idOf(pcf.cf));
          const cusF = { ...pcf.cf, result: match?.value };
          return (
            <div key={idOf(pcf.cf)}>
              <DrawerBlog Icon={Custom} label={cusF.name} className="stroke-text-muted">
                {renderField(cusF, { ...taskInfo, inDrawer: true })}
              </DrawerBlog>
            </div>
          );
        })}
        {(startDate && endDate) ? (
          <DrawerBlog Icon={Calender} label="Dates">
            <span className="tabular-nums">
              {`${fullDateText(startDate)} \u2192 ${fullDateText(endDate)}`}
            </span>
          </DrawerBlog>
        ) : null}
        <DrawerBlog Icon={Flag2} label="Priority">
          <DrPriority
            tree={tree}
            viewId={viewId}
            taskId={taskId}
            priority={priority}
            updateTask={updateTask}
          />
        </DrawerBlog>
        <DrawerBlog Icon={Time} label="Track Time">
          <Timer
            insideTable
            task={{
              id: taskId,
              startTime,
              elapsedtime,
              pause,
              viewId,
              taskId,
              tree,
            }}
          />
        </DrawerBlog>
      </div>
      <QuillEditor
        description={description}
        desc={desc}
        setDesc={setDesc}
        bundleInfo={bundleInfo}
        updateTask={updateTask}
        taskId={taskId}
        viewId={viewId}
        tree={tree}
        onDirtyChange={onDirtyChange}
      />
    </div>
  );
}

function ActivityPanel({
  task, viewId, taskId, tree, bundleInfo, updateTask, load = false, setLoad,
}) {
  const logs = Array.isArray(task?.logs) ? task.logs : [];

  const onComment = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const value = String(new FormData(form).get('comment') || '').trim();
    if (value.length < 2) {
      toast.warning('Write something first');
      return;
    }
    updateTask({
      load: setLoad,
      taskId,
      storePayload: buildStorePayload({ bundleInfo, viewId, tree }),
      payload: { comment: value },
    });
    form.reset();
  };

  return (
    <div className="min-h-[60vh] space-y-6 px-4 pt-6 pb-8 sm:px-8">
      <h2 className="text-xl font-semibold text-text">Activity</h2>
      <div className="flex flex-col justify-between">
        <ul className="space-y-3">
          {logs.length > 0 ? logs.map((t, i) => {
            const renderLog = Object.hasOwn(LogCard, t?.typeField) ? LogCard[t.typeField] : LogCard.notfound;
            return (
              <li key={t?.id ?? i} className="flex items-start gap-2">
                <span className={`${t?.comment ? 'hidden' : ''} mt-1.5 w-2 h-2 shrink-0 bg-text-muted/60 rounded-full`} />
                <div className="min-w-0 flex-1 text-xs text-text-muted flex items-center justify-between gap-2 flex-wrap">
                  {renderLog({
                    curValue: t.curValue,
                    preValue: t.preValue,
                    members: t.members,
                    user: t.user,
                    comment: t?.comment,
                    createdAt: t.createdAt,
                  })}
                  <div className={`${t?.comment ? 'hidden' : ''} font-semibold`}>
                    <LogDateFormate dateString={t?.createdAt} />
                  </div>
                </div>
              </li>
            );
          }) : (
            <li className="list-none py-6 text-center text-sm text-text-muted">No activity yet</li>
          )}
        </ul>
        {load ? (
          <div className="flex justify-center items-center py-2">
            <Loading3 />
          </div>
        ) : null}
        <form onSubmit={onComment} className="mt-5 relative">
          <label htmlFor="task-comment" className="sr-only">Write a comment</label>
          <input
            id="task-comment"
            type="text"
            name="comment"
            placeholder="Type new Comments..."
            maxLength={2000}
            disabled={load}
            className="h-12 w-full rounded-md border border-border bg-surface px-4 pr-14 text-base text-text outline-hidden placeholder:text-text-muted focus:border-secondary disabled:opacity-60 sm:text-sm"
          />
          <button
            type="submit"
            aria-label="Send comment"
            disabled={load}
            className="absolute top-1/2 right-1 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center disabled:opacity-40"
          >
            <Send />
          </button>
        </form>
      </div>
    </div>
  );
}

const TabPanels = {
  Details: DetailsPanel,
  Activity: ActivityPanel,
};

export default TabPanels;
