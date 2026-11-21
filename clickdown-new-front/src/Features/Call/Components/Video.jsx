import React, { useEffect, useRef } from 'react';

export default function Video({
  muted = false, poster = '', stream = null, className = '',
}) {
  const vidRef = useRef(null);

  useEffect(() => {
    if (vidRef.current) {vidRef.current.srcObject = stream;}
  }, [stream]);

  return (
    <video
      className={className}
      muted={muted}
      ref={vidRef}
      autoPlay
      playsInline
      controls={false}
      poster={poster}
    >
      <track kind="captions" />
    </video>
  );
}
