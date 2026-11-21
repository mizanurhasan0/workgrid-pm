/**
 * Error with an HTTP status. Throw it from a handler to answer with a specific status and message.
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * Maps any thrown value to an HTTP status and a client-safe message.
 * Stack traces and internal error details are never returned to the client.
 */
export function toHttpError(err) {
  if (err instanceof HttpError) return { status: err.status, message: err.message };
  if (err?.type === 'entity.parse.failed') return { status: 400, message: 'Malformed JSON body' };
  if (err?.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((e) => e.message).join('; ');
    return { status: 400, message: details || 'Validation failed' };
  }
  if (err?.name === 'CastError') return { status: 400, message: `Invalid value for "${err.path}"` };
  if (err?.code === 11000) return { status: 409, message: 'A record with the same unique value already exists' };
  if (Number.isInteger(err?.status) && err.status >= 400 && err.status < 500) {
    return { status: err.status, message: err.expose ? err.message : 'Bad request' };
  }
  return { status: 500, message: 'Something went wrong' };
}

/** Sends a JSON error response: { status, message }. */
export function fail(res, status, message) {
  if (res.headersSent) return undefined;
  return res.status(status).json({ status, message });
}

/** Converts a thrown error into a JSON error response. Logs server-side errors only. */
export function sendFailure(res, err) {
  const { status, message } = toHttpError(err);
  if (status >= 500) console.error(err);
  return fail(res, status, message);
}
