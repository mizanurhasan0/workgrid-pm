/**
 * Plain text of a stored message (HTML or Markdown) for one-line previews.
 * DOMParser builds an inert document, so nothing in the message runs or loads.
 * @param {string} message stored message body
 * @returns {string} text without markup
 */
export default function plainText(message = '') {
  if (!message) {return '';}
  const doc = new DOMParser().parseFromString(String(message), 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}
