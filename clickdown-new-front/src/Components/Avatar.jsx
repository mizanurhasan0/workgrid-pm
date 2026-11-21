import React from 'react';
import { Avatar2 } from '../assets';

const SIZES = {
  xs: 'w-[1.5em] h-[1.5em]',
  sm: 'w-[2em] h-[2em]',
  md: 'w-[2.5em] h-[2.5em]',
  large: 'w-[2.625em] h-[2.625em]',
  xl: 'w-[3em] h-[3em]',
  xl2: 'w-[17.063em] h-[16.438em]',
  xl3: 'w-[20.25em] h-[25.563em]',
};

/**
 * User avatar with the default avatar as fallback.
 * @param {Object} props
 * @param {string} props.src Stored avatar path or URL.
 * @param {string} props.size Key of SIZES.
 * @param {string} props.alt Alternative text.
 * @returns {JSX.Element}
 */
export default function Avatar({
  src, size, className = '', alt = 'Avatar',
}) {
  const url = !src
    ? Avatar2
    : (src.startsWith('https://') ? src : `${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}/${src}`);
  return (
    <img
      src={url}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = Avatar2;
      }}
      className={`rounded-full object-cover bg-surface-alt ${SIZES[size] ?? ''} ${className}`}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}
