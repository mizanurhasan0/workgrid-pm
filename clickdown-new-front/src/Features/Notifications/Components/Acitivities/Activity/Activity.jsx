import React from 'react';
import { useSelector } from 'react-redux';
import RelativeTime from '../../../Utils/relativeTime';
import LogCard from '../../../../Projects/components/MainDrawer/components/LogCard';
import { logKey } from '../../../Utils/logs';

export default function Activity() {
  const notifyView = useSelector((state) => state.notifyStore.view);
  const logs = notifyView?.logs || [];

  return (
    <section className="py-6">
      <h2 className="text-xl! font-semibold text-strong pb-4">Activity</h2>
      <ul className="space-y-3">
        {logs.length > 0 ? logs.map((t, index) => (
          <li key={logKey(t, index)} className="flex items-center space-x-2">
            <div className={`${t?.comment ? 'hidden' : ''} w-2 h-2 bg-thirdInfo rounded-full shrink-0`} />
            <div className="text-xs text-text-muted flex flex-wrap items-center justify-between gap-x-2 w-full min-w-0">
              {LogCard[t?.typeField] === undefined
                ? LogCard.notfound({ user: t?.user })
                : LogCard[t.typeField]({
                  curValue: t.curValue,
                  preValue: t.preValue,
                  members: t.members,
                  user: t.user,
                  comment: t.comment,
                })}
              <div className={`${t?.comment ? 'hidden' : ''} font-semibold`}>
                <RelativeTime value={t?.createdAt} />
              </div>
            </div>
          </li>
        )) : (
          <li className="py-12 text-center text-base text-text-muted list-none">No activity yet.</li>
        )}
      </ul>
    </section>
  );
}
