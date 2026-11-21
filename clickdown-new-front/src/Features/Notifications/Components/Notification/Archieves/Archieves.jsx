import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import req from '../../../../../Utils/req';
import { useAuth } from '../../../../../Context/AuthProvider';
import { addArrNotify, setView } from '../../../../../Reducers/notifyReducer';
import { toTaskView, uniqueLogs } from '../../../Utils/logs';
import LogList from '../../LogList/LogList';

const ARCHIVED_LIMIT = 100;

export default function Archieves({ flags, onSelect = () => {} }) {
  const rawLogs = useSelector((state) => state.notifyStore.notify.logs);
  const { user } = useAuth();
  const dispatch = useDispatch();
  const logs = useMemo(
    () => uniqueLogs(rawLogs || []).filter((l) => flags.isArchived(l?.id || l?._id)),
    [rawLogs, flags],
  );

  // The All tab loads notifications page by page; archived ones can be on pages that were never
  // loaded, so ask the server for them directly and merge them into the list.
  useEffect(() => {
    if (!user?.id) {return;}
    req({ uri: `task/notify/${user.id}?archived=true&limit=${ARCHIVED_LIMIT}` })
      .then(({ data }) => {
        if (data?.docs?.length) {dispatch(addArrNotify(data.docs));}
      })
      .catch(() => {});
  }, [user?.id, dispatch]);

  const select = (log) => {
    dispatch(setView(toTaskView(log)));
    onSelect(log);
  };
  return <LogList logs={logs} flags={flags} mode="archive" onSelect={select} emptyText="No archived notifications." emptyHint="Archived notifications are kept here until you restore them." />;
}
