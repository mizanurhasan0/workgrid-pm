import React from 'react';
import AuthFormTitle from '../../Auth/Components/FormTitle/FormTitle';

const copy = {
  otp: {
    title: 'Account recovery',
    text: 'To keep your account safe, Workgrid wants to make sure it is really you.',
  },
  recovery: {
    title: 'Choose a new password',
    text: 'Use at least 8 characters you have not used before.',
  },
  default: {
    title: 'Forgot your password?',
    text: 'Enter the email linked to your account and we will send you a code.',
  },
};

function FormTitle({ param }) {
  const content = copy[param] || copy.default;
  return <AuthFormTitle title={content.title} subtitle={content.text} />;
}

/**
 * One digit of the verification code.
 * The parent owns the value and the focus handling.
 */
function VerifyIn({
  value, index, inputRef, onChange, onKeyDown, onPaste, invalid, disabled,
}) {
  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      autoComplete={index === 0 ? 'one-time-code' : 'off'}
      aria-label={`Verification code digit ${index + 1}`}
      aria-invalid={invalid ? 'true' : 'false'}
      disabled={disabled}
      value={value}
      onChange={(e) => onChange(index, e.target.value)}
      onKeyDown={(e) => onKeyDown(index, e)}
      onPaste={onPaste}
      onFocus={(e) => e.target.select()}
      className={`h-14 w-11 min-w-0 max-w-14 flex-1 rounded-lg border bg-surface-raised text-center text-xl font-semibold text-text outline-none transition-colors focus-visible:border-focus-ring focus-visible:ring-2 focus-visible:ring-focus-ring/40 disabled:opacity-60 ${
        invalid ? 'border-danger' : 'border-border-strong/60'
      }`}
    />
  );
}

export { FormTitle, VerifyIn };
