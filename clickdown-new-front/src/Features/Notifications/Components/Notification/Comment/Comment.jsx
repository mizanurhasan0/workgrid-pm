import React, { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setView } from '../../../../../Reducers/notifyReducer';
import { toTaskView, uniqueLogs } from '../../../Utils/logs';
import LogList from '../../LogList/LogList';

export default function Comment({ flags, onSelect = () => {} }) {
  const rawLogs = useSelector((state) => state.notifyStore.notify.logs);
  const logs = useMemo(
    () => uniqueLogs(rawLogs || []).filter((l) => l?.comment && !flags.isArchived(l?.id || l?._id)),
    [rawLogs, flags],
  );
  const dispatch = useDispatch();
  const select = (log) => {
    dispatch(setView(toTaskView(log)));
    onSelect(log);
  };
  return <LogList logs={logs} flags={flags} mode="comment" onSelect={select} emptyText="No comments found." emptyHint="Comments on your tasks will appear here." />;
}
