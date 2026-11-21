import React from 'react';
import { ProjectImg } from '../assets';

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
 * Resolves a stored image path to a URL. Missing paths use the placeholder image.
 * @param {string} src Absolute https URL or a server-relative path.
 * @returns {string} The URL to load.
 */
export function resolveImageSrc(src) {
  if (!src) {return ProjectImg;}
  if (src.startsWith('https://')) {return src;}
  return `${import.meta.env.VITE_SERVER_URL || 'http://localhost:4000'}/${src}`;
}

/**
 * Image with a placeholder for missing or broken sources.
 * @param {Object} props
 * @param {string} props.src Stored image path or URL.
 * @param {string} props.size Key of SIZES.
 * @param {string} props.alt Alternative text.
 * @returns {JSX.Element}
 */
export default function Image({
  src, size, className = '', alt = 'Image',
}) {
  return (
    <img
      src={resolveImageSrc(src)}
      onError={(e) => {
        e.currentTarget.onerror = null;
        e.currentTarget.src = ProjectImg;
      }}
      className={`${SIZES[size] ?? ''} ${className}`}
      alt={alt}
      loading="lazy"
      decoding="async"
    />
  );
}
