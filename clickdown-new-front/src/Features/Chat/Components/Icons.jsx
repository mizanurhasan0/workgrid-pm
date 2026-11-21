import React from 'react';
import {
  AI,
  AVI,
  CLEAN,
  DOC,
  DOCS,
  GIF,
  JPG,
  MKV,
  MP3,
  PDF,
  PPT,
  SVG,
  TXT,
} from '../../../assets';
import SVGIcon from '../../../Components/SVGIcon';

export default function Icons({ location, className }) {
  const Types = {
    AI,
    AVI,
    CLEAN,
    DOC,
    DOCS,
    GIF,
    JPG,
    MKV,
    MP3,
    PDF,
    PPT,
    SVG,
    TXT,
  };

  const fileName = ((location || '').split('.').pop() || 'CLEAN').toUpperCase();
  return (
    <SVGIcon Icon={Types[fileName] || CLEAN} className={className} />
  );
}
