/**
 * Lists the href values of anchor tags in an HTML string.
 * @param {string} message HTML source.
 * @returns {string[]}
 */
export default function LinkDetect(message = '') {
  const text = String(message);
  const regex = /<a\s+href="([^"]+)"/g;
  const urls = [];
  let match = regex.exec(text);
  while (match !== null) {
    urls.push(match[1]);
    match = regex.exec(text);
  }
  return urls;
}
