import { randomBytes, createCipheriv, createDecipheriv, createHash } from 'crypto';
import { HttpError } from './httpError';

/**
 * Encrypted, tamper-proof tokens for the password-reset flow (AES-256-GCM, key derived from SECRET).
 * Format: base64url(iv | authTag | ciphertext)
 */
const key = () => createHash('sha256').update(String(process.env.SECRET)).digest();

/**
 * Encrypts a JSON-serialisable payload.
 * @param {Object} data Payload to protect.
 * @returns {Promise<string>} The encrypted token.
 */
export const encryptToken = async (data) => {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
};

/**
 * Decrypts a token produced by encryptToken. Throws an HttpError(400) for anything invalid.
 * @param {string} token The encrypted token.
 * @returns {Object} The original payload.
 */
export const decryptToken = (token) => {
  try {
    const buf = Buffer.from(String(token || ''), 'base64url');
    if (buf.length < 29) throw new Error('short token');
    const decipher = createDecipheriv('aes-256-gcm', key(), buf.subarray(0, 12));
    decipher.setAuthTag(buf.subarray(12, 28));
    const text = Buffer.concat([decipher.update(buf.subarray(28)), decipher.final()]).toString('utf8');
    return JSON.parse(text);
  } catch (e) {
    throw new HttpError(400, 'Invalid or expired token');
  }
};
