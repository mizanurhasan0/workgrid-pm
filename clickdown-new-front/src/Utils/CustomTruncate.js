/**
 * Shortens long names to "first 12 ...... last 12" characters.
 * @param {string} name The text to shorten.
 * @returns {string}
 */
export default function CustomTruncate(name = '') {
  if (name.length > 30) {
    return `${name.slice(0, 12)} ...... ${name.slice(-12)}`;
  }
  return name;
}
