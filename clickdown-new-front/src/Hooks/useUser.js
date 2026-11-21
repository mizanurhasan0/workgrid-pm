import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { useGlobalCtx } from '../Context/GlobalProvider';
import req from '../Utils/req';
import {
  addArrNotify, setNotify, setPagination,
} from '../Reducers/notifyReducer';
import { setPUser } from '../Features/Projects/projectReducers';
import Register from '../serviceWorkerRegistration';
import { markSignedOut, nextFromSearch } from '../Features/Auth/Utils/redirect';
import errorMessage from '../Features/Auth/Utils/errorMessage';

const isAuthError = (e) => [401, 403].includes(e?.response?.status);

const useUser = () => {
  const dispatch = useDispatch();
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useGlobalCtx();

  // Push notifications are optional: a failed subscription must not block sign in.
  const savePushSubscription = () => Register()
    .then((reg) => (reg ? req({ method: 'PATCH', uri: 'user/me', data: { data: JSON.stringify({ push: reg }) } }) : null))
    .catch((e) => console.warn('Push subscription was not saved', e));

  const register = (data) => req({ uri: 'user', method: 'POST', data });

  const getNotification = ({ userId, page = 1 } = {}) => {
    if (!userId) {return Promise.resolve();}
    return req({ uri: `task/notify/${userId}?page=${page}` })
      .then(({ data }) => {
        dispatch(addArrNotify(data?.docs || []));
        dispatch(setPagination({ name: 'logNextPage', value: data?.nextPage ?? null }));
      })
      .catch((e) => toast.error(errorMessage(e, 'Could not load notifications.')));
  };

  // All users of the workspace, used by project member pickers.
  const getUsers = () => req({ uri: 'user?paginate=false' })
    .then(({ data }) => dispatch(setPUser(data || [])))
    .catch((e) => toast.error(errorMessage(e, 'Could not load team members.')));

  /**
   * Signs in and loads the session. Resolves to true on success, false on failure.
   * @returns {Promise<boolean>}
   */
  const login = ({ email, password, rememberMe }) => {
    setLoading(true);
    return req({ uri: 'user/login', method: 'POST', data: { email, password, rememberMe } })
      .then(({ data }) => {
        setUser(data);
        getNotification({ userId: data?.id });
        socket.connect();
        getUsers();
        savePushSubscription();
        navigate(nextFromSearch(location.search), { replace: true });
        return true;
      })
      .catch((e) => {
        toast.error(errorMessage(e, 'Could not sign in. Please try again.'));
        return false;
      })
      .finally(() => setLoading(false));
  };

  const clearSession = () => {
    markSignedOut();
    dispatch(setNotify([]));
    dispatch(setPUser([]));
    dispatch(setPagination({ name: 'logNextPage', value: null }));
    setUser({});
    socket.disconnect();
    navigate('/signin');
  };

  const logout = () => {
    setLoading(true);
    return req({ uri: 'user/logout', method: 'POST' })
      .then(() => clearSession())
      .catch((e) => {
        // An expired session cannot be ended on the server, but the local state still has to go.
        if (isAuthError(e)) {clearSession();}
        else {toast.error(errorMessage(e, 'Failed to log out.'));}
      })
      .finally(() => setLoading(false));
  };

  const updateOwn = (data) => req({ method: 'PATCH', uri: 'user/me', data });

  const profile = (id) => req({ uri: `user/profile/${id}` });

  useEffect(() => {
    req({ uri: 'user/me' })
      .then(({ data }) => {
        setUser(data);
        getNotification({ userId: data?.id });
        getUsers();
        socket.connect();
        savePushSubscription();
      })
      .catch((e) => {
        // 401 just means nobody is signed in; the Private guard sends the visitor to /signin.
        if (!isAuthError(e)) {toast.error(errorMessage(e, 'Could not reach the server.'));}
      })
      .finally(() => setLoading(false));
    // Runs once on mount: the session is loaded a single time for the whole app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    setUser,
    loading,
    setLoading,
    login,
    logout,
    register,
    updateOwn,
    profile,
    getNotification,
  };
};

export default useUser;
