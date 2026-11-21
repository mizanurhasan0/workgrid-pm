const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatTime(date) {
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  hours = hours !== 0 ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

/**
 * Activity log timestamp, for example "Mar 04 at 9:05 AM".
 * @param {Object} props
 * @param {string|number|Date} props.dateString Date value. Missing or invalid gives ''.
 * @param {boolean} props.activeTime Omit the time part.
 * @returns {string}
 */
export default function LogDateFormate({ dateString, activeTime = false }) {
  if (!dateString) {return '';}
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {return '';}
  const month = MONTHS[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  return `${month} ${day}${activeTime ? '' : ` at ${formatTime(date)}`}`;
}
