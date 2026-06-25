'use client';

import { useCallback, useState } from 'react';
import { CssEarthRenderer } from './CssEarthRenderer.jsx';
import { RealEarthRenderer } from './RealEarthRenderer.jsx';

/**
 * Renderer boundary for Project Earth.
 *
 * The app passes only visual intent: coordinate, rotation, and signalLabel. This
 * boundary can attempt the real renderer while keeping the previous CSS globe as
 * a safe fallback for browsers or devices without WebGL support.
 */
export function EarthRenderer({
  coordinates = { latitude: 0, longitude: 0 },
  rotation = { x: 0, y: 0 },
  signalLabel = 'Earth signal',
  activeLocationLabel = '',
  activeCountryHighlight = null,
  isTransitioning = false
}) {
  const [useFallback, setUseFallback] = useState(false);
  const handleUnavailable = useCallback(() => setUseFallback(true), []);

  if (useFallback) {
    return <CssEarthRenderer coordinates={coordinates} rotation={rotation} signalLabel={signalLabel} activeLocationLabel={activeLocationLabel} activeCountryHighlight={activeCountryHighlight} />;
  }

  return (
    <RealEarthRenderer
      coordinates={coordinates}
      rotation={rotation}
      signalLabel={signalLabel}
      activeLocationLabel={activeLocationLabel}
      activeCountryHighlight={activeCountryHighlight}
      onUnavailable={handleUnavailable}
      isTransitioning={isTransitioning}
    />
  );
}
