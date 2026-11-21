import React from 'react';
import {
  ArrRight,
  Loading,
  ArrowDown,
  UserGroup,
  Edit,
  Delete,
  Message2,
} from '../../../../../assets';
import Image from '../../../../../Components/Image';
import DateFormate from '../../../../../Utils/DateFormat';
import ViewMarkText from '../../../../../Components/ViewMarkText';

const category = {
  create: ({ curValue, user }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-sm ml-11 mt-2">
      <p className="font-semibold capitalize">{user.name}</p>
      <p>added this task to</p>
      <p className="font-semibold capitalize text-brand">{curValue.name}</p>
    </div>
  ),
  moved: ({ curValue, user }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-sm ml-11 mt-2">
      <p className="font-semibold capitalize max-w-32 truncate">
        {user.name}
      </p>
      <p>moved this task</p>
      {curValue?.preProject && (
        <p className="font-semibold capitalize text-brand">
          from
          {" "}
          {curValue.preProject}
        </p>
      )}
      <p>
        to &nbsp;
        <span className="font-semibold capitalize text-brand">{curValue.name}</span>
      </p>
    </div>
  ),
  copy: ({ curValue, user }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-sm ml-11 mt-2">
      <p className="font-semibold capitalize max-w-32 truncate">
        {user?.name}
      </p>
      <p>copy this task</p>
      {curValue?.preProject && (
        <p className="font-semibold capitalize text-brand">
          from
          {" "}
          {curValue?.preProject}
        </p>
      )}
      <p>
        to &nbsp;
        <span className="font-semibold capitalize text-brand">{curValue?.name}</span>
      </p>
    </div>
  ),
  remove: ({ curValue, user }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-sm ml-11 mt-2">
      <p className="font-semibold capitalize">{user.name}</p>
      <div className="flex">
        <Delete className="mr-1 h-4 w-4 shrink-0 fill-danger" aria-hidden="true" />
        removed
      </div>
      <p>
        this task to
        <span className="font-semibold capitalize text-brand ml-1">{curValue.name}</span>
      </p>
    </div>
  ),
  description: ({ curValue }) => (
    <div className=" text-sm ml-11 mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div><Edit className="stroke-text-muted w-3 h-3" /></div>
        <p className="font-semibold capitalize">{curValue.name}</p>
      </div>
      <div className="break-words max-h-80 overflow-y-auto">
        <ViewMarkText msg={curValue.value} />
      </div>
    </div>
  ),
  comment: ({ comment }) => (
    <div className=" text-sm ml-11 mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div><Message2 className="stroke-text-muted w-3 h-3" /></div>
        <p className="font-semibold capitalize">Comment</p>
      </div>
      <div className="break-words">
        {comment}
      </div>
    </div>
  ),
  customFields: ({ curValue, preValue }) => (
    <div className="pl-11">
      <div className="text-xs flex gap-2 items-center py-3">
        <Loading />
        <p>{curValue?.name || ''}</p>
      </div>
      <div className="flex gap-2 items-center pb-3 text-xs font-medium">
        {
          preValue ? (
            <>
              <div className="px-2 py-1.5 bg-brand-soft text-text rounded-md flex items-center">
                {preValue.color ? <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: `${preValue?.color}` }} /> : ''}
                <p>{preValue.type === 'date' ? DateFormate(preValue?.value?.endDate) : preValue?.value}</p>
                {preValue.type === 'dropdown' ? <ArrowDown className="w-4 h-4" /> : ''}
              </div>
              <ArrRight />
            </>
          ) : ''
        }
        <div className="px-2 py-1.5 bg-brand-soft text-text rounded-md flex items-center">
          {curValue?.color ? <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: `${curValue?.color}` }} /> : ''}
          <p>{curValue.type === 'date' ? DateFormate(curValue?.value?.endDate) : curValue?.value}</p>
          {curValue?.type === 'dropdown' ? <ArrowDown className="w-4 h-4" /> : ''}
        </div>
      </div>
    </div>
  ),
  assignee: ({ curValue, members }) => (
    <div className="pl-11">
      <div className="text-xs flex gap-2 items-center py-3">
        <UserGroup className="w-5 h-5" />
        <div className="text-text-muted flex items-center space-x-2">
          <p>Assignee</p>
          <span className={`${curValue.type === 'remove' ? 'text-danger' : 'text-brand'}`}>{curValue.type}</span>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Image src={members.find((m) => m.id === curValue.value)?.avatar} alt="" className="w-8 h-8 rounded-full" />
        <div className="capitalize text-sm font-medium leading-6">{members.find((m) => m.id === curValue.value)?.name || 'Not found!'}</div>
      </div>
    </div>
  ),
  default: ({ curValue, preValue }) => (
    <div className="pl-11">
      <div className="text-xs flex gap-2 items-center py-3 text-text-muted">
        <Edit className="w-4 h-4" />
        <p className="capitalize">{curValue.name}</p>
      </div>
      <div className="flex gap-2 items-center pb-3 text-xs font-medium">
        {
          preValue ? (
            <>
              <div className="px-2 py-1.5 bg-brand-soft text-text rounded-md flex items-center">
                <p className="capitalize max-w-40 truncate">{preValue?.value}</p>
              </div>
              <ArrRight />
            </>
          ) : ''
        }
        <div className="px-2 py-1.5 bg-brand-soft text-text rounded-md flex items-center">
          <p className="capitalize max-w-40 truncate">{Number.isNaN(Date.parse(curValue.value)) === true ? curValue.value : DateFormate(curValue.value)}</p>
        </div>
      </div>
    </div>
  ),
  task: ({ curValue, user, action }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-sm ml-11 mt-2">
      <p className="font-semibold capitalize max-w-32 truncate">{user?.name}</p>
      <p>{`${action || 'updated'}${String(action || 'update').endsWith('e') ? 'd' : 'ed'} the task`}</p>
      <p className="font-semibold text-brand break-words">{curValue?.name}</p>
      {curValue?.status ? (
        <span className="chip chip-neutral">{curValue.status}</span>
      ) : null}
    </div>
  ),
  notfound: ({ user, action }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-sm ml-11 mt-2">
      <p className="font-semibold capitalize max-w-32 truncate">{user?.name}</p>
      <p>{`made a change${action ? ` (${action})` : ''}.`}</p>
    </div>
  ),
};
export default function ActionDetails({ log }) {
  // Logs can miss parts of their payload; defaults keep every renderer safe.
  const safe = {
    ...log,
    curValue: log?.curValue || {},
    preValue: log?.preValue || null,
    members: log?.members || [],
    user: log?.user || {},
  };
  const render = category[safe.typeField] || category.notfound;
  return render(safe);
}
