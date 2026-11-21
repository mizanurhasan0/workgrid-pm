import { randomInt } from 'node:crypto';

/**
 * Generates a random 6-digit numeric code.
 * @returns {string}
 */
export default function otpGenerate() {
  return String(randomInt(0, 1000000)).padStart(6, '0');
}
