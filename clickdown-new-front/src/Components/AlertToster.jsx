import { toast } from 'react-toastify';

const VARIANTS = ['success', 'error', 'warning', 'info'];

/**
 * Shows a toast in the ToastContainer mounted in App.jsx.
 * Unknown variants fall back to 'info' instead of throwing.
 * @param {string} message The text to show.
 * @param {string} [variant='info'] One of success, error, warning, info.
 * @returns {string} The message, so callers can reuse it.
 */
export default function AlertToster(message, variant = 'info') {
  const kind = VARIANTS.includes(variant) ? variant : 'info';
  // The message doubles as the id, so the same text is never stacked while it is still visible.
  toast[kind](message, { toastId: `${kind}:${message}` });
  return message;
}
