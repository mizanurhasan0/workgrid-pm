import React, { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import FieldError from '../FieldError/FieldError';

/**
 * Labelled text field with the validation message under it.
 * Password fields get a show/hide toggle and a caps-lock hint.
 * @param {string} label Visible label.
 * @param {string} error Validation message, empty when valid.
 * @param {Object} registration The object returned by react-hook-form register().
 * @param {string} type Input type; `password` adds the toggle.
 * @param {string} hint Optional helper text under the field.
 */
export default function AuthField({
  label, error, registration, type = 'text', hint, autoComplete, inputMode, placeholder, disabled, autoFocus,
}) {
  const uid = useId().replace(/:/g, '');
  const id = `field-${uid}`;
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const isPassword = type === 'password';
  const [visible, setVisible] = useState(false);
  const [caps, setCaps] = useState(false);
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  const onCaps = (e) => {
    if (isPassword && e.getModifierState) {setCaps(e.getModifierState('CapsLock'));}
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium leading-5 text-text">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? 'text' : type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...registration}
          onKeyUp={onCaps}
          onKeyDown={onCaps}
          onBlur={(e) => {
            setCaps(false);
            registration?.onBlur?.(e);
          }}
          className={`block h-12 w-full rounded-lg border bg-surface-raised px-4 text-base leading-6 text-text placeholder:text-text-muted/80 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus-ring/40 focus-visible:border-focus-ring disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? 'border-danger' : 'border-border-strong/60'
          } ${isPassword ? 'pr-12' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-lg text-text-muted hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/60"
          >
            {visible ? <EyeOff aria-hidden="true" className="h-5 w-5" /> : <Eye aria-hidden="true" className="h-5 w-5" />}
          </button>
        )}
      </div>
      {caps && <p className="text-sm leading-5 text-warning">Caps Lock is on.</p>}
      <FieldError id={errorId} message={error} />
      {hint && !error && <p id={hintId} className="text-sm leading-5 text-text-muted">{hint}</p>}
    </div>
  );
}
