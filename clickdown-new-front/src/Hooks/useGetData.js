import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import req from '../Utils/req';
import errorMessage from '../Features/Auth/Utils/errorMessage';

/**
 * Fetches `uri` on mount and whenever it changes.
 * @param {String} uri The API path relative to the server.
 * @param {Function} dispatch Optional callback that receives the fetched data.
 */
export default function useGetData(uri, dispatch = () => { }) {
  // `key` records which uri the result belongs to, so a changed uri reads as loading without a reset in the effect.
  const [result, setResult] = useState({ key: null, data: [], error: null });
  const dispatchRef = useRef(dispatch);

  useEffect(() => {
    dispatchRef.current = dispatch;
  });

  useEffect(() => {
    const controller = new AbortController();
    req({ uri, signal: controller.signal })
      .then(({ data: newData }) => {
        setResult({ key: uri, data: newData, error: null });
        dispatchRef.current(newData);
      })
      .catch((e) => {
        if (axios.isCancel(e)) {return;}
        setResult({ key: uri, data: [], error: e });
        toast.error(errorMessage(e, 'Could not load data. Please try again.'));
      });

    return () => controller.abort();
  }, [uri]);

  return {
    loading: result.key !== uri,
    error: result.error,
    data: result.data,
  };
}
