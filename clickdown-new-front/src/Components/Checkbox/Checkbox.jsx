import React, { useId } from 'react';
import checkStyle from './checkbox.module.css';

/**
 * A checkbox with an optional text label.
 * @param {Object} props
 * @param {boolean} props.checked Current state.
 * @param {function} props.setChecked Called with the next state on change.
 * @param {string} props.htmlFor Id of the input; generated when omitted.
 * @param {string} props.labelTitle Visible label text. Pass '' to hide it.
 * @param {string} props.className Extra classes for the label text.
 * @param {boolean} [props.disabled] Optional. Disables the checkbox.
 * @param {string} [props.ariaLabel] Optional accessible name when labelTitle is empty.
 * @returns {JSX.Element}
 */
export default function Checkbox({
  setChecked = () => { },
  checked = false,
  htmlFor = '',
  className = '',
  labelTitle = '',
  disabled = false,
  ariaLabel,
}) {
  const generatedId = useId();
  const inputId = htmlFor || generatedId;
  return (
    <div className="flex items-center">
      <label className={checkStyle.container}>
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          aria-label={labelTitle ? undefined : ariaLabel}
          onChange={() => setChecked(!checked)}
        />
        <span className={checkStyle.checkmark} aria-hidden="true" />
      </label>
      {labelTitle ? <label htmlFor={inputId} className={`pl-2 cursor-pointer select-none ${className}`}>{labelTitle}</label> : ''}
    </div>
  );
}
