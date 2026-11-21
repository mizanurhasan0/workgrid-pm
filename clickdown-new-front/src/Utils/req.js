import axios from 'axios';
import { signinUrl } from '../Features/Auth/Utils/redirect';

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';

const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

/**
 * Failures keep the axios error (callers read error.response), and get two fields that
 * every caller can rely on: `status` (HTTP status or null for network errors) and
 * `serverMessage` (the backend's message text, or null).
 */
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {return Promise.reject(error);}
    const data = error?.response?.data;
    const serverMessage = typeof data === 'string' ? data : (data?.message ?? null);
    error.status = error?.response?.status ?? null;
    // A session that expired while the app was open (tokens last 7 or 30 days) sends the visitor back to
    // sign in. Other 401s (wrong password) and the first `user/me` check are handled by their callers.
    const expired = error.status === 401 && serverMessage === 'Please authenticate';
    const url = String(error?.config?.url ?? '');
    if (expired && !url.endsWith('user/me') && !/^\/(signin|signup)/.test(window.location.pathname)) {
      window.location.assign(signinUrl(window.location));
    }
    error.serverMessage = typeof serverMessage === 'string' && serverMessage.trim() ? serverMessage : null;
    return Promise.reject(error);
  },
);

/**
 * Make an HTTP request to the backend. Absolute https URLs are used as they are.
 * @param {Object} options - The request options.
 * @param {string} options.method - The HTTP method (e.g. 'GET', 'POST').
 * @param {string} options.uri - Path relative to VITE_SERVER_URL, or an absolute https URL.
 * @param {Object} [options.data] - The request body.
 * @param {AbortSignal} [options.signal] - Optional abort signal.
 * @return {Promise} - Resolves with the axios response; rejects with a normalised error.
 */
const req = ({
  method = 'GET',
  uri = '',
  data = {},
  signal,
} = {}) => http.request({
  method,
  url: uri.startsWith('https://') ? uri : uri.replace(/^\/+/, ''),
  data,
  ...(signal && { signal }),
});

export default req;
