import React from 'react';

const SIZES = {
  sm: 'h-control-sm px-3 text-sm',
  md: 'h-control-md px-4 text-sm',
  lg: 'h-control-lg px-6 text-sm',
};

/**
 * A dynamic button which can be used all over the site.
 * Sizes are 32 / 40 / 48px high. Pass your own bg-* / text-* classes in className to override the default colors.
 * @param {String} type The type of the button.
 * @param {Object} children The Object of the button children.
 * @param {boolean} disabled Disables the button.
 * @param {string} className Extra classes. A bg-* class replaces the default brand background, a text-* class the default text color.
 * @param {function} onClick Click handler.
 * @param {'sm'|'md'|'lg'} [size='lg'] Optional height preset (32/40/48px).
 * @param {boolean} [loading] Optional. Shows a spinner, sets aria-busy and blocks clicks.
 * @returns The proper button with specified params.
 */
export default function Btn({
  type = 'button',
  className = '',
  children = 'button',
  disabled = false,
  onClick = () => { },
  size = 'lg',
  loading = false,
  ...rest
}) {
  const hasBg = /(^|\s)bg-/.test(className);
  const hasText = /(^|\s)text-/.test(className);
  return (
    <button
      {...rest}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      type={type}
      className={[
        'inline-flex items-center justify-center gap-2 select-none whitespace-nowrap font-semibold leading-none',
        'rounded-control box-border transition-colors duration-150 active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100',
        'pointer-coarse:min-h-tap',
        SIZES[size] ?? SIZES.lg,
        hasBg ? '' : 'bg-brand-solid hover:bg-brand-solid-hover',
        hasText ? '' : 'text-on-brand',
        className,
      ].filter(Boolean).join(' ')}
    >
      {loading ? (
        <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      {children}
    </button>
  );
}
