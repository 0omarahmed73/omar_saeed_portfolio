'use client';

import { useEffect, useRef, useState } from 'react';
import ATLAS_FALLBACK_SVG from './atlas-fallback';

// Atlas: a pre-rendered transparent WebP of a marble model (see the credit in the footer), so no 3D runtime is loaded.
// If the image fails to load, the refined SVG figure takes its place. The Orrery positions the sphere from the figure's hands.
export default function AtlasFigure() {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef(null);

  // an error that fired before hydration never reaches React's onError, so check the image once mounted
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) return <div className="at-figure at-figure-fallback" aria-hidden="true" dangerouslySetInnerHTML={{ __html: ATLAS_FALLBACK_SVG }} />;
  return (
    <picture className="at-figure">
      <source type="image/webp" srcSet="/atlas/atlas-400.webp 400w, /atlas/atlas-600.webp 600w, /atlas/atlas-1000.webp 1000w" sizes="(max-width:600px) 60vw, (max-width:900px) 56vw, min(520px, calc((100vw - 96px) * .38))" />
      <img ref={imgRef} src="/atlas/atlas.png" alt="" width="1000" height="1100" fetchPriority="high" decoding="async" onError={() => setFailed(true)} />
    </picture>
  );
}
