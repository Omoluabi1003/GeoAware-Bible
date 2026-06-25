'use client';

import { useCallback, useState } from 'react';
import { CssEarthRenderer } from './CssEarthRenderer.jsx';
import { RealEarthRenderer } from './RealEarthRenderer.jsx';

/**
 * Renderer boundary for Project Earth.
 *
 * The app passes only visual intent: focus, rotation, and signalLabel. This
 * boundary can attempt the real renderer while keeping the previous CSS globe as
 * a safe fallback for browsers or devices without WebGL support.
 */
export function EarthRenderer({
  focus = { x: 50, y: 50 },
  rotation = { x: 0, y: 0 },
  signalLabel = 'Earth signal'
}) {
  const [useFallback, setUseFallback] = useState(false);
  const handleUnavailable = useCallback(() => setUseFallback(true), []);

  if (useFallback) {
    return <CssEarthRenderer signalLabel={signalLabel} />;
  }

  return (
    <RealEarthRenderer
      focus={focus}
      rotation={rotation}
      signalLabel={signalLabel}
      onUnavailable={handleUnavailable}
    />
  );
}
