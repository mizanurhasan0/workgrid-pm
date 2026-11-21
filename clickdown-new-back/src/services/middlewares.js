import decodeAuthToken from '../utils/decodeAuthToken';
import { fail, sendFailure } from '../utils/httpError';

/**
 * Role guard. Must run after `auth`. Allows the request only when the user's role name is in `allowed`.
 * @param {Array<string>} allowed The allowed role names.
 */
function checkRole(allowed) {
  return (req, res, next) => {
    if (req.user?.role && allowed.includes(req.user.role.name)) return next();
    return fail(res, 403, 'You do not have permission to perform this action.');
  };
}

/**
 * Authenticates the request from the auth cookie (or, in development, a Bearer token)
 * and attaches the user to req.user.
 */
async function auth(req, res, next) {
  try {
    const bearer = process.env.NODE_ENV === 'development' ? req.header('Authorization')?.replace('Bearer ', '') : null;
    const token = req.cookies?.[process.env.COOKIE_KEY] || bearer;
    if (!token) return fail(res, 401, 'Please authenticate');
    const user = await decodeAuthToken(token);
    if (!user) return fail(res, 401, 'Please authenticate');
    req.token = token;
    req.user = user;
    return next();
  } catch (e) {
    return sendFailure(res, e);
  }
}

export { auth, checkRole };
