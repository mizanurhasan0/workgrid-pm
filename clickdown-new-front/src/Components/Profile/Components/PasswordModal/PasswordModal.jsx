import React, { useEffect, useId, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import req from '../../../../Utils/req';
import { useAuth } from '../../../../Context/AuthProvider';
import useDialog from '../../Hooks/useDialog';

const MIN_PASSWORD_LENGTH = 8;

function PasswordField({
  label, value, onChange, error, autoComplete, autoFocus = false,
}) {
  const id = useId();
  const [shown, setShown] = useState(false);
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-base text-text">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          data-autofocus={autoFocus ? '' : undefined}
          className={`h-12 w-full rounded-lg border bg-surface pl-4 pr-16 text-base text-text ${error ? 'border-danger' : 'border-border'}`}
        />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-pressed={shown}
          className="absolute right-1 top-1 h-10 rounded-md px-3 text-sm font-medium text-brand focus-visible:outline-2 focus-visible:outline-focus-ring"
        >
          {shown ? 'Hide' : 'Show'}
          <span className="sr-only">{` ${label.toLowerCase()}`}</span>
        </button>
      </div>
      {error ? <p id={`${id}-error`} role="alert" className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

const validate = ({ oldPassword, newPassword, confirmPassword }) => {
  const errors = {};
  if (!oldPassword) {errors.oldPassword = 'Enter your current password.';}
  if (newPassword.length < MIN_PASSWORD_LENGTH) {errors.newPassword = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;}
  else if (newPassword === oldPassword) {errors.newPassword = 'The new password must differ from the old one.';}
  if (confirmPassword !== newPassword) {errors.confirmPassword = 'Passwords do not match.';}
  return errors;
};

/**
 * Change-password dialog inside the profile settings. A sheet on phones, a dialog on larger screens.
 * @param {Object} props
 * @param {boolean} props.open Whether the dialog is open.
 * @param {function} props.setOpen Opens or closes the dialog.
 * @returns {JSX.Element}
 */
export default function PasswordModal({ setOpen }) {
  const [values, setValues] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const ref = useRef(null);
  useDialog(ref);

  useEffect(() => {
    const onEscape = (e) => { if (e.key === 'Escape') {setOpen(false);} };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [setOpen]);

  const update = (key) => (value) => {
    const next = { ...values, [key]: value };
    setValues(next);
    if (submitted) {setErrors(validate(next));}
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setSubmitted(true);
    setErrors(found);
    if (Object.keys(found).length > 0) {return;}
    const fd = new FormData();
    Object.keys(values).forEach((key) => fd.append(key, values[key]));
    setIsLoading(true);
    req({ method: 'PATCH', uri: `user/setpassword/${user?.id}`, data: fd })
      .then(() => {
        toast.success('Password updated.');
        setOpen(false);
      })
      .catch((err) => toast.error(err?.serverMessage || 'Could not update the password.'))
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="fixed inset-0 z-popover flex items-stretch justify-center bg-scrim sm:items-center sm:p-6" data-nested-modal onMouseDown={(e) => { if (e.target === e.currentTarget) {setOpen(false);} }}>
      <section
        ref={ref}
        tabIndex={-1}
        style={{ outline: 'none' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="set-password-title"
        className="flex outline-none h-dvh w-full flex-col bg-surface-raised text-text shadow-elevated sm:h-auto sm:max-h-full sm:max-w-md sm:rounded-lg"
      >
        <form noValidate autoComplete="off" onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
          <h2 id="set-password-title" className="px-4 py-4 text-lg! font-semibold sm:px-6">Set password</h2>
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4 sm:px-6">
            <PasswordField label="Old password" value={values.oldPassword} onChange={update('oldPassword')} error={errors.oldPassword} autoComplete="current-password" autoFocus />
            <PasswordField label="New password" value={values.newPassword} onChange={update('newPassword')} error={errors.newPassword} autoComplete="new-password" />
            <PasswordField label="Confirm password" value={values.confirmPassword} onChange={update('confirmPassword')} error={errors.confirmPassword} autoComplete="new-password" />
            <p className="text-sm text-text-muted">{`Use at least ${MIN_PASSWORD_LENGTH} characters.`}</p>
          </div>
          <div className="flex gap-3 border-t border-border px-4 py-3 sm:justify-end sm:px-6">
            <button type="button" disabled={isLoading} onClick={() => setOpen(false)} className="h-11 flex-1 rounded-full border border-border px-6 text-sm font-medium text-text-muted hover:bg-surface-alt focus-visible:outline-2 focus-visible:outline-focus-ring sm:h-10 sm:flex-none">Cancel</button>
            <button type="submit" disabled={isLoading} className="h-11 flex-1 rounded-full bg-brand-solid px-6 text-sm font-medium text-on-brand hover:bg-brand-solid-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring disabled:opacity-60 sm:h-10 sm:flex-none">{isLoading ? 'Saving...' : 'Submit'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
