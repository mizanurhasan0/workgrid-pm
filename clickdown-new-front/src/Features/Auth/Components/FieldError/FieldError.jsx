import React from 'react';

/**
 * Inline validation message shown under a field. Link it to its input with aria-describedby={id}.
 * @param {String} id The element id the input points to.
 * @param {String} message The error text, nothing is rendered when empty.
 */
export default function FieldError({ id, message }) {
  if (!message) {return null;}
  return (
    <p id={id} role="alert" className="text-sm leading-5 text-danger">
      {message}
    </p>
  );
}
