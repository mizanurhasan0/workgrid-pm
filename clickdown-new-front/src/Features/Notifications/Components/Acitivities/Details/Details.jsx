import React from 'react';
import { useSelector } from 'react-redux';
import {
  Calender, Flag2, Loading, TaskDetails, Time, UserGroup2,
} from '../../../../../assets';
import Image from '../../../../../Components/Image';
import { DrawerBlog } from '../../../../Projects/components/MainDrawer/Handler';
import DateFormate from '../../../../../Utils/DateFormat';

function CustomTooltip({ title, className }) {
  return (
    <div className={`hidden group-hover:block group-focus-within:block absolute z-20 whitespace-nowrap mt-1 ${className}`}>
      <div className="absolute w-3 h-3 bg-text rotate-45 left-1/2 right-1/2 transform -translate-x-1/2 -z-50" />
      <span className="bg-text p-1 px-2 rounded-md text-surface text-xs font-medium ">{title}</span>
    </div>
  );
}

const formatSeconds = (totalSecond = 0) => {
  const hour = Math.floor(totalSecond / 3600);
  const min = Math.floor((totalSecond % 3600) / 60);
  const sec = Math.floor(totalSecond % 60);
  return `${hour}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T/;

/** Shows a custom field value as text; date fields and ISO timestamps become "DD Mon YYYY". */
function formatFieldValue(field) {
  const value = field?.value;
  if (value && typeof value === 'object') {return DateFormate(value.endDate);}
  if (field?.cf?.type === 'date' || (typeof value === 'string' && ISO_DATE.test(value))) {return DateFormate(value);}
  return value ?? '';
}

export default function Details() {
  const notifyView = useSelector((state) => state.notifyStore.view);
  const pUsers = useSelector((state) => state.projectStore.pUsers) || [];

  if (!notifyView) {
    return (
      <section className="w-full min-h-64 flex justify-center items-center">
        <p className="text-base font-medium text-text">No details found.</p>
      </section>
    );
  }

  // Assignees are member objects after a log is selected, or ids when the task comes from elsewhere.
  const findMember = (u) => (u && typeof u === 'object' ? u : pUsers.find((p) => p.id === u));

  return (
    <div className="pt-6">
      <div className="group flex items-center space-x-3 font-semibold text-text">
        <img src={TaskDetails} alt="" className="h-10 w-auto shrink-0 rounded-md dark:opacity-60" />
        <p className="drawerName min-w-0 break-words min-h-10 items-center text-xl flex">
          {notifyView?.name || ''}
        </p>
      </div>
      <div className="py-4 border-b border-border">
        <DrawerBlog Icon={Calender} label="Task ID">{notifyView?.id}</DrawerBlog>
        {notifyView?.assignee?.length > 0 ? (
          <DrawerBlog Icon={UserGroup2} label="Assignee">
            <div className="flex items-start">
              {notifyView.assignee.map((u, i) => {
                const member = findMember(u);
                return (
                  <div className="group relative" key={member?.id || `assignee-${i}`}>
                    <Image src={member?.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <CustomTooltip title={member?.name || 'Unknown member'} className="-left-2" />
                  </div>
                );
              })}
            </div>
          </DrawerBlog>
        ) : ''}
        {Array.isArray(notifyView?.customFields) && notifyView.customFields.map((cs, i) => (
          <div key={cs?.cf?.id || cs?.cf?.name || `cf-${i}`}>
            <DrawerBlog Icon={Loading} label={cs?.cf?.name || 'Custom field'}>
              <div>
                {formatFieldValue(cs)}
              </div>
            </DrawerBlog>
          </div>
        ))}
        {(notifyView?.startDate && notifyView?.endDate) ? (
          <DrawerBlog Icon={Calender} label="Dates">
            <p className="flex flex-wrap items-center">
              {DateFormate(notifyView.startDate)}
              <span className="text-xl px-1" aria-hidden="true">&#8594;</span>
              {DateFormate(notifyView.endDate)}
            </p>
          </DrawerBlog>
        ) : ''}
        {notifyView?.priority
          ? (
            <DrawerBlog Icon={Flag2} label="Priority">
              <p className="capitalize">{notifyView.priority}</p>
            </DrawerBlog>
          ) : ''}
        <DrawerBlog Icon={Time} label="Track Time">
          <p>{formatSeconds(Number(notifyView?.elapsedtime) || 0)}</p>
        </DrawerBlog>
      </div>
      <div className="py-6 h-auto">
        <p className="text-sm text-text-muted pb-2 break-words">{notifyView?.description}</p>
      </div>
    </div>
  );
}
