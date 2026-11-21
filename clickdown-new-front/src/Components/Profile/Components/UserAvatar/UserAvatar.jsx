import React from 'react';
import { Avatar2 } from '../../../../assets';

/**
 * Round profile photo with a fallback image when the source is missing or broken.
 * @param {Object} props
 * @param {string} props.src Stored image path or URL.
 * @param {string} props.alt Alternative text.
 * @param {string} props.className Size classes; defaults to 40px.
 * @returns {JSX.Element}
 */
export default function UserAvatar({
  src = '',
  alt = 'User avatar',
  className = 'h-10 w-10',
}) {
  let imgSrc = src || Avatar2;
  if (imgSrc.startsWith('images')) {imgSrc = `${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}/${src}`;}
  return (
    <img
      className={`${className} shrink-0 rounded-full bg-surface-alt object-cover`}
      src={imgSrc}
      alt={alt}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = Avatar2;
      }}
    />
  );
}
