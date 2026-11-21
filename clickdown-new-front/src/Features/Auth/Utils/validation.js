// Optional: when VITE_ACCOUNT_DOMAIN is set, a bare username is completed with that domain.
export const ACCOUNT_DOMAIN = import.meta.env.VITE_ACCOUNT_DOMAIN || '';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9_.-]+$/;

/** react-hook-form rule: returns true or an error message. */
export const validateEmail = (value = '') => {
  const v = value.trim();
  if (!v) {return 'Enter your email';}
  const ok = v.includes('@') ? EMAIL_RE.test(v) : USERNAME_RE.test(v);
  return ok ? true : 'Enter a valid email address';
};

/** Adds the account domain when only a username was typed. */
export const normaliseEmail = (value = '') => {
  const v = value.trim();
  return v.includes('@') || !ACCOUNT_DOMAIN ? v : `${v}@${ACCOUNT_DOMAIN}`;
};

/** react-hook-form rule for new passwords. */
export const validatePassword = (value = '') => (value.length >= 8 ? true : 'Password must be at least 8 characters');
