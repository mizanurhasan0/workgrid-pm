import { fail, sendFailure } from '../../utils/httpError';
import Role from './role.schema';


/**
 * these are the array to validate the request.
 */
// const createAllowed = new Set(['name', 'department']);
const allowedQuery = new Set(['name', 'department', 'id', 'page', 'limit', 'paginate']);
// const updateAllowed = new Set(['name', 'department']);

/**
 * This function is used for getting all roles.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const getAll = ({ db }) => async (req, res) => {
  try {
    const paginate = req.query.paginate === 'false' ? false : true;
    const roles = await db.find({ table: Role, key: { query: req.query, allowedQuery: allowedQuery, paginate: paginate } });
    if (!roles) return fail(res, 404, 'No result found');
    res.status(200).send(roles);
  }
  catch (err) {
    console.log(err);
    sendFailure(res, err);
  }
};


/**
 * This function is used for creating roles.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const create = ({ db }) => async (req, res) => {
  try {
    const role = await db.create({ table: Role, key: req.body });
    res.status(200).send(role);
  }
  catch (err) {
    console.log(err);
    sendFailure(res, err);
  }
};


/**
 * This function is used for getting one role by id.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const getOne = ({ db }) => async (req, res) => {
  try {
    const role = await db.findOne({ table: Role, key: { id: req.params.id } });
    if (!role) return fail(res, 404, 'No resule found');
    res.status(200).send(role);
  }
  catch (err) {
    console.log(err);
    sendFailure(res, err);
  }
};


/**
 * This function is used for removing a role by id.
 * @param {Object} req This is the request object.
 * @param {Object} res this is the response object
 * @returns It returns the data for success response. Otherwise it will through an error.
 */
export const remove = ({ db }) => async (req, res) => {
  try {
    const role = await db.remove({ table: Role, key: { id: req.params.id } });
    if (!role) return fail(res, 404, 'No result found');
    res.status(200).send(role);
  }
  catch (err) {
    console.log(err);
    sendFailure(res, err);
  }
};


/**
 * this function is used to update one role by id.
 * @param {Object} req this is the request object.
 * @param {Object} res this is the response object.
 * @returns It returns the data for success response. Otherwise it will through an error.
 */

export const update = ({ db }) => async (req, res) => {
  try {
    const data = await db.findOne({ table: Role, key: { id: req.params.id } });
    if (!data) return fail(res, 404, 'No result found');
    Object.keys(req.body).forEach(k => (data[k] = req.body[k]));
    await db.save(data);
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    sendFailure(res, err);
  }
};