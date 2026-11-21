import React from 'react';
import LogDateFormate from '../../../../../Utils/LogDateFormate';
import Image from '../../../../../Components/Image';
import ViewMarkText from '../../../../../Components/ViewMarkText';

// Stored field names read better as plain labels in the activity feed
const FIELD_LABELS = { enddate: 'due date', startdate: 'start date' };
const fieldLabel = (name) => FIELD_LABELS[String(name ?? '').toLowerCase()] ?? name;

// Each entry renders one activity-log line. Keys match the backend `typeField` values.
const LogCard = {
  create: ({ curValue, user }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-xs">
      <p className="font-semibold capitalize">{user?.name}</p>
      <p>has added this task to</p>
      <p className="font-semibold capitalize text-brand">{curValue?.name}</p>
    </div>
  ),
  remove: ({ curValue, user }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-xs">
      <p className="font-semibold capitalize">{user?.name}</p>
      <p>has removed this task from</p>
      <p className="font-semibold capitalize text-brand">{curValue?.name}</p>
    </div>
  ),
  moved: ({ curValue, user }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-xs">
      <p className="font-semibold capitalize max-w-24 truncate">{user?.name}</p>
      <p>has moved this task</p>
      {curValue?.preProject && (
        <p className="font-semibold capitalize text-brand">{`from ${curValue.preProject}`}</p>
      )}
      <p>
        to&nbsp;
        <span className="font-semibold capitalize text-brand">{curValue?.name}</span>
      </p>
    </div>
  ),
  copy: ({ curValue, user }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-xs">
      <p className="font-semibold capitalize max-w-24 truncate">{user?.name}</p>
      <p>has copied this task</p>
      {curValue?.preProject && (
        <p className="font-semibold capitalize text-brand">{`from ${curValue.preProject}`}</p>
      )}
      <p>
        to&nbsp;
        <span className="font-semibold capitalize text-brand">{curValue?.name}</span>
      </p>
    </div>
  ),
  description: ({ curValue, user }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-xs">
      <p className="font-semibold capitalize">{user?.name}</p>
      <p>has updated&nbsp;{fieldLabel(curValue?.name)}</p>
      <div className="font-semibold capitalize max-w-full max-h-32 truncate inline-block">
        <ViewMarkText msg={curValue?.value} />
      </div>
    </div>
  ),
  comment: ({ comment, user, createdAt }) => (
    <div className="w-full p-4 rounded-lg space-y-2 border border-border bg-surface-alt text-sm text-text">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-x-1">
          <Image src={user?.avatar} className="w-6 h-6 rounded-full" />
          <p className="font-medium capitalize">{user?.name}</p>
        </div>
        <div className="text-text-muted"><LogDateFormate dateString={createdAt} /></div>
      </div>
      <p className="font-normal pl-2 break-words whitespace-pre-wrap">{comment}</p>
    </div>
  ),
  customFields: ({ curValue, preValue, user }) => (
    <div className="flex flex-wrap items-center gap-x-2">
      <p className="font-bold capitalize">{user?.name}</p>
      <p>{`has changed ${fieldLabel(curValue?.name)}`}</p>
      <div className="flex flex-wrap gap-2 items-center text-xs">
        {preValue ? (
          <div className="flex items-center">
            {curValue?.color ? <span className="w-2 h-2 mr-1" style={{ backgroundColor: `${preValue?.color}` }} /> : null}
            <p>
              {typeof curValue?.value === 'object'
                ? <LogDateFormate dateString={curValue?.value?.endDate || 'updated'} activeTime />
                : preValue?.value}
            </p>
            &nbsp;to
          </div>
        ) : null}
        <div className="flex items-center">
          {curValue?.color ? <span className="w-2 h-2 mr-1" style={{ backgroundColor: `${curValue?.color}` }} /> : null}
          <p>
            {typeof curValue?.value === 'object'
              ? <LogDateFormate dateString={curValue?.value?.endDate || 'updated'} activeTime />
              : curValue?.value}
          </p>
        </div>
      </div>
    </div>
  ),
  assignee: ({ curValue, members, user }) => (
    <div className="text-xs flex flex-wrap gap-2 items-center">
      <p className="font-bold capitalize">{user?.name}</p>
      <div className="text-text-muted flex flex-wrap items-center gap-x-2">
        <p>Assignee</p>
        <span className={curValue?.type === 'remove' ? 'text-danger' : 'text-brand'}>{curValue?.type}</span>
        <div className="capitalize leading-6 font-bold">
          {(members || []).find((m) => m.id === curValue?.value)?.name || 'Not found!'}
        </div>
      </div>
    </div>
  ),
  default: ({ curValue, preValue, user }) => {
    const isDate = curValue?.name?.toLowerCase() === 'enddate';
    return (
      <div className="flex flex-wrap items-center gap-x-1">
        <p className="font-bold capitalize max-w-24 truncate">{user?.name}</p>
        <p>{`has changed ${fieldLabel(curValue?.name)}`}</p>
        <div className="flex items-center text-xs">
          {preValue ? (
            <div className="flex items-center">
              <div className="capitalize mr-1 max-w-24 truncate">
                {isDate ? <LogDateFormate dateString={preValue?.value || new Date().getTime()} activeTime /> : preValue?.value}
              </div>
              to&nbsp;
            </div>
          ) : null}
          <div className="capitalize max-w-24 truncate">
            {isDate ? <LogDateFormate dateString={curValue?.value || new Date().getTime()} activeTime /> : curValue?.value}
          </div>
        </div>
      </div>
    );
  },
  notfound: ({ user }) => (
    <div className="flex flex-wrap items-center gap-x-1 text-xs">
      <p className="font-semibold capitalize max-w-24 truncate">{user?.name}</p>
      <span>log category should be updated</span>
    </div>
  ),
};

export default LogCard;
