/**
 * Turns an axios error into a message that is safe to show to the user.
 * The backend answers with { status, message }; network failures have no response.
 * @param {Object} error - The error thrown by req().
 * @param {string} fallback - Message used when nothing more useful is known.
 * @returns {string}
 */
export default function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) {return data;}
  if (typeof data?.message === 'string' && data.message.trim()) {return data.message;}
  if (error && !error.response) {return 'Check your network connection and try again.';}
  return fallback;
}
