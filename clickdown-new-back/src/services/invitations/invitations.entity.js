import { fail, sendFailure } from '../../utils/httpError';
import fs from 'fs';
import path from 'path';
import Invitation from './invitaions.schema';

const createAllowed = new Set(['email', 'access', 'projects', 'link']);
const canInvite = (user) => ['owner', 'admin'].includes(user?.role?.name);

/**
 * The invite form sends `projects` as JSON text ("[\"a\",\"b\"]"); API clients may send a real array.
 * Always store a flat array of non-empty strings (project ids or names).
 */
export const normaliseProjects = (value) => {
  let list = value;
  if (typeof list === 'string') {
    try { list = JSON.parse(list); } catch { list = [list]; }
  }
  if (!Array.isArray(list)) list = list ? [list] : [];
  return [...new Set(list.map((item) => String(item).trim()).filter(Boolean))];
};


/**
 * This function is used for creating invitaions.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const create = ({ db, mail }) => async (req, res) => {
  try {
    if (!canInvite(req.user)) return fail(res, 403, 'Forbidden');
    const isValid = Object.keys(req.body).every((key) => createAllowed.has(key));
    if (!isValid) return fail(res, 400, 'Bad Request');
    const invitation = await db.create({ table: Invitation, key: { ...req.body, projects: normaliseProjects(req.body.projects) } });
    // const link = JSON.stringify(req.body.projects);
    // console.log(link.replace(/\[|\]/g, ''));
    const template = await fs.promises.readFile(path.join(__dirname, 'templates', 'email.html'), 'utf8');
    const replaced = template
      .replace(/{{INVITE_LINK}}/g, req.body.link)
      .replace(/{{LOGO_URL}}/g, `${process.env.SERVER_API}/images/workgrid-logo.png`);
    mail({ receiver: req.body.email, subject: 'Invitation for joining Workgrid', body: replaced, type: 'html' });
    res.status(200).send(invitation);
  }
  catch (err) {
    console.log(err);
    sendFailure(res, err);
  }
};

export const getAll = ({ db }) => async (req, res) => {
  try {
    if (!canInvite(req.user)) return fail(res, 403, 'Forbidden');
    const invitations = await db.find({ table: Invitation, key: { query: {}, paginate: false } });
    res.status(200).send(invitations);
  }
  catch (err) {
    console.log(err);
    sendFailure(res, err);
  }
};