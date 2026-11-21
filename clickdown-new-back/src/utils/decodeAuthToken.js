import jwt from 'jsonwebtoken';
import * as operations from '../controllers/operations';
import User from '../services/user/user.schema';

/**
 * Verifies a JWT and loads the matching user (with role name and department).
 * @param {String} token The token to decode.
 * @returns {Promise<Object|undefined>} The user document, or undefined when the token is invalid.
 */
export default async function decodeAuthToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await operations.findOne({ table: User, key: { id: decoded.id, populate: { path: 'role', select: 'name department' } } });
    if (!user) return undefined;
    return user;
  }
  catch (e) {
    return undefined;
  }
}
