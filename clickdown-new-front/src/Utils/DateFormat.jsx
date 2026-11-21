const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Formats a date as "DD Mon YYYY". Empty or invalid input gives ''.
 * @param {string|number|Date} dateString Date value.
 * @returns {string}
 */
export default function DateFormate(dateString) {
  if (!dateString) {return '';}
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {return '';}
  const day = String(date.getDate()).padStart(2, '0');
  return `${day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}
