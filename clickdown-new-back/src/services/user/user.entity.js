import Chat from '../chat/chat.schema';
import Invitation from '../invitations/invitaions.schema';
import Project from '../project/project.schema';
import User from './user.schema';
import otpGenerate from '../../utils/otpGenerate';
import { decryptToken, encryptToken } from '../../utils/AuthToken';
import { removeUpload } from '../../controllers/imageUp';
import { fail, sendFailure, HttpError } from '../../utils/httpError';
import OwnerAdmins from '../../utils/OwnerAdmin';

/**
 * these are the array to validate the request.
 */
const createAllowed = new Set(['name', 'email', 'password', 'refferer']);
const allowedQuery = new Set(['name', 'username', 'page', 'limit', 'id']);
const userUpdateAllowed = new Set([
  'name', 'username', 'phone', 'avatar',
  'theme', 'pinnedChats', 'jobtitle', 'department',
  'details', 'settings', 'push',
]);
const populate = {
  path: 'company',
  strictPopulate: false,
  populate: {
    path: 'members creator role',
    select: 'name email',
    strictPopulate: false,
  }
};

const OTP_TTL_MS = 1000 * 60 * 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const SESSION_DAYS = 7;
const REMEMBER_ME_DAYS = 30;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_ERROR = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;

/** Throws HttpError(400) unless the value is a string of at least 8 characters. */
const assertPassword = (password) => {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) throw new HttpError(400, PASSWORD_ERROR);
};

/**
 * Creates a user. New users get DEFAULT_ROLE and are added to any project they were invited to.
 */
export const register = ({ db, ws }) => async (req, res) => {
  try {
    const valid = Object.keys(req.body).every(k => createAllowed.has(k));
    if (!valid) return fail(res, 400, 'Bad request');
    const fUser = await db.findOne({ table: User, key: { email: req.body.email } });
    if (fUser) return fail(res, 400, 'Already registered');
    assertPassword(req.body.password);
    if (req?.body?.refferer?.length > 0) {
      const refferer = req.body.refferer.split('shhh')[0];
      req.body.refferer = Buffer.from(refferer, 'base64').toString('utf8');
    }
    req.body.role = process.env.DEFAULT_ROLE; // default role user, an user should be in the role collection with this object id
    const user = await db.create({ table: User, key: req.body, populate: populate });
    const invitation = await db.findOne({ table: Invitation, key: { email: req.body.email } });
    if (invitation) {
      invitation.status = 'accepted';
      await db.save(invitation);
      // Invited projects are stored as ids or names
      for (const ref of invitation.projects || []) {
        const singleProject = await db.findOne({ table: Project, key: /^[0-9a-f]{24}$/i.test(ref) ? { id: ref } : { name: ref } });
        if (!singleProject) continue;
        if (singleProject.members.some((m) => String(m) === String(user._id))) continue;
        singleProject.members.push(user._id);
        await db.save(singleProject);
      }
    }
    await db.create({ table: Chat, key: { creator: user.id, members: [user.id] } });
    ws.emit('newUser', user);
    res.status(200).send(user);
  }
  catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Logs a user in and sets the auth cookie.
 */
export const login = ({ db }) => async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) return fail(res, 400, 'Bad requests');
    const user = await db.findOne({ table: User, key: { email: req.body.email, populate: { path: 'role' } } });
    if (!user) return fail(res, 401, 'Incorrect email or password');
    const isValid = await user.checkPassword(req.body.password);
    if (!isValid) return fail(res, 401, 'Incorrect email or password');
    const days = req.body.rememberMe ? REMEMBER_ME_DAYS : SESSION_DAYS;
    const token = await user.generateToken(`${days}d`);
    res.cookie(process.env.COOKIE_KEY, token, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: days * DAY_MS,
    });
    res.status(200).send(user);
  }
  catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Returns the authenticated user with company data.
 */
export const me = ({ db }) => async (req, res) => {
  try {
    const user = await db.populate(req.user, populate);
    return res.status(200).send(user);
  }
  catch (err) {
    return sendFailure(res, err);
  }
};

/**
 * Logs the user out: clears the auth cookie and the push subscription.
 */
export const logout = ({ db }) => async (req, res) => {
  try {
    const user = await db.findOne({ table: User, key: { id: req.user.id } });
    if (!user) return fail(res, 401, 'Bad request!');
    user.push = {};
    await db.save(user);
    res.clearCookie(process.env.COOKIE_KEY, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      expires: new Date(Date.now())
    });
    return res.status(200).send('Logout successful');
  }
  catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Lists users. Query keys are restricted to allowedQuery.
 */
export const getAll = ({ db }) => async (req, res) => {
  try {
    const paginate = req.query.paginate !== 'false';
    const query = { ...req.query };
    delete query.paginate;
    const users = await db.find({ table: User, key: { query, allowedQuery: allowedQuery, paginate: paginate } });
    res.status(200).send(users);
  }
  catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Returns a user's public profile by id.
 */
export const userProfile = ({ db }) => async (req, res) => {
  try {
    const user = await db.findOne({ table: User, key: { id: req.params.id, populate: { path: 'role', select: 'name department' } } });
    if (!user) return fail(res, 404, 'No result found');
    res.status(200).send(user);
  }
  catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Updates the authenticated user's own profile. Body is JSON in the `data` form field
 * (or plain JSON). Password changes must go through the setpassword endpoint.
 */
export const updateOwn = ({ db, imageUp }) => async (req, res) => {
  try {
    const payload = typeof req.body?.data === 'string' ? JSON.parse(req.body.data) : req.body;
    if (req.files?.avatar?.path) payload.avatar = await imageUp(req.files.avatar.path);
    const isValid = Object.keys(payload).every(k => userUpdateAllowed.has(k));
    if (!isValid) return fail(res, 400, 'Bad request');
    Object.keys(payload).forEach(k => (req.user[k] = payload[k]));
    await db.save(req.user);
    const user = await db.populate(req.user, populate);
    res.status(200).send(user);
  }
  catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Admin update of any user. Passwords and notification subscriptions cannot be set here.
 */
export const updateUser = ({ db, imageUp, ws }) => async (req, res) => {
  try {
    if (req.files?.avatar?.path) req.body.avatar = await imageUp(req.files.avatar.path);
    const notAllowed = ['password', 'notifySubs'];
    const isValid = Object.keys(req.body).every(value => !notAllowed.includes(value));
    if (!isValid) return fail(res, 405, 'not allowed');
    const user = await db.findOne({ table: User, key: { id: req.params.id } });
    if (!user) return fail(res, 400, 'Bad request');
    Object.keys(req.body).forEach(k => (user[k] = req.body[k]));
    await db.save(user);
    const pUser = await db.populate(user, { path: 'role', select: 'name department' });
    // Only the changed user and the owners/admins who manage roles hear about it, with public fields only.
    const payload = { id: pUser.id, name: pUser.name, username: pUser.username, avatar: pUser.avatar, role: pUser.role?.toJSON ? pUser.role.toJSON() : pUser.role };
    const recipients = await OwnerAdmins({ ids: true, members: [user.id] });
    recipients.forEach((id) => ws.to(id).emit('updateUser', payload));
    return res.status(200).send(pUser);
  }
  catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Deletes a user (admin only). The avatar file is removed unless it is a shared default.
 */
export const deleteUser = ({ db }) => async (req, res) => {
  try {
    const deleted = await db.remove({ table: User, key: { id: req.params.id } });
    if (!deleted) return fail(res, 404, 'User not found');
    await removeUpload(deleted.avatar);
    res.status(200).send(deleted);
  }
  catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Changes the authenticated user's password after checking the old one.
 */
export const setPassword = ({ db }) => async (req, res) => {
  try {
    if (!req.body.oldPassword || !req.body.newPassword) return fail(res, 400, 'Bad Request');
    assertPassword(req.body.newPassword);
    const user = await db.findOne({ table: User, key: { id: req.user.id } });
    if (!user) return fail(res, 401, 'Incorrect Password');
    const isValid = await user.checkPassword(req.body.oldPassword);
    if (!isValid) return fail(res, 401, 'Invalid Password');
    user.password = req.body.newPassword;
    await db.save(user);
    res.status(200).send(user);
  } catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Starts a password reset: emails a 6-digit code and returns an encrypted token that holds it.
 */
export const forgotPassword = ({ db, mail }) => async (req, res) => {
  try {
    if (!req.body.email) return fail(res, 400, 'Please Provide valid email address');
    const user = await db.findOne({ table: User, key: { email: req.body.email } });
    if (!user) return fail(res, 404, 'User Not Found');

    const otp = otpGenerate();
    const token = await encryptToken({ otp, email: user.email, expireTime: Date.now() + OTP_TTL_MS });
    mail({ receiver: user.email, subject: 'Reset Passwords', body: `Your Reset Password Code : ${otp}`, type: 'text' });
    res.status(200).send({ token, email: user.email });
  } catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Verifies the 6-digit code. Returns a new token marked as verified, required by changePassword.
 */
export const verifyOtp = () => async (req, res) => {
  try {
    const data = decryptToken(req.body.token);
    if (Date.now() > data.expireTime) return fail(res, 400, 'OTP code is expired');
    if (req.body.email && req.body.email !== data.email) return fail(res, 400, 'Invalid OTP code');
    if (String(data.otp) !== String(req.body.otp)) return fail(res, 400, 'Invalid OTP code');

    const token = await encryptToken({ ...data, verified: true });
    return res.status(200).send({ status: true, message: 'Verified', token, email: data.email });
  } catch (err) {
    sendFailure(res, err);
  }
};

/**
 * Sets a new password. Requires a token that passed verifyOtp for the same email.
 */
export const changePassword = ({ db }) => async (req, res) => {
  try {
    const data = decryptToken(req.body.token);
    if (!data.verified || Date.now() > data.expireTime) throw new HttpError(400, 'Invalid or expired token');
    if (!req.body.email || req.body.email !== data.email) throw new HttpError(400, 'Invalid or expired token');
    if (!req.body.password) return fail(res, 400, 'Password is required');
    assertPassword(req.body.password);

    const user = await db.findOne({ table: User, key: { email: req.body.email } });
    if (!user) return fail(res, 404, 'User Not Found');

    user.password = req.body.password;
    await db.save(user);

    const token = await encryptToken({ ...data, otpUsed: true });
    res.status(200).send({ token, message: 'Password Successfully Updated' });
  } catch (err) {
    sendFailure(res, err);
  }
};
