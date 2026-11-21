import React, { useId, useRef } from 'react';
import { Alert } from '../assets';
import SVGIcon from './SVGIcon';

const PATTERNS = {
  name: '^[a-zA-Z0-9]+$',
};

const SIZES = { sm: 'h-control-sm text-sm', md: 'h-control-md', lg: 'h-control-lg' };

/**
 * A dynamic input field which can be used all over the site.
 * The label is tied to the control with for/id, the validation message is wired with aria-describedby
 * and shown (role=alert) when the browser reports the value invalid.
 * @param {String} Variant The element to render (input, textarea, ...).
 * @param {String} label The label; also used to build the input id.
 * @param {Boolean} required Make the input field required (adds a * marker).
 * @param {Boolean} disabled Disable the input.
 * @param {String} pattern Key of a built-in pattern (name) or undefined.
 * @param {Object} register Extra props, usually from react-hook-form register().
 * @param {'sm'|'md'|'lg'} [size='lg'] Optional height preset (32/40/48px) for single-line inputs.
 * @param {String} [error] Optional externally controlled error text; shows the error state.
 * @param {String} [hint] Optional helper text under the field.
 * @returns {JSX.Element} The labelled input with an accessible validation message.
 */
export default function Input({
  Variant = 'input',
  type = 'text',
  className = '',
  label = 'Label',
  placeholder = 'input',
  required = false,
  disabled = false,
  activeLabel = true,
  register,
  pattern,
  size = 'lg',
  error = '',
  hint = '',
  validationMsg = `Please enter a valid ${label.toLowerCase()}`,
}) {
  const uid = useId();
  const inputId = `${label.trim().replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase() || 'field'}-${uid.replace(/:/g, '')}`;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const errorRef = useRef();

  const setError = (field, visible) => {
    if (errorRef.current) {errorRef.current.hidden = !visible;}
    if (field) {field.setAttribute('aria-invalid', visible ? 'true' : 'false');}
  };
  const showError = (e) => {
    e.preventDefault();
    setError(e.currentTarget, true);
  };
  const hideError = (e) => setError(e.currentTarget, false);
  const describedBy = [errorId, hint ? hintId : ''].filter(Boolean).join(' ');

  return (
    <div className="flex min-w-0 flex-col gap-1.5 box-border">
      {activeLabel ? (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
          {required ? <span aria-hidden="true" className="ml-0.5 text-danger">*</span> : null}
        </label>
      ) : null}
      <Variant
        id={inputId}
        required={required}
        disabled={disabled}
        type={Variant === 'input' ? type : undefined}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : undefined}
        aria-label={activeLabel ? undefined : label}
        {...register}
        pattern={PATTERNS[pattern]}
        placeholder={placeholder}
        onInvalid={showError}
        onInput={hideError}
        className={`commonInput w-full min-w-0 rounded-control border bg-surface px-4 text-base text-text placeholder:text-text-muted transition-colors outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-text-muted ${error ? 'border-danger' : 'border-border-strong'} ${Variant === 'input' ? SIZES[size] ?? SIZES.lg : 'py-3 min-h-24'} ${className}`}
      />
      {hint ? <p id={hintId} className="text-sm text-text-muted">{hint}</p> : null}
      <p
        id={errorId}
        ref={errorRef}
        hidden={!error}
        role="alert"
        className="flex items-start gap-2 text-sm font-medium text-danger"
      >
        <SVGIcon Icon={Alert} className="mt-0.5 h-4 w-4 shrink-0 stroke-danger" />
        <span>{error || validationMsg}</span>
      </p>
    </div>
  );
}
