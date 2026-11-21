import React from 'react';

/**
 * On/off switch built on a real checkbox (role="switch"). Pair it with a visible label via
 * htmlFor, or pass ariaLabel.
 * @param {Object} props
 * @param {string} props.htmlFor Id of the checkbox.
 * @param {boolean} props.checked Current state.
 * @param {function} props.setChecked Called with the next state.
 * @param {function} props.onChange Extra change handler.
 * @param {string} props.ariaLabel Accessible name when there is no label element.
 * @param {boolean} props.disabled Disable the switch.
 * @returns {JSX.Element}
 */
export default function Switch({
  htmlFor = '',
  checked = false,
  setChecked = () => { },
  onChange = () => { },
  ariaLabel,
  disabled = false,
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="relative inline-flex h-11 w-14 shrink-0 cursor-pointer items-center justify-center has-disabled:cursor-not-allowed has-disabled:opacity-50"
    >
      <input
        checked={checked === true}
        id={htmlFor}
        role="switch"
        aria-checked={checked === true}
        aria-label={ariaLabel}
        disabled={disabled}
        onChange={(e) => {
          setChecked(!checked);
          onChange(e);
        }}
        className="peer sr-only"
        type="checkbox"
      />
      <span className="h-6 w-11 rounded-full bg-border-strong transition-colors peer-checked:bg-brand-solid peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring" />
      <span className="pointer-events-none absolute left-3.5 top-2.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
    </label>
  );
}
