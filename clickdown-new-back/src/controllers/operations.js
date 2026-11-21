import { HttpError } from '../utils/httpError';

/**
 * Generic data-access helpers used by all services.
 * Filters are sanitized: keys that are not paths of the model are dropped, so
 * options such as `populate` or `paginate` can never leak into a MongoDB filter.
 */

// Keys that control the query and never filter documents.
const CONTROL_KEYS = new Set(['page', 'limit', 'sortBy', 'paginate', 'populate', 'allowedQuery', 'options', 'strictPopulate', 'sort', 'query', 'body', 'id']);

const parseMaybeJson = (value) => {
  if (typeof value === 'string' && value.startsWith('{"') && value.endsWith('}')) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return value;
    }
  }
  return value;
};

/**
 * Builds a Mongo filter from a plain object, keeping only keys that exist on the model.
 * `id` is translated to `_id` and undefined values are dropped.
 */
export const buildFilter = (table, source = {}) => {
  const filter = {};
  Object.entries(source).forEach(([key, value]) => {
    if (value === undefined) return;
    if (key === 'id') {
      filter._id = value;
      return;
    }
    if (key.startsWith('$') || CONTROL_KEYS.has(key)) return;
    if (table.schema.pathType(key) === 'adhocOrUndefined') return;
    filter[key] = value;
  });
  return filter;
};

const hasFilter = (filter) => Object.keys(filter).length > 0;

/**
 * Find many documents. Paginates unless `key.paginate === false`.
 * `key.query` values are validated against `key.allowedQuery`.
 */
const find = async ({ table, key = {} }) => {
  const query = key.query || {};
  const allowed = key.allowedQuery || new Set();
  const invalid = Object.keys(query).filter((k) => !allowed.has(k) && !CONTROL_KEYS.has(k));
  if (invalid.length) throw new HttpError(400, `Invalid query parameter: ${invalid.join(', ')}`);

  const values = {};
  Object.entries(query).forEach(([k, v]) => { values[k] = parseMaybeJson(v); });

  const filter = buildFilter(table, { ...key, ...values });
  const noPaginate = key.paginate === false;
  if (noPaginate) {
    let q = table.find(filter);
    if (key.populate) q = q.populate(key.populate);
    return q;
  }

  const sort = {};
  if (values.sortBy) {
    const [field, order] = String(values.sortBy).split(':');
    sort[field] = order === 'desc' ? -1 : 1;
  } else {
    sort.createdAt = -1;
  }
  const options = {
    page: Math.max(Number(values.page) || 1, 1),
    limit: Math.min(Math.max(Number(values.limit) || 10, 1), 100),
    sort,
  };
  if (key.populate) options.populate = key.populate;
  return table.paginate(filter, options);
};

/** Find a single document by `key.id` or any other matching fields. Returns null when nothing matches. */
const findOne = async ({ table, key = {} }) => {
  const filter = buildFilter(table, key);
  if (!hasFilter(filter)) return null;
  let q = table.findOne(filter);
  if (key.populate) q = q.populate(key.populate);
  return q;
};

/** Creates and saves a document. `key.populate` is applied to the saved document. */
const create = async ({ table, key = {} }) => {
  const { populate, ...data } = key;
  const doc = new table(data);
  await doc.save();
  if (populate) await doc.populate(populate);
  return doc;
};

/** Updates fields in `key.body` on the document matching `key.id` (or other keys). */
const update = async ({ table, key = {} }) => {
  const element = await table.findOne(buildFilter(table, key));
  if (!element) return null;
  Object.entries(key.body || {}).forEach(([param, value]) => { element[param] = value; });
  await element.save();
  if (key.populate) await element.populate(key.populate);
  return element;
};

/** Deletes the document matching `key`. Resolves with the deleted document or null. */
const remove = async ({ table, key = {} }) => {
  const element = await table.findOne(buildFilter(table, key));
  if (!element) return null;
  await element.deleteOne();
  return element;
};

/** Deletes every document matching `key`. */
const removeAll = async ({ table, key = {} }) => table.deleteMany(buildFilter(table, key));

/** Saves a document instance. */
const save = async (data) => data.save();

/** Populates a document instance. Returns the input unchanged when it is null. */
const populate = async (data, payload = {}) => (data ? data.populate(payload) : data);

export { find, findOne, create, remove, update, save, removeAll, populate };
