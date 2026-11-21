import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setView } from '../../../../../Reducers/notifyReducer';
import { useAuth } from '../../../../../Context/AuthProvider';
import { toTaskView, uniqueLogs } from '../../../Utils/logs';
import LogList from '../../LogList/LogList';

export default function AllNotification({ flags, onSelect = () => {} }) {
  const { user, getNotification } = useAuth();
  const { notify: { logs: rawLogs = [] }, nPagination: { logNextPage } } = useSelector(
    (state) => state.notifyStore,
  );
  const dispatch = useDispatch();
  const logs = useMemo(() => uniqueLogs(rawLogs).filter((l) => !flags.isArchived(l?.id || l?._id)), [rawLogs, flags]);
  const loadingPage = useRef(null);

  const select = (log) => {
    dispatch(setView(toTaskView(log)));
    onSelect(log);
  };

  const loadMore = useCallback(() => {
    if (logNextPage === null || !user?.id || loadingPage.current === logNextPage) {return;}
    loadingPage.current = logNextPage;
    Promise.resolve(getNotification({ userId: user.id, page: logNextPage }))
      .finally(() => { loadingPage.current = null; });
    // getNotification is recreated on every render of the auth provider.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logNextPage, user?.id]);

  // Show the newest task in the details pane when the list first opens.
  useEffect(() => {
    dispatch(setView(toTaskView(logs[0])));
    // Only on mount: later selections must not be overwritten by new logs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LogList
      logs={logs}
      flags={flags}
      onSelect={select}
      emptyText="No notifications yet."
      hasMore={logNextPage !== null}
      onEnd={loadMore}
    />
  );
}
