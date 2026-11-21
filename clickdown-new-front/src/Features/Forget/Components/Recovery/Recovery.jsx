import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForgetCtx } from '../../Context/ForgetProvider';
import AuthButton from '../../../Auth/Components/AuthButton/AuthButton';
import errorMessage from '../../../Auth/Utils/errorMessage';
import { VerifyIn } from '../Handler';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

// Shows the address without exposing it in full, e.g. "j••••••••@example.com".
const maskEmail = (email = '') => email.replace(/^(.).*(@.*)$/, '$1••••••••$2');

export default function Recovery() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const { onForget, frgData } = useForgetCtx();
  const [digits, setDigits] = useState(() => Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const inputs = useRef([]);

  // Start typing right away: the first digit box takes focus when the step opens.
  useEffect(() => { inputs.current[0]?.focus(); }, []);

  // Counts down until the code may be requested again; the interval is cleaned up on unmount.
  useEffect(() => {
    if (cooldown <= 0) {return undefined;}
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  if (!frgData?.token) {return <Navigate to="/forget/email" replace />;}

  const focusAt = (idx) => inputs.current[idx]?.focus();

  const onChange = (idx, raw) => {
    const value = raw.replace(/\D/g, '').slice(-1);
    setDigits((prev) => prev.map((d, i) => (i === idx ? value : d)));
    setError('');
    if (value && idx < OTP_LENGTH - 1) {focusAt(idx + 1);}
  };

  const onKeyDown = (idx, e) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      e.preventDefault();
      setDigits((prev) => prev.map((d, i) => (i === idx - 1 ? '' : d)));
      focusAt(idx - 1);
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      focusAt(idx - 1);
    } else if (e.key === 'ArrowRight' && idx < OTP_LENGTH - 1) {
      e.preventDefault();
      focusAt(idx + 1);
    }
  };

  const onPaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!text) {return;}
    e.preventDefault();
    setDigits(Array.from({ length: OTP_LENGTH }, (_, i) => text[i] || ''));
    setError('');
    focusAt(Math.min(text.length, OTP_LENGTH) - 1);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) {return;}
    const otp = digits.join('');
    if (otp.length !== OTP_LENGTH) {
      setError('Enter all 6 digits of the code.');
      focusAt(Math.max(0, digits.findIndex((d) => !d)));
      return;
    }
    setSubmitting(true);
    try {
      await onForget('user/otp/verify', { otp, token: frgData.token, email: frgData.email });
      navigate(`/forget/recovery${search}`);
    } catch (err) {
      const message = errorMessage(err, 'The code is not valid. Please try again.');
      setError(message);
      toast.error(message);
      setSubmitting(false);
      setDigits(Array(OTP_LENGTH).fill(''));
      focusAt(0);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || submitting) {return;}
    setCooldown(RESEND_SECONDS);
    try {
      await onForget('user/forgot/password', { email: frgData.email });
      toast.success('We sent a new code.');
    } catch (err) {
      setCooldown(0);
      toast.error(errorMessage(err, 'Could not send the code. Please try again.'));
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <p className="text-center text-sm leading-5 text-text-muted">
        We sent a 6-digit code to
        {' '}
        <span className="font-semibold text-text">{maskEmail(frgData.email)}</span>
      </p>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        <div role="group" aria-label="Verification code" className="flex justify-center gap-2 sm:gap-3">
          {digits.map((value, index) => (
            <VerifyIn
              // Position is the identity here: the six inputs never reorder.
              key={index}
              index={index}
              value={value}
              invalid={Boolean(error)}
              disabled={submitting}
              inputRef={(el) => { inputs.current[index] = el; }}
              onChange={onChange}
              onKeyDown={onKeyDown}
              onPaste={onPaste}
            />
          ))}
        </div>
        {error ? <p role="alert" className="text-center text-sm leading-5 text-danger">{error}</p> : null}
        <AuthButton busy={submitting} busyLabel="Verifying...">Verify</AuthButton>
      </form>
      <div className="flex flex-col items-center">
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="min-h-11 rounded px-2 text-base font-medium text-brand underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring disabled:cursor-not-allowed disabled:text-text-muted disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
        <Link to={`/forget/email${search}`} replace className="flex min-h-11 items-center rounded px-2 text-base text-text-muted underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-focus-ring">
          Use a different email
        </Link>
      </div>
    </div>
  );
}
